# Test Cases Specification: HireFlow QA Lab

**Platform**: HireFlow QA Lab  
**Specification Version**: 2.0.0  
**Test Suite Architecture**: Next.js 16 • React 19 • Playwright Test (Chromium)  
**Total Documented Test Cases**: 41 Automated Scenarios (100% Passing)  

---

## Traceability Matrix & Execution Summary

| Test Case ID | Scenario Title | Priority | Test Type | Automation Status | Test File Reference |
|---|---|---|---|---|---|
| **TC-JOB-01** | Job listings load and render required metadata | P0 | Positive / Functional | **Automated (PASSED)** | `tests/critical-scenarios.spec.ts` (Scenario 1) |
| **TC-JOB-02** | Clicking a role navigates to matching detail page | P0 | Positive / Integration | **Automated (PASSED)** | `tests/critical-scenarios.spec.ts` (Scenario 2) |
| **TC-JOB-03** | Invalid job ID renders accessible 404 container | P1 | Negative / Error Handling | **Automated (PASSED)** | `tests/extended-scenarios.spec.ts` (Scenario 10) |
| **TC-VAL-01** | Submitting empty required fields triggers validation | P0 | Negative / Validation | **Automated (PASSED)** | `tests/critical-scenarios.spec.ts` (Scenario 3) |
| **TC-VAL-02** | Whitespace-only values in required fields are rejected | P1 | Negative / Boundary | **Automated (PASSED)** | `tests/extended-scenarios.spec.ts` (Scenario 6) |
| **TC-VAL-03** | Invalid email address syntax is rejected | P0 | Negative / Format Validation | **Automated (PASSED)** | `tests/critical-scenarios.spec.ts` (Scenario 4) |
| **TC-BND-01** | Field input boundary minimums and protocols validated | P1 | Boundary / Validation | **Automated (PASSED)** | `tests/extended-scenarios.spec.ts` (Scenario 7) |
| **TC-BND-02** | Maximum boundary character limits enforcement | P1 | Boundary / Contract | **Automated (PASSED)** | `tests/form-boundaries.spec.ts` (Scenario 33) |
| **TC-APP-01** | Valid application creates record and returns confirmation | P0 | Positive / End-to-End | **Automated (PASSED)** | `tests/critical-scenarios.spec.ts` (Scenario 5) |
| **TC-DUP-01** | Duplicate application for same candidate & role prevented | P1 | Negative / Integrity | **Automated (PASSED)** | `tests/extended-scenarios.spec.ts` (Scenario 8) |
| **TC-REP-01** | Rapid repeated clicks & double-submission guarded | P1 | Concurrency / Resilience | **Automated (PASSED)** | `tests/extended-scenarios.spec.ts` (Scenario 9) |
| **TC-ERR-01** | Controlled server error (HTTP 500) displays friendly alert | P1 | Resilience / Error Handling | **Automated (PASSED)** | `tests/extended-scenarios.spec.ts` (Scenario 11) |
| **TC-SEC-01** | Production safety guard blocks test-support endpoints | P1 | Security / Access Control | **Automated (PASSED)** | `tests/extended-scenarios.spec.ts` (Scenario 12) |
| **TC-NORM-01** | Email normalization consistency across duplicate checks | P1 | Negative / Data Integrity | **Automated (PASSED)** | `tests/hardening-scenarios.spec.ts` (Scenario 13) |
| **TC-CROSS-01** | Same candidate applying to a different job is allowed | P1 | Positive / Business Logic | **Automated (PASSED)** | `tests/hardening-scenarios.spec.ts` (Scenario 14) |
| **TC-CONCUR-01**| Simultaneous requests duplicate race condition prevention | P0 | Concurrency / Data Integrity | **Automated (PASSED)** | `tests/hardening-scenarios.spec.ts` (Scenario 15) |
| **TC-LEAK-01** | Duplicate attempts return safe 409 without DB leaks | P1 | Security / Error Masking | **Automated (PASSED)** | `tests/hardening-scenarios.spec.ts` (Scenario 16) |
| **TC-AUTH-01** | Unauthenticated candidate PII listing rejected with 401 | P0 | Security / Access Control | **Automated (PASSED)** | `tests/hardening-scenarios.spec.ts` (Scenario 17) |
| **TC-AUTH-02** | Administrator authorization validation (Bearer & Header) | P1 | Security / Authorization | **Automated (PASSED)** | `tests/hardening-scenarios.spec.ts` (Scenario 18) |
| **TC-SEC-02** | Test support reset route cannot be operated in production | P0 | Security / Prod Lockdown | **Automated (PASSED)** | `tests/hardening-scenarios.spec.ts` (Scenario 19) |
| **TC-STATE-01**| Rejected/unauthorized requests do not mutate stored data | P1 | Integrity / Idempotency | **Automated (PASSED)** | `tests/hardening-scenarios.spec.ts` (Scenario 20) |
| **TC-MEDIA-01**| Content-Type application/json strictly enforced (415) | P0 | Security / HTTP Contract | **Automated (PASSED)** | `tests/hardening-scenarios.spec.ts` (Scenario 21) |
| **TC-ARRAY-01**| Array and primitive JSON payloads rejected with 400 | P1 | Validation / Security | **Automated (PASSED)** | `tests/hardening-scenarios.spec.ts` (Scenario 22) |
| **TC-SPLIT-01**| MongoDB unavailability prevents JSON fallback & recovers | P0 | Resilience / Persistence | **Automated (PASSED)** | `tests/hardening-scenarios.spec.ts` (Scenario 23) |
| **TC-CRASH-01**| Crash-resistant JSON persistence with zero lingering tmp | P1 | Resilience / File Storage | **Automated (PASSED)** | `tests/hardening-scenarios.spec.ts` (Scenario 24) |
| **TC-ROUT-01** | Authentic HTTP 404 for missing jobs & 200 for valid jobs | P0 | Routing / HTTP Status | **Automated (PASSED)** | `tests/hardening-scenarios.spec.ts` (Scenario 25) |
| **TC-SRCH-01** | Search catalog by job title | P1 | Functional / UI Search | **Automated (PASSED)** | `tests/catalog-filters.spec.ts` (Scenario 26) |
| **TC-SRCH-02** | Search catalog by company name | P1 | Functional / UI Search | **Automated (PASSED)** | `tests/catalog-filters.spec.ts` (Scenario 27) |
| **TC-SRCH-03** | Search catalog by location (on-site & remote) | P1 | Functional / UI Search | **Automated (PASSED)** | `tests/catalog-filters.spec.ts` (Scenario 28) |
| **TC-SRCH-04** | Search catalog by required skill competency | P1 | Functional / UI Search | **Automated (PASSED)** | `tests/catalog-filters.spec.ts` (Scenario 29) |
| **TC-FILT-01** | Combined job-type and job-status multi-filter | P1 | Functional / UI Filter | **Automated (PASSED)** | `tests/catalog-filters.spec.ts` (Scenario 30) |
| **TC-FILT-02** | Empty search results renders empty-state component | P1 | UI / Empty State | **Automated (PASSED)** | `tests/catalog-filters.spec.ts` (Scenario 31) |
| **TC-FILT-03** | Clearing filters restores complete catalog | P1 | Functional / UI Reset | **Automated (PASSED)** | `tests/catalog-filters.spec.ts` (Scenario 32) |
| **TC-PHONE-01**| Phone validation rejects invalid characters & < 7 digits | P1 | Validation / Input Syntax | **Automated (PASSED)** | `tests/form-boundaries.spec.ts` (Scenario 34) |
| **TC-COVER-01**| Successful application submission with empty cover letter | P1 | Functional / Form Optional | **Automated (PASSED)** | `tests/form-boundaries.spec.ts` (Scenario 35) |
| **TC-CLEAR-01**| Field validation error clears dynamically on keystroke | P1 | UX / Interactive Validation | **Automated (PASSED)** | `tests/form-boundaries.spec.ts` (Scenario 36) |
| **TC-FOCUS-01**| Keyboard focus automatically shifts to first invalid field | P1 | Accessibility / a11y Focus | **Automated (PASSED)** | `tests/form-boundaries.spec.ts` (Scenario 37) |
| **TC-MALF-01** | Syntactically malformed JSON returns HTTP 400 Bad Request | P0 | Security / Error Boundary | **Automated (PASSED)** | `tests/api-contracts.spec.ts` (Scenario 38) |
| **TC-NOJOB-01**| Nonexistent target jobId in payload returns HTTP 404 | P1 | Integration / Target Verification | **Automated (PASSED)** | `tests/api-contracts.spec.ts` (Scenario 39) |
| **TC-ORDER-01**| Administrator listing follows descending creation order | P1 | Integration / Data Ordering | **Automated (PASSED)** | `tests/api-contracts.spec.ts` (Scenario 40) |
| **TC-METADATA-01**| Database internal metadata excluded from API responses | P0 | Security / Data Sanitization | **Automated (PASSED)** | `tests/api-contracts.spec.ts` (Scenario 41) |

---

## Detailed Test Case Specifications

### TC-JOB-01: Job listings load and render required metadata
- **Priority**: P0 (Blocker)
- **Type**: Positive / Functional UI
- **Automation Status**: Automated (`tests/critical-scenarios.spec.ts` — Scenario 1)
- **Preconditions**:
  - Application dev server running on `http://localhost:3000`.
  - Database/catalog seeded with 6 deterministic positions.
- **Test Data**: Role `job-qa-lead-001` (Lead QA Automation Engineer at CloudScale Technologies).
- **Execution Steps**:
  1. Navigate to the job catalog root URL `/`.
  2. Verify the primary `<h1>` heading contains "Explore Open Engineering & QA Opportunities".
  3. Count total job card articles rendered in the catalog grid.
  4. Inspect the card for `job-qa-lead-001`.
  5. Assert the visibility and content of: Title, Company Name, Location, Job Type, Experience Level, Salary Range, Status Badge, Description snippet, and Required Skills pills.
- **Expected Result**:
  - Catalog displays exactly 6 job cards.
  - Card `job-qa-lead-001` renders title "Lead QA Automation Engineer", company "CloudScale Technologies", salary "$140,000 - $170,000 / year", status "Open", location "Remote (US/Canada)", and skills including "Playwright" and "TypeScript".

---

### TC-JOB-02: Clicking a role navigates to matching detail page
- **Priority**: P0 (Blocker)
- **Type**: Positive / Navigation Integration
- **Automation Status**: Automated (`tests/critical-scenarios.spec.ts` — Scenario 2)
- **Preconditions**: User is on the catalog page `/`.
- **Test Data**: Job card `job-qa-sdet-002` (Senior SDET at FinPulse Systems).
- **Execution Steps**:
  1. Locate the job card for `job-qa-sdet-002`.
  2. Click the "View Role & Apply" link.
  3. Verify the browser navigates to `/jobs/job-qa-sdet-002`.
  4. Assert that the detail page heading matches the clicked role.
  5. Verify that the company profile, responsibilities, and application form are rendered.
  6. Click the "Back to Job Listings" navigation link.
- **Expected Result**:
  - URL resolves to `/jobs/job-qa-sdet-002`.
  - Role title displays "Senior SDET (Software Development Engineer in Test)".
  - Application form is pre-associated with this job.
  - Clicking back navigation returns user to `/` with the catalog grid visible.

---

### TC-JOB-03: Invalid job ID renders accessible 404 container
- **Priority**: P1 (High)
- **Type**: Negative / Error Handling
- **Automation Status**: Automated (`tests/extended-scenarios.spec.ts` — Scenario 10)
- **Preconditions**: Application is running.
- **Test Data**: URL `/jobs/non-existent-role-9999`.
- **Execution Steps**:
  1. Navigate directly to `/jobs/non-existent-role-9999`.
  2. Verify that the application does not crash or display an incorrect job's details.
  3. Inspect the rendered view for the error container (`job-not-found-container`).
  4. Verify the heading text "Job Posting Not Found" and reference to the invalid ID.
  5. Click the "Back to All Job Listings" button.
- **Expected Result**:
  - Accessible error banner displayed with clear explanation.
  - User can click the recovery link and return to the main catalog.

---

### TC-VAL-01: Submitting empty required fields triggers validation
- **Priority**: P0 (Blocker)
- **Type**: Negative / Validation
- **Automation Status**: Automated (`tests/critical-scenarios.spec.ts` — Scenario 3)
- **Preconditions**: User is on a valid job detail page (`/jobs/job-qa-lead-001`).
- **Test Data**: All input fields left blank (`""`).
- **Execution Steps**:
  1. Scroll to the Application Form.
  2. Click the "Submit Application" button without entering any input.
  3. Observe validation feedback on required fields (`fullName`, `email`, `phone`, `resumeUrl`).
  4. Check ARIA attributes on the input elements (`aria-invalid="true"`).
  5. Verify that no success confirmation is rendered.
- **Expected Result**:
  - Form submission is blocked.
  - Red error alerts appear under each required input.
  - Error messages explicitly inform the user: "Full name is required", "Email address is required", "Phone number is required", "Resume link or URL is required".
  - Success banner is not displayed.

---

### TC-VAL-02: Whitespace-only values in required fields are rejected
- **Priority**: P1 (High)
- **Type**: Negative / Boundary Validation
- **Automation Status**: Automated (`tests/extended-scenarios.spec.ts` — Scenario 6)
- **Preconditions**: User is on a valid job detail page (`/jobs/job-qa-eng-004`).
- **Test Data**:
  - Full Name: `"   "`
  - Email: `"   "`
  - Phone: `"   "`
  - Resume URL: `"   "`
- **Execution Steps**:
  1. Fill each required field with 3 space characters.
  2. Click "Submit Application".
  3. Inspect field error elements.
- **Expected Result**:
  - All whitespace inputs are rejected.
  - Validation messages clearly indicate that values cannot be whitespace only.
  - Application is not recorded.

---

### TC-VAL-03: Invalid email address syntax is rejected
- **Priority**: P0 (Blocker)
- **Type**: Negative / Format Validation
- **Automation Status**: Automated (`tests/critical-scenarios.spec.ts` — Scenario 4)
- **Preconditions**: User is on `/jobs/job-fe-dev-003`.
- **Test Data**:
  - Full Name: `"Taylor Swift"`
  - Email: `"taylor-invalid-email-format"` (missing `@` and domain)
  - Phone: `"+1 555-987-6543"`
  - Resume URL: `"https://example.com/resumes/taylor.pdf"`
- **Execution Steps**:
  1. Enter valid name, phone, and resume URL.
  2. Enter the malformed email string in the email field.
  3. Click "Submit Application".
  4. Verify that the email error element appears.
  5. Check that valid fields do not display errors.
  6. Confirm that the entered values remain preserved in the form fields.
- **Expected Result**:
  - Email field displays "Please provide a valid email address (e.g. name@example.com)".
  - Name, phone, and resume URL values are preserved without loss of user input.
  - Form is not submitted.

---

### TC-BND-01: Field input boundary minimums and protocols validated
- **Priority**: P1 (High)
- **Type**: Boundary / Validation
- **Automation Status**: Automated (`tests/extended-scenarios.spec.ts` — Scenario 7)
- **Preconditions**: User is on `/jobs/job-qa-eng-004`.
- **Test Data**:
  - Full Name: `"A"` (Length 1; minimum is 2 characters)
  - Email: `"candidate@example.com"`
  - Phone: `"12345"` (5 digits; minimum is 7 digits)
  - Resume URL: `"ftp://invalid-protocol.com/resume.pdf"` (disallowed protocol)
- **Execution Steps**:
  1. Fill form with values right below the allowed lower boundary limits.
  2. Click "Submit Application".
  3. Assert error messages for name, phone, and resume URL.
- **Expected Result**:
  - Full name displays: "Full name must be at least 2 characters".
  - Phone number displays: "Phone number must contain at least 7 digits".
  - Resume URL displays: "Resume URL must begin with http:// or https://".

---

### TC-BND-02: Maximum boundary character limits enforcement
- **Priority**: P2 (Medium)
- **Type**: Boundary
- **Automation Status**: Manual
- **Preconditions**: User is on an application form.
- **Test Data**:
  - Full Name: 81 characters (Limit: 80)
  - Email: 101 characters (Limit: 100)
  - Cover Letter: 2001 characters (Limit: 2000)
- **Execution Steps**:
  1. Attempt to type or paste 85 characters into the Full Name field.
  2. Attempt to paste 2050 characters into the Cover Letter textarea.
  3. Verify character counter feedback and `maxLength` attribute restrictions.
- **Expected Result**:
  - Client inputs prevent typing past the documented `maxLength` (80 for name, 2000 for cover letter).
  - Server validation rejects payloads that exceed boundary lengths if bypassed.

---

### TC-APP-01: Valid application creates record and returns confirmation
- **Priority**: P0 (Blocker)
- **Type**: Positive / Happy Path End-to-End
- **Automation Status**: Automated (`tests/critical-scenarios.spec.ts` — Scenario 5)
- **Preconditions**: Store reset; user is on `/jobs/job-qa-lead-001`.
- **Test Data**:
  - Full Name: `"Morgan Freeman"`
  - Email: `"morgan.freeman@example.com"`
  - Phone: `"+1 555-246-8100"`
  - Resume URL: `"https://github.com/morgan/resume.pdf"`
  - Cover Letter: `"I am passionate about Playwright E2E automation."`
- **Execution Steps**:
  1. Fill all required fields and optional cover letter with valid data.
  2. Click "Submit Application".
  3. Wait for network response and UI state update.
  4. Assert visibility of the success confirmation banner (`application-success-banner`).
  5. Check that the banner displays the candidate name, role title, and confirmed email.
  6. Extract and verify the generated Application ID format (`app_<timestamp>_<hash>`).
  7. Click "Submit Another Application" and verify form resets cleanly.
- **Expected Result**:
  - Server responds with HTTP 201 Created.
  - UI renders the green confirmation card.
  - Confirmation card contains valid application ID matching regex `/^app_\d+_[a-z0-9]+$/`.
  - Resetting returns form to empty initial state.

---

### TC-DUP-01: Duplicate application for same candidate & role prevented
- **Priority**: P1 (High)
- **Type**: Negative / Data Integrity
- **Automation Status**: Automated (`tests/extended-scenarios.spec.ts` — Scenario 8)
- **Preconditions**: Store reset; candidate has not yet applied.
- **Test Data**:
  - Role: `/jobs/job-devops-005`
  - Candidate: `"Jordan Lee"`, `"jordan.lee@testcompany.org"`
- **Execution Steps**:
  1. Submit a valid application for Jordan Lee on `job-devops-005`.
  2. Verify initial submission succeeds (201 Created).
  3. Click "Submit Another Application".
  4. Submit a second application for the exact same job using `"JORDAN.LEE@TESTCOMPANY.ORG"` (testing case-insensitivity).
  5. Observe server response and UI alerts.
- **Expected Result**:
  - Server returns HTTP 409 Conflict.
  - UI displays error banner: "Duplicate application detected: Candidate 'jordan.lee@testcompany.org' has already applied for role...".
  - Success card is not displayed for the second attempt.

---

### TC-REP-01: Rapid repeated clicks & double-submission guarded
- **Priority**: P1 (High)
- **Type**: Concurrency / Resilience
- **Automation Status**: Automated (`tests/extended-scenarios.spec.ts` — Scenario 9)
- **Preconditions**: User is on `/jobs/job-qa-lead-001`.
- **Test Data**: Valid candidate information; artificial latency set to 1500ms via QA panel.
- **Execution Steps**:
  1. Fill form with valid inputs.
  2. Open QA controls panel and set simulated latency to 1,500ms.
  3. Click "Submit Application".
  4. Immediately inspect button attributes while request is inflight.
  5. Attempt to trigger secondary clicks during inflight state.
- **Expected Result**:
  - Submit button is immediately disabled (`disabled="true"`).
  - Spinner icon and text "Submitting Application..." appear.
  - Secondary clicks are ignored; only a single network POST is dispatched.

---

### TC-ERR-01: Controlled server error (HTTP 500) displays friendly alert
- **Priority**: P1 (High)
- **Type**: Resilience / Error Handling
- **Automation Status**: Automated (`tests/extended-scenarios.spec.ts` — Scenario 11)
- **Preconditions**: User is on `/jobs/job-qa-lead-001`.
- **Test Data**: Valid candidate information; simulated server error set to `500`.
- **Execution Steps**:
  1. Fill form with valid inputs.
  2. In QA simulation controls, select "500 Internal Server Error".
  3. Click "Submit Application".
  4. Verify that the server returns HTTP 500.
  5. Assert that the UI renders the error banner (`form-server-error-banner`).
  6. Check that no internal stack traces or database errors are exposed.
  7. Confirm that success banner is NOT displayed.
  8. Confirm that user inputs are preserved in the form.
- **Expected Result**:
  - UI renders graceful alert: "Simulated internal server error for QA resilience verification."
  - No stack traces leaked.
  - Success banner is never falsely displayed.

---

### TC-SEC-01: Production safety guard blocks test-support endpoints
- **Priority**: P1 (High)
- **Type**: Security / Environment Isolation
- **Automation Status**: Automated (`tests/extended-scenarios.spec.ts` — Scenario 12)
- **Preconditions**: Test runner executes HTTP request against test endpoint.
- **Test Data**: `POST /api/test-support/reset` with header `x-simulate-env: production`.
- **Execution Steps**:
  1. Issue a POST request to `/api/test-support/reset` passing production simulation header.
  2. Assert HTTP response status code.
  3. Parse JSON response body.
- **Expected Result**:
  - Server responds with HTTP 403 Forbidden.
  - JSON payload contains `success: false` and message "Test support endpoints are disabled in production mode."

---

### TC-API-01: Direct API POST rejects malformed JSON payloads
- **Priority**: P1 (High)
- **Type**: Negative / API Security
- **Automation Status**: Planned (API Contract Suite)
- **Preconditions**: API route is reachable.
- **Test Data**: Raw request body `"{ invalid_json: ... "`.
- **Execution Steps**:
  1. Send raw malformed payload via `POST /api/applications`.
  2. Assert response status.
- **Expected Result**:
  - HTTP 400 Bad Request with `{ success: false, error: "Malformed JSON payload in request body" }`.

---

### TC-API-02: Direct API POST with non-existent jobId returns 404
- **Priority**: P1 (High)
- **Type**: Negative / API Integrity
- **Automation Status**: Planned (API Contract Suite)
- **Preconditions**: API route is reachable.
- **Test Data**: Payload containing `jobId: "ghost-job-id-999"`.
- **Execution Steps**:
  1. Send valid candidate payload referencing non-existent job ID.
  2. Assert response status and error message.
- **Expected Result**:
  - HTTP 404 Not Found with message "Invalid application target: Job ID 'ghost-job-id-999' does not exist".

---

### TC-API-03: Direct API POST validates server-side without UI
- **Priority**: P1 (High)
- **Type**: Integration / API
- **Automation Status**: Planned (API Contract Suite)
- **Preconditions**: Store reset.
- **Test Data**: Valid JSON payload matching `ApplicationInput`.
- **Execution Steps**:
  1. Dispatch `POST /api/applications` with valid JSON.
  2. Inspect HTTP status, headers, and payload schema.
- **Expected Result**:
  - HTTP 201 Created with JSON structure conforming to `ApiResponse<SubmittedData>`.

---

### TC-RES-01: Simulated slow network response maintains loading state
- **Priority**: P2 (Medium)
- **Type**: Performance / UX Resilience
- **Automation Status**: Planned (Extended Resilience)
- **Preconditions**: Form filled; 3000ms delay selected.
- **Test Data**: `x-test-simulate-delay: 3000`.
- **Execution Steps**:
  1. Submit application with 3-second delay.
  2. Observe loading state persistence over the 3-second window.
- **Expected Result**:
  - Button remains in loading state for exactly 3 seconds before transition to success card.

---

### TC-NET-01: Network disconnection triggers client offline error
- **Priority**: P2 (Medium)
- **Type**: Negative / Network Resilience
- **Automation Status**: Manual
- **Preconditions**: User fills application form.
- **Execution Steps**:
  1. Disconnect network or enable Chrome DevTools "Offline" mode.
  2. Click "Submit Application".
  3. Observe error banner.
- **Expected Result**:
  - UI displays friendly error: "A network error occurred. Please check your connection and try again."

---

### TC-ACC-01: Keyboard navigation and WCAG accessibility compliance
- **Priority**: P2 (Medium)
- **Type**: Accessibility (a11y)
- **Automation Status**: Manual
- **Preconditions**: User starts at top of page `/`.
- **Execution Steps**:
  1. Press Tab repeatedly through header, search filters, and cards.
  2. Check for visible focus rings (`focus-visible:ring-2`).
  3. Fill and submit form using only Tab and Space/Enter keys.
  4. Audit screen reader announcement of validation errors.
- **Expected Result**:
  - Visible focus indicators on all interactive elements.
  - Error messages linked with inputs via `aria-describedby` and announced via `role="alert"`.

---

### TC-CMP-01: Responsive layout across mobile, tablet, and desktop viewports
- **Priority**: P2 (Medium)
- **Type**: Compatibility / Responsive UI
- **Automation Status**: Manual
- **Preconditions**: Application loaded.
- **Execution Steps**:
  1. Test viewport widths: Mobile (`375px`), Tablet (`768px`), Desktop (`1280px`).
  2. Verify grid shifts from 1 column to 2 columns.
  3. Check form input readability and touch target heights (min 44px).
- **Expected Result**:
  - Layout reflows smoothly without horizontal scrollbars. Touch targets meet accessibility guidelines.

---

### TC-NORM-01: Email normalization consistency across duplicate checks
- **Priority**: P1 (High)
- **Type**: Negative / Data Integrity
- **Automation Status**: Automated (`tests/hardening-scenarios.spec.ts` — Scenario 13)
- **Preconditions**: Test persistence cleared.
- **Execution Steps**:
  1. POST `/api/applications` with `Elena.Rostova+QA@TestCorp.COM`.
  2. Assert HTTP 201 Created and normalized candidateEmail `elena.rostova+qa@testcorp.com`.
  3. POST `/api/applications` with whitespace-padded lowercase `   elena.rostova+qa@testcorp.com   ` for the same job.
  4. Assert HTTP 409 Conflict with descriptive duplicate error message.
- **Expected Result**:
  - Case variations and whitespace padding are canonicalized to identical normalized email and rejected as duplicate.

---

### TC-CROSS-01: Same candidate applying to a different job is allowed
- **Priority**: P1 (High)
- **Type**: Positive / Business Logic
- **Automation Status**: Automated (`tests/hardening-scenarios.spec.ts` — Scenario 14)
- **Preconditions**: Test persistence cleared.
- **Execution Steps**:
  1. POST `/api/applications` for `job-qa-lead-001` with `marcus.vance@engineering.io`.
  2. Assert HTTP 201 Created.
  3. POST `/api/applications` for `job-qa-sdet-002` with same email `marcus.vance@engineering.io`.
  4. Assert HTTP 201 Created.
  5. Fetch applications via admin endpoint and verify exactly 2 records exist for `marcus.vance@engineering.io`.
- **Expected Result**:
  - A candidate can apply to multiple distinct jobs; duplicate restriction applies only per job ID.

---

### TC-CONCUR-01: Simultaneous requests duplicate race condition prevention
- **Priority**: P0 (Blocker)
- **Type**: Concurrency / Data Integrity
- **Automation Status**: Automated (`tests/hardening-scenarios.spec.ts` — Scenario 15)
- **Preconditions**: MongoDB compound unique index `{ normalizedEmail: 1, jobId: 1 }` active; test persistence cleared.
- **Execution Steps**:
  1. Create payload for `job-devops-005` and `racer.concurrency@cloudscale.net`.
  2. Dispatch 5 requests in parallel using `Promise.all`.
  3. Collect response statuses and count 201 Created vs 409 Conflict.
  4. Query database via admin endpoint to verify count of persisted records for that candidate and job.
- **Expected Result**:
  - Exactly 1 request succeeds with 201 Created.
  - All 4 competing requests fail with 409 Conflict.
  - Database contains exactly 1 persisted record (zero duplicate records).

---

### TC-LEAK-01: Duplicate attempts return safe 409 without DB leaks
- **Priority**: P1 (High)
- **Type**: Security / Error Masking
- **Automation Status**: Automated (`tests/hardening-scenarios.spec.ts` — Scenario 16)
- **Preconditions**: Application already submitted for candidate.
- **Execution Steps**:
  1. POST second identical application to trigger duplicate key error.
  2. Inspect response body string for sensitive terms (`MongoServerError`, `11000`, `mongodb`, `stack`).
- **Expected Result**:
  - Response status is 409 Conflict. Error message is customer-friendly. Zero database driver or connection internals leaked.

---

### TC-AUTH-01: Unauthenticated candidate PII listing rejected with 401
- **Priority**: P0 (Blocker / Security)
- **Type**: Security / Access Control
- **Automation Status**: Automated (`tests/hardening-scenarios.spec.ts` — Scenario 17)
- **Preconditions**: At least one application persisted in storage.
- **Execution Steps**:
  1. Send unauthenticated GET `/api/applications` without Authorization or admin headers.
  2. Assert HTTP 401 Unauthorized.
  3. Verify response payload contains no candidate records (`data` is undefined).
- **Expected Result**:
  - Access is denied and applicant PII (names, emails, phones, resumes) is protected from unauthorized access.

---

### TC-AUTH-02: Administrator authorization validation (Bearer & Header)
- **Priority**: P1 (High)
- **Type**: Security / Authorization
- **Automation Status**: Automated (`tests/hardening-scenarios.spec.ts` — Scenario 18)
- **Preconditions**: `ADMIN_API_KEY` configured in environment.
- **Execution Steps**:
  1. Request GET `/api/applications` with invalid Bearer token -> assert 401.
  2. Request GET `/api/applications` with invalid `x-admin-key` header -> assert 401.
  3. Request GET `/api/applications` with valid Bearer token -> assert 200 OK with array data.
  4. Request GET `/api/applications` with valid `x-admin-key` -> assert 200 OK.
- **Expected Result**:
  - Requests with invalid credentials are rejected; valid administrator credentials successfully access records.

---

### TC-SEC-02: Test support reset route cannot be operated in production
- **Priority**: P0 (Security)
- **Type**: Security / Environment Isolation
- **Automation Status**: Automated (`tests/hardening-scenarios.spec.ts` — Scenario 19)
- **Preconditions**: Test runner configured.
- **Execution Steps**:
  1. POST `/api/test-support/reset` with header `x-simulate-env: production`.
  2. Assert HTTP 403 Forbidden.
  3. Verify response body explains that test support endpoints are disabled in production.
- **Expected Result**:
  - Reset functionality is permanently disabled in production mode and cannot be overridden by headers or query parameters.

---

### TC-STATE-01: Rejected/unauthorized requests do not mutate stored data
- **Priority**: P1 (High)
- **Type**: Integrity / Idempotency
- **Automation Status**: Automated (`tests/hardening-scenarios.spec.ts` — Scenario 20)
- **Preconditions**: Storage initialized with known baseline count.
- **Execution Steps**:
  1. Record baseline count of applications.
  2. Attempt invalid job ID POST (404).
  3. Attempt validation failure POST (400).
  4. Fetch count again via admin endpoint.
- **Expected Result**:
  - Stored application count is identical to baseline count; rejected requests cause zero side-effects in storage.

---

### TC-MEDIA-01: Content-Type application/json strictly enforced
- **Priority**: P0 (Security)
- **Type**: HTTP Contract / Security
- **Automation Status**: Automated (`tests/hardening-scenarios.spec.ts` — Scenario 21)
- **Execution Steps**:
  1. POST `/api/applications` with `Content-Type: text/plain` -> assert HTTP 415.
  2. POST `/api/applications` with `Content-Type: application/json; charset=utf-8` -> assert HTTP 201.
  3. Verify rejected 415 requests do not mutate storage.
- **Expected Result**:
  - Non-JSON media types are rejected with 415 before body parsing or persistence.

---

### TC-ARRAY-01: Rejection of array, primitive, and non-object JSON payloads
- **Priority**: P1 (High)
- **Type**: Validation / Security
- **Automation Status**: Automated (`tests/hardening-scenarios.spec.ts` — Scenario 22)
- **Execution Steps**:
  1. POST with top-level `[]`, `[{...}]`, `"string"`, and `null`.
  2. Assert each returns HTTP 400 Bad Request with standardized error.
- **Expected Result**:
  - Non-object payloads are rejected before field processing.

---

### TC-SPLIT-01: Configured MongoDB unavailability prevents JSON fallback and recovers cleanly
- **Priority**: P0 (Resilience)
- **Type**: Resilience / Persistence
- **Automation Status**: Automated (`tests/hardening-scenarios.spec.ts` — Scenario 23)
- **Execution Steps**:
  1. Point `MONGODB_URI` to an unreachable port.
  2. Attempt application write -> assert `DatabaseUnavailableError`.
  3. Assert file-based `.data/applications.json` is not modified.
  4. Restore URI in `finally` block and verify clean recovery.
- **Expected Result**:
  - MongoDB is the sole source of truth; split-brain fallback is eliminated.

---

### TC-CRASH-01: JSON persistence performs atomic replacement with zero lingering temp files
- **Priority**: P1 (High)
- **Type**: Resilience / File Storage
- **Automation Status**: Automated (`tests/hardening-scenarios.spec.ts` — Scenario 24)
- **Execution Steps**:
  1. In offline mode, write application record.
  2. Verify record is persisted in `applications.json`.
  3. Verify zero `.applications.*.tmp` files remain in `.data/`.
- **Expected Result**:
  - Atomic rename and descriptor cleanup prevent file corruption and lingering temp files.

---

### TC-ROUT-01: Authentic HTTP 404 returned for nonexistent jobs and 200 for valid jobs
- **Priority**: P0 (Blocker)
- **Type**: Routing / HTTP Status
- **Automation Status**: Automated (`tests/hardening-scenarios.spec.ts` — Scenario 25)
- **Execution Steps**:
  1. GET `/jobs/non-existent-role-uuid-999` -> assert HTTP 404 status.
  2. GET `/jobs/job-qa-lead-001` -> assert HTTP 200 status.
- **Expected Result**:
  - Next.js App Router emits authentic HTTP 404 headers for invalid roles.

---

### TC-SRCH-01: Search catalog by job title
- **Priority**: P1 (High)
- **Type**: Functional / UI Search
- **Automation Status**: Automated (`tests/catalog-filters.spec.ts` — Scenario 26)
- **Execution Steps**:
  1. Enter "Frontend" into search input.
  2. Assert exactly 1 card is displayed matching "Senior Frontend Engineer".

---

### TC-SRCH-02: Search catalog by company name
- **Priority**: P1 (High)
- **Type**: Functional / UI Search
- **Automation Status**: Automated (`tests/catalog-filters.spec.ts` — Scenario 27)
- **Execution Steps**:
  1. Enter "FinPulse" into search input.
  2. Assert card displays FinPulse Systems role.

---

### TC-SRCH-03: Search catalog by location
- **Priority**: P1 (High)
- **Type**: Functional / UI Search
- **Automation Status**: Automated (`tests/catalog-filters.spec.ts` — Scenario 28)
- **Execution Steps**:
  1. Search "Austin" -> 1 on-site position.
  2. Search "Remote" -> 2 remote positions.

---

### TC-SRCH-04: Search catalog by required skill
- **Priority**: P1 (High)
- **Type**: Functional / UI Search
- **Automation Status**: Automated (`tests/catalog-filters.spec.ts` — Scenario 29)
- **Execution Steps**:
  1. Search "Kubernetes" -> 1 DevOps role.

---

### TC-FILT-01: Combined job-type and job-status multi-filter
- **Priority**: P1 (High)
- **Type**: Functional / UI Filter
- **Automation Status**: Automated (`tests/catalog-filters.spec.ts` — Scenario 30)
- **Execution Steps**:
  1. Select Job Type "Contract" + Status "Open" -> assert 1 card.
  2. Select Job Type "Part-time" + Status "Closed" -> assert 1 card.
  3. Select Job Type "Part-time" + Status "Open" -> assert 0 cards and empty state.

---

### TC-FILT-02: Empty search results renders empty-state component
- **Priority**: P1 (High)
- **Type**: UI / Empty State
- **Automation Status**: Automated (`tests/catalog-filters.spec.ts` — Scenario 31)
- **Execution Steps**:
  1. Enter non-matching search query.
  2. Assert `data-testid="empty-jobs-state"` is visible with "No Job Postings Found".

---

### TC-FILT-03: Clearing filters restores complete catalog
- **Priority**: P1 (High)
- **Type**: Functional / UI Reset
- **Automation Status**: Automated (`tests/catalog-filters.spec.ts` — Scenario 32)
- **Execution Steps**:
  1. Apply search and job type filter.
  2. Click `data-testid="clear-filters-btn"`.
  3. Assert search input is cleared and all 6 job cards are visible.

---

### TC-BND-02: Maximum boundary limits enforce validation contracts
- **Priority**: P1 (High)
- **Type**: Boundary / Contract
- **Automation Status**: Automated (`tests/form-boundaries.spec.ts` — Scenario 33)
- **Execution Steps**:
  1. Test boundary maximums for fullName (80), email (100), phone (25), resumeUrl (250), coverLetter (2000).
  2. Test +1 char beyond boundary for each field and assert descriptive rejection.

---

### TC-PHONE-01: Phone validation rejects invalid characters and insufficient digits
- **Priority**: P1 (High)
- **Type**: Validation / Input Syntax
- **Automation Status**: Automated (`tests/form-boundaries.spec.ts` — Scenario 34)
- **Execution Steps**:
  1. Enter phone with invalid characters (`+1 (555) 123-4567 ext`) -> assert character syntax error.
  2. Enter phone with < 7 digits (`12345`) -> assert 7-digit minimum error.
  3. Enter valid format (`+1 (555) 987-6543`) -> assert submission succeeds.

---

### TC-COVER-01: Successful submission with empty optional cover letter
- **Priority**: P1 (High)
- **Type**: Functional / Form Optional
- **Automation Status**: Automated (`tests/form-boundaries.spec.ts` — Scenario 35)
- **Execution Steps**:
  1. Submit application with valid mandatory fields and empty cover letter.
  2. Assert success banner and generated application ID.

---

### TC-CLEAR-01: Field validation error clears dynamically on keystroke
- **Priority**: P1 (High)
- **Type**: UX / Interactive Validation
- **Automation Status**: Automated (`tests/form-boundaries.spec.ts` — Scenario 36)
- **Execution Steps**:
  1. Trigger fullName required error.
  2. Type into fullName input.
  3. Assert error message is dynamically removed.

---

### TC-FOCUS-01: Keyboard focus automatically shifts to first invalid field
- **Priority**: P1 (High)
- **Type**: Accessibility / a11y Focus
- **Automation Status**: Automated (`tests/form-boundaries.spec.ts` — Scenario 37)
- **Execution Steps**:
  1. Submit empty form -> assert `#fullName` is focused.
  2. Fill fullName, submit -> assert `#email` is focused.

---

### TC-MALF-01: Syntactically malformed JSON returns HTTP 400 Bad Request
- **Priority**: P0 (Security)
- **Type**: Security / Error Boundary
- **Automation Status**: Automated (`tests/api-contracts.spec.ts` — Scenario 38)
- **Execution Steps**:
  1. POST raw invalid JSON text with `Content-Type: application/json`.
  2. Assert HTTP 400 with `'Malformed JSON payload in request body'`.

---

### TC-NOJOB-01: Nonexistent target jobId in payload returns HTTP 404
- **Priority**: P1 (High)
- **Type**: Integration / Target Verification
- **Automation Status**: Automated (`tests/api-contracts.spec.ts` — Scenario 39)
- **Execution Steps**:
  1. POST valid application with `jobId: 'job-nonexistent-role-999'`.
  2. Assert HTTP 404 with target not found message.

---

### TC-ORDER-01: Authenticated administrator listing follows descending creation order
- **Priority**: P1 (High)
- **Type**: Integration / Data Ordering
- **Automation Status**: Automated (`tests/api-contracts.spec.ts` — Scenario 40)
- **Execution Steps**:
  1. Submit application A, then application B.
  2. Query `GET /api/applications` as admin.
  3. Assert application B appears before application A (`createdAt: -1`).

---

### TC-METADATA-01: Database internal metadata is excluded from API responses
- **Priority**: P0 (Security)
- **Type**: Security / Data Sanitization
- **Automation Status**: Automated (`tests/api-contracts.spec.ts` — Scenario 41)
- **Execution Steps**:
  1. Verify `POST /api/applications` does not expose `_id` or `ipAddress`.
  2. Verify `GET /api/applications` does not expose MongoDB `_id` on any record.

