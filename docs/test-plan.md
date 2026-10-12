# Test Plan: HireFlow QA Lab Platform

**Project**: HireFlow QA Lab — Job Application Platform  
**Author**: Senior QA Automation Engineer / Assessment Candidate  
**Target Environment**: Single-Machine Local Evaluation & CI Automated Harness  
**Version**: 1.0.0  
**Date**: October 2026  

---

## 1. Objective and Scope

### 1.1 Objective
The primary objective of this test plan is to establish a rigorous, repeatable quality assurance strategy for the **HireFlow QA Lab** platform. This platform serves as a benchmark for evaluating core hiring workflows, input validation boundaries, candidate deduplication, error handling, accessibility, and resilience under controlled failure scenarios.

### 1.2 In-Scope Functionality
The following functional modules and architectural layers are fully in-scope for verification:
1. **Job Listings Catalog (`/` and `/jobs`)**:
   - Deterministic seed data loading and accurate rendering of 6 realistic technical roles.
   - Display of mandatory attributes: unique ID, title, company, salary range, experience level, job type, location, status badge, description, and required skill tags.
   - Real-time catalog filtering (job type, status) and keyword search.
   - Empty state handling when no search matches are found.
2. **Job Details Dynamic Routing (`/jobs/[id]`)**:
   - Dynamic route resolution matching catalog IDs.
   - Decoupled static App Shell with React 19 `<Suspense>` streaming for URL-dependent data.
   - Complete metadata presentation: role overview, key responsibilities list, and technology pills.
   - Graceful invalid ID handling (accessible 404 container with working back navigation).
   - "Apply Now" anchor link and working back navigation to catalog.
3. **Application Form & Client Validation (`ApplicationForm.tsx`)**:
   - Field collection: Full Name, Email, Phone Number, Resume URL, Cover Letter (optional).
   - Client-side validation: empty inputs, whitespace-only strings, RFC-compliant email formatting, phone character/digit limits, URL schema validation, and maximum character limits.
   - Accessible ARIA associations: `aria-invalid`, `aria-describedby`, error element `role="alert"`.
   - Preservation of entered form values upon validation failure.
   - Rapid repeated-submission protection (`isSubmitting` flag and disabled button state).
   - React 19 hydration guarding via `useSyncExternalStore` preventing premature native HTML submissions.
4. **Application Submission API (`POST /api/applications`)**:
   - Strict server-side payload validation and sanitization.
   - Verification that target `jobId` exists in the active catalog (returns `404 Not Found`).
   - Candidate deduplication enforcement (returns `409 Conflict`).
   - HTTP status code adherence: `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`.
   - Secure failure handling that prevents internal stack trace disclosure.
5. **Controlled Test Failure & Resilience Simulation**:
   - Non-production simulation hooks via request headers (`x-test-simulate-delay`, `x-test-simulate-error`, `x-test-force-reject`).
   - In-app interactive QA simulation controls for exploratory and manual test verification.
   - Test data reset endpoint (`POST /api/test-support/reset`) guaranteeing deterministic test isolation.
6. **Local File-Backed Persistence (`src/lib/applications/repository.ts`)**:
   - Isolated JSON storage at `.data/applications.json` with memory cache fallback.

### 1.3 Out-of-Scope Functionality
The following items are deliberately out-of-scope to adhere to the lightweight 3–4 hour single-machine assessment constraints:
- User authentication, session management, candidate login portals, and OAuth providers.
- External database infrastructure (PostgreSQL, MongoDB) and multi-node replication.
- File upload systems (AWS S3, Google Cloud Storage); resume references are accepted via secure URLs.
- Email notification dispatchers (SendGrid, AWS SES) or third-party webhooks.
- Payment processing or employer billing systems.
- Production multi-tenant concurrent distributed locking.

---

## 2. Test Environment and Prerequisites

### 2.1 Hardware and Runtime Requirements
- **Operating System**: Windows 10/11, macOS (Apple Silicon / Intel), or Linux (Ubuntu 22.04+).
- **Node.js**: v20.x or v22.x LTS (tested on Node v22.23.2).
- **Package Manager**: npm v10+.
- **Browser Binary**: Chromium (Playwright revision 1248+).

### 2.2 Framework & Dependency Stack
- **Framework**: Next.js `16.4.0` (Turbopack, App Router, Cache Components, Partial Prefetching).
- **UI Library**: React `19.3.0` & React DOM `19.3.0`.
- **Styling**: Tailwind CSS `v4`.
- **Test Runner**: Playwright Test `@playwright/test` `^1.64.0`.

### 2.3 Port & URL Configuration
- Web Server Host: `http://localhost:3000`
- Playwright Base URL: `http://localhost:3000`
- Test-Support Reset Endpoint: `http://localhost:3000/api/test-support/reset`

---

## 3. Test Approach and Strategy

A layered test pyramid approach is adopted:
```
         / \
        / E2E \       Playwright Chromium UI Scenarios (Critical User Journeys)
       /-------\
      / Integration \ API Route Handlers, Deduplication & Storage Persistence
     /---------------\
    /   Unit & Static \ Shared Validation Rules, TypeScript (tsc), ESLint
   /-------------------\
```

### 3.1 Static Analysis & Type Safety
- **TypeScript**: `npx tsc --noEmit` validates type contracts across all client/server boundaries.
- **ESLint**: `npm run lint` enforces Next.js 16 core web vitals and React 19 hook guidelines (including `react-hooks/set-state-in-effect`).
- **Production Compilation**: `npm run build` verifies Turbopack static route prerendering and PPR streaming boundaries.

### 3.2 Automated End-to-End (E2E) Testing
- Driven by Playwright with TypeScript.
- Tests exercise authentic browser instances against the local Next.js server (`http://localhost:3000`).
- **Locator Strategy**: Priority is given to user-facing and accessibility-first locators:
  - `page.getByRole(...)`
  - `page.getByLabel(...)`
  - `page.getByTestId(...)` (for stable, decoupled automation hooks)
- **Zero Arbitrary Sleeps**: Tests strictly rely on Playwright auto-waiting and web-first assertions (`expect(locator).toBeVisible()`, `expect(locator).toHaveText()`).

### 3.3 Test Data Strategy & Determinism
- **Jobs Catalog**: 6 deterministic seed jobs hardcoded in `src/lib/jobs/jobs-data.ts`. IDs follow the permanent pattern `job-qa-lead-001` through `job-qa-contract-006`.
- **Candidate Data**: Synthesized deterministic candidate personas with unique emails (`morgan.freeman@example.com`, `jordan.lee@testcompany.org`, etc.).
- **Test Isolation**: A global `test.beforeEach` hook calls `POST /api/test-support/reset`, wiping `.data/applications.json` before every single scenario. Tests never share application state and are completely order-independent.

### 3.4 API Testing Strategy
- Route handlers are tested both through UI submissions and direct Playwright API request contexts (`request.post`).
- Boundary payloads (empty objects, malformed JSON strings, invalid types) are asserted against HTTP status codes and structured response contracts (`ApiResponse<T>`).

---

## 4. Priority Definitions

| Level | Identifier | Description | Criteria |
|---|---|---|---|
| **P0** | **Blocker / Critical** | Core business journey. If broken, candidate cannot apply or role cannot be found. | Job listing renders, job detail resolves, valid application creates record and returns 201 with ID. |
| **P1** | **High** | Data integrity & validation gates. Critical client and server constraints. | Required fields reject empty/whitespace input, email format validation, candidate deduplication (409 Conflict). |
| **P2** | **Medium** | Edge cases, accessibility, resilience, and error recovery. | Boundary limit enforcement (min/max characters), rapid repeated-click prevention, controlled 500 error display, invalid job ID 404. |
| **P3** | **Low / Polish** | UI filters, visual feedback, non-blocking convenience features. | Catalog keyword search, job type filter badge toggles, character counters, non-production security gating. |

---

## 5. Entry and Exit Criteria

### 5.1 Entry Criteria
1. Repository dependencies successfully installed via `npm install`.
2. Playwright Chromium browser binary installed (`npx playwright install chromium`).
3. Next.js development server starts cleanly on port 3000 without fatal compilation errors.
4. Deterministic seed jobs catalog loaded and verified.

### 5.2 Exit Criteria
1. 100% of P0 and P1 automated tests execute and pass without flakiness.
2. Minimum of 12 automated Playwright tests executed against the running application.
3. Zero TypeScript compiler errors (`npx tsc --noEmit` exits with 0).
4. Zero ESLint errors or warnings (`npm run lint` exits with 0).
5. Production build succeeds (`npm run build` exits with 0).
6. HTML report generated (`playwright-report/index.html`) documenting authentic pass counts.
7. Any observed application defect documented with reproducible steps, expected vs. actual outcomes, and resolution status.

---

## 6. Risk Assessment and Mitigation

| Risk ID | Identified Risk | Impact | Probability | Mitigation Strategy |
|---|---|---|---|---|
| **R-01** | Test order dependency or cross-test data pollution in local file storage. | High | Medium | Execute `POST /api/test-support/reset` in `test.beforeEach` before every test case; run test suite with a single worker (`workers: 1`). |
| **R-02** | Client hydration race conditions where Playwright clicks submit before React event listeners attach. | High | High | Implement `useSyncExternalStore` hydration detection in `ApplicationForm`; keep submit button disabled in initial SSR HTML so Playwright auto-waits for hydration. |
| **R-03** | Next.js 16 Partial Prefetching (PPR) runtime warnings breaking dynamic route prerendering. | Medium | High | Refactor `jobs/[id]` dynamic params read into a dedicated child component wrapped within a React `<Suspense>` boundary with a skeleton fallback. |
| **R-04** | Accidental exposure of test-support simulation endpoints in production deployments. | Critical | Low | Strictly gate all simulation headers and `/api/test-support/*` routes behind `process.env.NODE_ENV !== 'production'`. Return `403 Forbidden` in production. |
| **R-05** | Flaky tests caused by arbitrary delays or fixed sleep timers. | Medium | Medium | Strict adherence to Playwright web-first assertions (`toBeVisible({ timeout: ... })`) and zero `sleep()` statements. |

---

## 7. Defect Management Lifecycle

```
[ New Defect Observed ] ──> [ Reproduce via Isolated Script ]
                                     │
                                     ▼
                        [ Log in docs/bug-reports.md ]
                                     │
                                     ▼
                             [ Fix Root Cause ]
                                     │
                                     ▼
                   [ Verify via Automated Regression Test ]
                                     │
                                     ▼
                       [ Status Updated to RESOLVED ]
```

Defects are categorized by Severity:
- **Critical (S1)**: Total workflow failure; data loss; server crash; security breach.
- **Major (S2)**: High-priority feature broken without workaround (e.g., validation bypassed; duplicate submitted).
- **Minor (S3)**: Edge case failure, cosmetic inconsistency, or non-blocking UX glitch.
- **Trivial (S4)**: Typo or styling imperfection.

---

## 8. Limitations & Testing Assumptions
1. **Single-Machine Storage**: The file-backed persistence layer (`.data/applications.json`) is designed for a single-machine assessment environment. It lacks multi-process distributed mutex locks.
2. **Production Safety Testing**: While automated tests verify the production check logic via mock headers and route execution, end-to-end production testing requires a standalone production bundle deployment (`next start`).
3. **Browser Scope**: In alignment with the time-boxed assessment requirements, automation is focused on Chromium desktop (`1280x720`). Manual smoke tests verify responsive mobile layouts.
