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

---

## 2. Phase 1 Data Integrity & Access Control Hardening Findings

The table below summarizes the confirmed defects, security findings, and architectural risks audited and remediated during Phase 1:

| Finding | Priority | Evidence | Fix | Verification |
|---|---|---|---|---|
| **TOCTOU Concurrency Race in Application Submission** | P0 (Critical) | Parallel requests with identical email and job ID bypassed non-atomic `findApplication` then `saveApplication`, persisting duplicates to disk. | Implemented MongoDB compound unique index `{ normalizedEmail: 1, jobId: 1 }` with code 11000 translation to 409 Conflict, paired with in-process AsyncMutex on file fallback. | Playwright Scenario 15: 5 parallel requests fired via `Promise.all`; verified exactly 1 returned 201, 4 returned 409, and exactly 1 record was persisted in database. |
| **Unprotected Candidate PII Exposure on `GET /api/applications`** | P0 (Critical) | `GET /api/applications` returned all candidate records (full names, emails, phone numbers, resume URLs, cover letters) to any unauthenticated caller on the web. | Implemented server-side administrator authorization guard requiring `ADMIN_API_KEY` via `Authorization: Bearer <key>` or `x-admin-key`. Failed-closed when key is missing or invalid. | Playwright Scenarios 17 & 18: Unauthenticated GET returns 401 Unauthorized with no data; invalid tokens return 401; valid token returns 200 OK with records. |
| **Inconsistent Email Normalization Across Ingestion & Lookup** | P1 (High) | Email normalization was applied ad-hoc (`trimmedEmail.toLowerCase()`), risking subtle bypasses if raw casing was supplied in alternate routes or future extensions. | Exported canonical `normalizeEmail` helper across types, validation, and repository. Added dedicated `normalizedEmail` field to `ApplicationRecord`. | Playwright Scenario 13: Submitting uppercase `Elena.Rostova+QA@TestCorp.COM` followed by whitespace-padded `elena.rostova+qa@testcorp.com` rejected with 409 Conflict. |
| **Production Lockdown of Test-Support Reset Endpoint** | P1 (High) | `POST /api/test-support/reset` used header-based environment checks (`x-simulate-env`) without an absolute unconditional production guard. | Hardened reset route: `process.env.NODE_ENV === 'production'` unconditionally returns 403 Forbidden, preventing any client-side header or parameter override. Defense-in-depth guard added inside `clearApplications()`. | Playwright Scenario 12 & 19: Request with `x-simulate-env: production` returns 403 Forbidden; verify reset cannot be triggered in production. |

---

## 3. Current Open Defects Summary

> **Current Open Defects Status**: **0 Confirmed Open Defects**  
> All 20 automated Playwright tests pass cleanly (100% pass rate). Static type-checking (`npx tsc --noEmit`), linting (`npm run lint`), and production build compilation (`npm run build`) pass with 0 errors.

---

## 4. Historical Defects Discovered and Resolved

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

---

### [DEFECT-RES-005] TOCTOU Concurrency Race in Non-Atomic Duplicate Application Checking

- **Status**: **RESOLVED** (Verified by Scenario 15)
- **Severity**: Critical (S1)
- **Priority**: P0 (Blocker)
- **Component**: `src/lib/applications/repository.ts`, `src/app/api/applications/route.ts`
- **Environment**: Next.js 16.4.0 Route Handlers, MongoDB 8.0, Node.js v22

#### Summary:
Under simultaneous concurrent HTTP requests with the identical candidate email and job ID, the application-level check `findApplication` executed in parallel before either request executed `saveApplication`. Both requests found no matching record, allowing both to insert records and producing duplicate applications in storage.

#### Steps to Reproduce:
1. Dispatch 5 simultaneous requests via `Promise.all` calling `POST /api/applications` with the same `{ email, jobId }`.
2. Inspect response statuses and persisted record count in storage.

#### Expected Behavior:
Exactly 1 request should receive `201 Created`, all subsequent/concurrent attempts should receive `409 Conflict`, and exactly 1 record must be persisted in storage.

#### Actual Behavior:
Multiple requests received `201 Created` and multiple duplicate records were persisted.

#### Root Cause:
Time-of-Check to Time-of-Use (TOCTOU) race condition inherent in non-atomic check-then-write logic across asynchronous turns.

#### Resolution:
1. Integrated native MongoDB driver and enforced a database-level compound unique index on `{ normalizedEmail: 1, jobId: 1 }` with `{ unique: true }`.
2. Handled MongoDB duplicate key error code `11000` and mapped it to a structured `DuplicateApplicationError`, returning `409 Conflict`.
3. Implemented an in-process serialized `AsyncMutex` lock on the JSON file fallback store to guarantee serialization even when running without a live database.

---

### [DEFECT-RES-006] Unauthenticated Applicant PII Leakage on GET /api/applications Endpoint

- **Status**: **RESOLVED** (Verified by Scenarios 17 & 18)
- **Severity**: Critical (S1)
- **Priority**: P0 (Security Vulnerability)
- **Component**: `src/app/api/applications/route.ts`
- **Environment**: Next.js 16.4.0 App Router API Route

#### Summary:
The `GET /api/applications` route handler returned all candidate records—including full names, email addresses, phone numbers, resume links, and cover letters—without requiring any authentication or authorization, allowing public scraping of sensitive candidate PII.

#### Steps to Reproduce:
1. Submit one or more applications.
2. Send an unauthenticated `GET http://localhost:3000/api/applications` without any headers.
3. Inspect HTTP response code and payload.

#### Expected Behavior:
The endpoint should reject unauthenticated requests with HTTP `401 Unauthorized` and refuse to return candidate data.

#### Actual Behavior:
The endpoint returned HTTP `200 OK` with the full list of applicant objects and sensitive candidate data.

#### Root Cause:
Absence of an authorization guard on the application listing route.

#### Resolution:
Implemented a server-side authorization guard enforcing `ADMIN_API_KEY` verification via `Authorization: Bearer <key>` or `x-admin-key: <key>`. Fails closed (`401 Unauthorized`) if no valid key is supplied or configured.

---

### [DEFECT-RES-007] Potential Email Normalization Bypass Across Case and Whitespace Variations

- **Status**: **RESOLVED** (Verified by Scenario 13)
- **Severity**: Major (S2)
- **Priority**: P1 (High)
- **Component**: `src/lib/applications/validation.ts`, `src/lib/applications/repository.ts`
- **Environment**: Next.js 16.4.0, TypeScript

#### Summary:
Email normalization was handled ad-hoc in isolated locations (`trimmedEmail.toLowerCase()`), risking inconsistencies across ingestion, storage, and lookup layers if raw casing was supplied.

#### Steps to Reproduce:
1. Submit an application with uppercase email `Elena.Rostova+QA@TestCorp.COM`.
2. Attempt a second application with padded email `   elena.rostova+qa@testcorp.com   ` for the same job.

#### Expected Behavior:
Both emails should resolve to canonical `elena.rostova+qa@testcorp.com`, triggering a duplicate `409 Conflict` on the second submission.

#### Actual Behavior:
Without canonicalized normalization at the type and repository layers, inconsistent casing risked bypassing compound unique queries.

#### Resolution:
Exported canonical `normalizeEmail` helper, added explicit `normalizedEmail` field to `ApplicationRecord`, and enforced the database unique index directly against `normalizedEmail`. Verified by automated Scenario 13.

