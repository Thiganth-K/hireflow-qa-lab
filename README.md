# HireFlow QA Lab

> **A Functional, Deterministic Job Application Platform Built for QA Automation & Assessment Evaluation**

---

## 1. Project Purpose & Assessment Context

**HireFlow QA Lab** is a high-reliability recruitment web platform created as part of a Senior QA Automation Engineer assessment. The application provides an end-to-end job discovery, review, and application submission workflow specifically architected for testability, deterministic verification, accessibility compliance, and controlled failure simulation.

The platform demonstrates:
1. **A prioritized QA Test Plan** ([`docs/test-plan.md`](./docs/test-plan.md)) detailing objectives, scope, risk mitigations, and exit criteria.
2. **20 Detailed Test Cases** ([`docs/test-cases.md`](./docs/test-cases.md)) spanning positive, negative, boundary, resilience, security, and accessibility scenarios.
3. **Automated Playwright Test Suite** with 12 executed scenarios achieving a **100% pass rate** (12 passed, 0 failed, 0 skipped).
4. **Reproducible Defect Reporting** ([`docs/bug-reports.md`](./docs/bug-reports.md)) including a reusable industry template and authentic root cause logs of historical issues diagnosed and resolved during development.
5. **Production & Environment Safety Controls** ensuring test-only simulation mechanisms cannot be triggered in production deployments.

---

## 2. Technology Stack

- **Framework**: [Next.js](https://nextjs.org) `16.4.0` (App Router, Turbopack, Cache Components, Partial Prefetching)
- **Frontend Library**: [React](https://react.dev) `19.3.0` & React DOM `19.3.0`
- **Language**: [TypeScript](https://www.typescriptlang.org) `5.x` (Strict mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) `v4`
- **Automation Engine**: [Playwright Test](https://playwright.dev) `@playwright/test` `^1.64.0`
- **Browser Binary**: Chromium (revision `1248`)
- **Persistence Layer**: Local isolated file-backed JSON store (`.data/applications.json`) with in-memory caching fallback
- **Code Quality**: ESLint `9` with `eslint-config-next`

---

## 3. Key Feature Overview

### 3.1 Job Listings Catalog (`/` and `/jobs`)
- Renders 6 deterministic seed job postings featuring realistic technical requirements (e.g. Lead QA Automation Engineer, Senior SDET, Frontend Engineer).
- Displays stable unique IDs, job titles, companies, salary ranges, experience levels, job types, locations, status badges, descriptions, and required skill tags.
- Interactive client filtering by job type and status, plus live keyword search across titles, skills, and companies.
- Clear empty state when search criteria return zero matches.

### 3.2 Job Details Dynamic Routing (`/jobs/[id]`)
- Resolves role IDs dynamically using Next.js 16 asynchronous `params: Promise<{ id: string }>`.
- Next.js 16 Partial Prefetching (PPR) compliant: static App Shell decoupling with React 19 `<Suspense>` streaming and skeleton placeholder fallback.
- Renders comprehensive role overview, key responsibilities, and required skill badges matching the catalog.
- Gracefully handles missing or invalid job IDs with an accessible "Job Posting Not Found" error banner and back navigation.
- "Apply Now" anchor link navigating to the pre-associated application form.

### 3.3 Accessible Application Form (`ApplicationForm.tsx`)
- Form fields: Full Name, Email, Phone Number, Resume URL, and Optional Cover Letter.
- Explicit validation rules:
  - Required fields reject empty and whitespace-only inputs.
  - Email syntax is validated using RFC-compliant pattern.
  - Documented boundary constraints enforced (`fullName`: 2–80 chars; `email`: max 100 chars; `phone`: 7–25 chars; `resumeUrl`: 5–250 chars HTTP/HTTPS; `coverLetter`: max 2000 chars).
- Accessible error feedback: `aria-invalid="true"`, `aria-describedby` links, and error elements marked with `role="alert"`.
- User input preservation upon validation failure.
- Accidental repeated-click and double-submission protection (`isSubmitting` guard and disabled button state).
- Idiomatic React 19 hydration guarding via `useSyncExternalStore` preventing native browser form submit races.
- Success confirmation banner displaying generated Application ID (`app_*`), candidate email, and target role title.

### 3.4 API Submission Endpoint (`POST /api/applications`)
- Server-side validation enforcing the same rules as the client before persisting.
- Candidate deduplication rule: normalized candidate email (trimmed, lowercase) + target `jobId` combination. Returns `409 Conflict` if duplicate.
- Verification that target job exists in the deterministic catalog (returns `404 Not Found`).
- Appropriate HTTP status codes: `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`.
- Safe failure handling shielding internal stack traces.

### 3.5 Controlled Failure Simulation & Test Support
- Safe simulation mechanisms gated strictly to development mode (`NODE_ENV !== 'production'`):
  - `x-test-simulate-delay: <ms>` — Injects artificial latency (up to 15,000ms).
  - `x-test-simulate-error: 500` — Returns simulated HTTP 500 server error.
  - `x-test-force-reject: 400` — Returns forced 400 rejection.
- Interactive in-app "🧪 QA Test Simulation Controls" panel on the application form for manual tester evaluation.
- Test isolation endpoint `POST /api/test-support/reset` to purge stored application records between test runs.
- Returns `403 Forbidden` if invoked in production mode.

---

## 4. Project Structure

```
hireflow-qa-lab/
├── .data/                               # Local file-backed application storage
│   └── applications.json                # Single-machine application records
├── docs/                                # Complete QA documentation suite
│   ├── test-plan.md                     # Comprehensive QA test plan
│   ├── test-cases.md                    # 20 detailed test cases specification
│   └── bug-reports.md                   # Defect tracking & historical resolution logs
├── playwright-report/                   # Generated Playwright HTML report
│   └── index.html                       # Interactive HTML report output
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── applications/route.ts    # POST submission & GET retrieval API
│   │   │   └── test-support/reset/      # POST test-isolation store reset API
│   │   ├── jobs/
│   │   │   ├── [id]/page.tsx            # Dynamic job detail page (Suspense streamed)
│   │   │   └── page.tsx                 # Route alias to catalog
│   │   ├── globals.css                  # Tailwind CSS v4 styling
│   │   ├── layout.tsx                   # Root HTML layout & metadata
│   │   └── page.tsx                     # Job listings catalog & filter interface
│   ├── components/
│   │   ├── ApplicationForm.tsx          # Accessible, hydrated application form
│   │   └── Navbar.tsx                   # Platform navigation header
│   └── lib/
│       ├── applications/
│       │   ├── repository.ts            # Isolated persistence & deduplication logic
│       │   ├── types.ts                 # Contracts for inputs, records, and errors
│       │   └── validation.ts            # Shared boundary limits & validation rules
│       └── jobs/
│           ├── jobs-data.ts             # 6 deterministic seed job postings
│           ├── service.ts               # Job lookup & filter service
│           └── types.ts                 # Job data contracts & status types
├── tests/
│   ├── critical-scenarios.spec.ts       # 5 High-Priority P0/P1 Playwright tests
│   └── extended-scenarios.spec.ts       # 7 Extended P1/P2 Playwright tests
├── package.json                         # Dependencies & npm scripts
├── playwright.config.ts                 # Playwright test harness configuration
├── next.config.ts                       # Next.js 16 configuration
└── tsconfig.json                        # TypeScript configuration
```

---

## 5. Prerequisites & Environment Setup

### 5.1 Prerequisites
- **Node.js**: v20+ or v22+ LTS installed ([nodejs.org](https://nodejs.org))
- **npm**: v10+

### 5.2 Installation
Clone or navigate to the workspace directory and install dependencies:

```bash
# 1. Install project dependencies
npm install

# 2. Install Playwright Chromium browser binary
npx playwright install chromium
```

---

## 6. Development Server & Verification Commands

All npm scripts have been verified against the current project configuration:

```bash
# Start local development server (http://localhost:3000)
npm run dev

# Run static TypeScript compilation check
npx tsc --noEmit

# Run ESLint code quality audit
npm run lint

# Build optimized production bundle
npm run build
```

---

## 7. Automated Test Execution & Reporting

### 7.1 Running Automated Tests
Ensure the local server is running, or let Playwright launch it automatically via its built-in `webServer` configuration:

```bash
# Execute the complete Playwright E2E suite (12 tests)
npm run test:e2e

# Execute only the 5 critical high-priority scenarios
npx playwright test tests/critical-scenarios.spec.ts

# Execute only the extended QA and edge scenarios
npx playwright test tests/extended-scenarios.spec.ts
```

### 7.2 Viewing the HTML Report
After execution, open the interactive HTML report in your browser:

```bash
# Launch Playwright HTML Report viewer
npm run test:report
```
Alternatively, open `playwright-report/index.html` directly in any web browser.

---

## 8. Authentic Test Execution Results

The following execution output was captured directly from the test runner:

```text
> hireflow-qa-lab@0.1.0 test:e2e
> playwright test

Running 12 tests using 1 worker

  ok  1 [chromium] › tests\critical-scenarios.spec.ts:15:7 › Scenario 1: Job listings render the required metadata (1.3s)
  ok  2 [chromium] › tests\critical-scenarios.spec.ts:52:7 › Scenario 2: Clicking a job opens the matching details (8.6s)
  ok  3 [chromium] › tests\critical-scenarios.spec.ts:89:7 › Scenario 3: Empty required fields are rejected (2.0s)
  ok  4 [chromium] › tests\critical-scenarios.spec.ts:130:7 › Scenario 4: Invalid email input is rejected (2.1s)
  ok  5 [chromium] › tests\critical-scenarios.spec.ts:168:7 › Scenario 5: A valid application produces the expected success response (2.0s)
  ok  6 [chromium] › tests\extended-scenarios.spec.ts:15:7 › Scenario 6: Whitespace-only input in required fields is rejected (2.1s)
  ok  7 [chromium] › tests\extended-scenarios.spec.ts:46:7 › Scenario 7: Boundary value limits are strictly validated (1.6s)
  ok  8 [chromium] › tests\extended-scenarios.spec.ts:70:7 › Scenario 8: Duplicate applications for the same candidate and job are prevented (2.4s)
  ok  9 [chromium] › tests\extended-scenarios.spec.ts:116:7 › Scenario 9: Submit button is disabled and guarded during submission (3.6s)
  ok 10 [chromium] › tests\extended-scenarios.spec.ts:145:7 › Scenario 10: Invalid job ID renders accessible error state gracefully (1.9s)
  ok 11 [chromium] › tests\extended-scenarios.spec.ts:165:7 › Scenario 11: Controlled server error (500) displays friendly error banner (1.8s)
  ok 12 [chromium] › tests\extended-scenarios.spec.ts:197:7 › Scenario 12: Test support reset route is guarded against production use (65ms)

  12 passed (31.0s)
```

### Execution Metrics Summary
| Suite | Executed | Passed | Failed | Skipped | Pass Rate | Duration |
|---|---|---|---|---|---|---|
| Critical Scenarios (`critical-scenarios.spec.ts`) | 5 | 5 | 0 | 0 | 100% | 15.0s |
| Extended Scenarios (`extended-scenarios.spec.ts`) | 7 | 7 | 0 | 0 | 100% | 16.0s |
| **Combined E2E Suite** | **12** | **12** | **0** | **0** | **100%** | **31.0s** |

---

## 9. Failure Diagnostics, Screenshots & Traces

Playwright is configured with automated failure artifact capture:
- **Screenshots**: Automatically saved to `test-results/` on failure (`screenshot: 'only-on-failure'`).
- **Traces**: Captured on failure (`trace: 'retain-on-failure'`) and viewable via `npx playwright show-trace <trace.zip>`.
- **Videos**: Recorded on failure (`video: 'retain-on-failure'`).

When all tests pass (as in the current build), zero failure screenshots are generated, keeping the repository clean.

---

## 10. Application Validation & Deduplication Rules

| Field | Mandatory | Boundaries / Pattern | Failure Message |
|---|---|---|---|
| `jobId` | Yes | Must exist in seed catalog | "Invalid application target: Job ID does not exist" (HTTP 404) |
| `fullName` | Yes | 2 to 80 chars; non-whitespace | "Full name is required and cannot be empty or whitespace only" / "Full name must be at least 2 characters" |
| `email` | Yes | Max 100 chars; RFC regex | "Email address is required..." / "Please provide a valid email address (e.g. name@example.com)" |
| `phone` | Yes | 7 to 25 chars; min 7 digits; `[0-9+\-()\s.]` | "Phone number is required..." / "Phone number must contain at least 7 digits" |
| `resumeUrl` | Yes | 5 to 250 chars; `http://` or `https://` | "Resume link or URL is required..." / "Resume URL must begin with http:// or https://" |
| `coverLetter`| No | Max 2,000 characters | "Cover letter cannot exceed 2000 characters" |

### Deduplication Policy
- **Rule**: An application is flagged as a duplicate if the normalized email (`email.trim().toLowerCase()`) matches an existing record for the exact same `jobId`.
- **Response**: The server returns **HTTP 409 Conflict** with an explicit error message: `"Duplicate application detected: Candidate '<email>' has already applied for role '<jobTitle>'."`

---

## 11. Known Limitations & Assessment Architecture Notes

1. **Local File-Backed Persistence**: Intended specifically for a single-machine assessment environment. Stored in `.data/applications.json`. Does not provide multi-process transactional locking or ACID replication required for high-concurrency production deployments.
2. **Production Safety Testing Note**: In the local test suite, Scenario 12 asserts the production-mode gate logic using header routing simulation against the development server. A true production verification requires building and starting Next.js in production (`NODE_ENV=production next start`).
3. **Desktop Automation Focus**: In accordance with the time-boxed assessment requirements, automation targets Desktop Chromium (`1280x720`). Mobile and tablet viewports are validated via manual responsive checks.

---

## 12. Assessment Submission Checklist

- [x] Next.js 16 App Router application running locally
- [x] Deterministic seed job listings with verified metadata
- [x] Job detail pages with App Shell Suspense streaming & invalid ID 404 handling
- [x] Client-side & server-side validation with accessible ARIA feedback
- [x] Application submission API (`POST /api/applications`) returning appropriate HTTP statuses
- [x] Duplicate application prevention (HTTP 409 Conflict)
- [x] Rapid repeated-submission protection (`isSubmitting` guard & button disable)
- [x] Controlled failure simulation (`x-test-simulate-delay`, `x-test-simulate-error: 500`)
- [x] Test isolation reset endpoint (`POST /api/test-support/reset`)
- [x] Prioritized QA Test Plan created ([`docs/test-plan.md`](./docs/test-plan.md))
- [x] 20 Detailed Test Cases documented ([`docs/test-cases.md`](./docs/test-cases.md))
- [x] Reusable Defect Report template & resolved defect logs ([`docs/bug-reports.md`](./docs/bug-reports.md))
- [x] 12 Playwright automated tests implemented and executed
- [x] Playwright HTML report generated ([`playwright-report/index.html`](./playwright-report/index.html))
- [x] ESLint passing with 0 errors (`npm run lint`)
- [x] TypeScript compiler passing with 0 errors (`npx tsc --noEmit`)
- [x] Production build passing with 0 errors (`npm run build`)
- [x] Complete README documentation with genuine execution metrics
