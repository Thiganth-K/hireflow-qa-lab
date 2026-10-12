# Defect Reports & Bug Tracking: HireFlow QA Lab

**Platform**: HireFlow QA Lab  
**QA Assessment Evaluation**: Candidate Submission  
**Tracking Cycle**: Phase 1 through Phase 5  

---

## 1. Professional Defect Report Template

For logging new defects discovered during exploratory, manual, or automated testing, use the standardized template below:

```markdown
### [BUG-XXX] <Concise, Imperative Defect Title>

- **Status**: [New | Open | In Progress | Resolved | Closed | Cannot Reproduce]
- **Severity**: [Critical (S1) | Major (S2) | Minor (S3) | Trivial (S4)]
- **Priority**: [P0 | P1 | P2 | P3]
- **Component / Area**: [e.g. Catalog / Dynamic Routing / Application Form / API / Repository]
- **Environment**:
  - OS: Windows 11 / macOS / Linux
  - Node.js: v22.x
  - Framework: Next.js 16.4.0 (Turbopack) / React 19.3.0
  - Browser: Chromium 1248 (Headless / Desktop)
  - URL / Endpoint: e.g. `http://localhost:3000/jobs/job-qa-lead-001`
- **Preconditions**:
  - Detailed pre-requisites before executing the steps.

#### Steps to Reproduce:
1. Step 1...
2. Step 2...
3. Step 3...

#### Expected Behavior:
Clear statement of what the application should do according to specifications.

#### Actual Behavior:
Precise description of what actually occurred, including unexpected errors, UI freezes, or invalid data states.

#### Reproducibility:
[100% (Deterministic) | Intermittent (~X%) | One-off]

#### Evidence / Diagnostics:
- Console Logs / Network Payloads:
- Screenshots / Recordings:
- Stack Traces (if any):

#### Root Cause Analysis (Optional):
Technical investigation pointing to specific file lines or framework incompatibilities.

#### Recommended Fix / Regression Test:
Proposed remediation and corresponding test case ID.
```

---

## 2. Current Open Defects Summary

> **Current Open Defects Status**: **0 Confirmed Open Defects**  
> All 12 automated Playwright tests pass cleanly (100% pass rate). Static type-checking (`npx tsc --noEmit`), linting (`npm run lint`), and production build compilation (`npm run build`) pass with 0 errors. No confirmed open functional defects remain in the current application build.

---

## 3. Historical Defects Discovered and Resolved

During the incremental development and test automation phases, the following genuine defects and framework race conditions were uncovered, investigated, and remediated. They are preserved here as authentic QA engineering evidence:

---

### [DEFECT-RES-001] Native HTML Form Submission Occurred Before React Event Listeners Hydrated

- **Status**: **RESOLVED** (Verified by Scenarios 3, 4, 5)
- **Severity**: Major (S2)
- **Priority**: P0 (Blocker for E2E Automation)
- **Component**: `src/components/ApplicationForm.tsx`
- **Environment**: Next.js 16.4.0, React 19.3.0, Playwright Chromium

#### Summary:
In automated test execution, fast browser clicks on `<button type="submit">` occurred before React client hydration attached the synthetic `onSubmit` event listener, causing the browser to trigger a native HTML GET/POST document reload and bypassing client validation.

#### Steps to Reproduce:
1. Start dev server and load `/jobs/job-qa-lead-001`.
2. As soon as the DOM renders the submit button, immediately issue `page.locator('#submit-application-btn').click()` without entering any text.
3. Observe browser behavior.

#### Expected Behavior:
React `handleSubmit` should catch the event, invoke `e.preventDefault()`, execute `validateApplicationInput`, and display accessible validation error alerts (`data-testid="error-fullName"`).

#### Actual Behavior:
Native browser form submit triggered a full document reload to `/jobs/job-qa-lead-001`. Form state reset, and error elements were never rendered in the DOM, failing the Playwright assertion.

#### Root Cause:
Next.js App Router renders static HTML on the server. There is a sub-second window between HTML delivery and client-side JavaScript hydration where buttons are interactive in the DOM but React event handlers have not yet bound.

#### Resolution:
Implemented idiomatic React 19 hydration detection via `React.useSyncExternalStore`:
```tsx
const isHydrated = React.useSyncExternalStore(
  () => () => {},
  () => true,
  () => false
);
```
The submit button and QA controls are disabled in initial SSR HTML (`disabled={!isHydrated || isSubmitting}`). Playwright's built-in actionability check automatically waits for the element to be enabled before clicking, guaranteeing that React hydration is complete and all event listeners are active.

---

### [DEFECT-RES-002] Next.js 16.4 Instant Navigation / PPR "URL Data Outside of Suspense" Warning

- **Status**: **RESOLVED** (Verified by `npm run build` and Route Verification)
- **Severity**: Major (S2)
- **Priority**: P1 (High)
- **Component**: `src/app/jobs/[id]/page.tsx`
- **Environment**: Next.js 16.4.0 (App Router, Turbopack, `partialPrefetching: true`, `cacheComponents: true`)

#### Summary:
Next.js Partial Prefetching (PPR) flagged a build error and navigation warning when accessing `params` at the top level of the dynamic page component.

#### Steps to Reproduce:
1. Configure `cacheComponents: true` and `partialPrefetching: true` in `next.config.ts`.
2. Define `export default async function JobDetailPage({ params }) { const { id } = await params; ... }`.
3. Run `npm run build` or navigate to a job detail URL in `next dev`.

#### Expected Behavior:
The route should build cleanly and generate a static App Shell for fast instant prefetching.

#### Actual Behavior:
Build failed with:
`Error: Route "/jobs/[id]": Next.js encountered uncached or runtime data during prerendering.`
`'params' accessed outside of <Suspense> prevents the route from being prerendered.`

#### Root Cause:
With Partial Prefetching enabled, an App Shell must be URL-independent so it can be shared and prefetched across links. Awaiting `params` at the root of `JobDetailPage` tied the static shell to a specific URL.

#### Resolution:
Refactored `src/app/jobs/[id]/page.tsx` to keep the URL-independent shell outside and pass the un-awaited `params` Promise down to `<JobDetailContent>` wrapped inside a React `<Suspense fallback={<JobDetailSkeleton />}>` boundary. Production build succeeded with prerendered `◐ /jobs/[id]` routes.

---

### [DEFECT-RES-003] Playwright Status Badge Assertion Failed Due to DOM Text Case Mismatch

- **Status**: **RESOLVED** (Verified by Scenario 1)
- **Severity**: Minor (S3)
- **Priority**: P2 (Medium)
- **Component**: `tests/critical-scenarios.spec.ts`
- **Environment**: Playwright Test Chromium

#### Summary:
Test Scenario 1 asserted `toContainText('OPEN')`, whereas the deterministic seed data status string was `'Open'`, with CSS `uppercase` applied.

#### Steps to Reproduce:
1. Run `npx playwright test tests/critical-scenarios.spec.ts`.
2. Inspect failure on line 36.

#### Expected Behavior:
Status badge text assertion should match the case rendered or perform a case-insensitive check.

#### Actual Behavior:
`Error: expect(locator).toContainText(expected) failed: Expected "OPEN", Received "Open"`.

#### Root Cause:
CSS `text-transform: uppercase` affects visual rendering in the viewport, but DOM textContent retains the original case `'Open'`.

#### Resolution:
Updated assertion to use case-insensitive regex:
`await expect(leadRoleCard.getByTestId('job-status-badge')).toContainText(/open/i);`. Test passed immediately.

---

### [DEFECT-RES-004] ESLint 9 React 19 Hook Violation on Direct `setState` Inside `useEffect`

- **Status**: **RESOLVED** (Verified by `npm run lint`)
- **Severity**: Minor (S3)
- **Priority**: P2 (Medium)
- **Component**: `src/components/ApplicationForm.tsx`
- **Environment**: ESLint 9, React 19.3.0, `eslint-config-next` 16.4.0

#### Summary:
`npm run lint` failed due to the new React 19 ESLint rule `react-hooks/set-state-in-effect`.

#### Steps to Reproduce:
1. In `ApplicationForm.tsx`, declare `useEffect(() => { setIsHydrated(true); }, [])`.
2. Run `npm run lint`.

#### Expected Behavior:
Linter should pass with 0 errors.

#### Actual Behavior:
ESLint reported:
`error: Calling setState synchronously within an effect can trigger cascading renders (react-hooks/set-state-in-effect)`.

#### Resolution:
Replaced the `useEffect` call with `React.useSyncExternalStore(() => () => {}, () => true, () => false)`. Linter completed with 0 errors and 0 warnings.
