# Test Cases Specification: HireFlow QA Lab

**Platform**: HireFlow QA Lab  
**Specification Version**: 1.0.0  
**Test Suite Architecture**: Next.js 16 • React 19 • Playwright Test (Chromium)  
**Total Documented Test Cases**: 20 (12 Automated, 4 Manual, 4 Planned/API)  

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
| **TC-BND-02** | Maximum boundary character limits enforcement | P2 | Boundary | **Manual** | Manual verification |
| **TC-APP-01** | Valid application creates record and returns confirmation | P0 | Positive / End-to-End | **Automated (PASSED)** | `tests/critical-scenarios.spec.ts` (Scenario 5) |
| **TC-DUP-01** | Duplicate application for same candidate & role prevented | P1 | Negative / Integrity | **Automated (PASSED)** | `tests/extended-scenarios.spec.ts` (Scenario 8) |
| **TC-REP-01** | Rapid repeated clicks & double-submission guarded | P1 | Concurrency / Resilience | **Automated (PASSED)** | `tests/extended-scenarios.spec.ts` (Scenario 9) |
| **TC-ERR-01** | Controlled server error (HTTP 500) displays friendly alert | P1 | Resilience / Error Handling | **Automated (PASSED)** | `tests/extended-scenarios.spec.ts` (Scenario 11) |
| **TC-SEC-01** | Production safety guard blocks test-support endpoints | P1 | Security / Access Control | **Automated (PASSED)** | `tests/extended-scenarios.spec.ts` (Scenario 12) |
| **TC-API-01** | Direct API POST rejects malformed JSON payloads | P1 | Negative / API Security | **Planned** | API test suite |
| **TC-API-02** | Direct API POST with non-existent jobId returns 404 | P1 | Negative / API Integrity | **Planned** | API test suite |
| **TC-API-03** | Direct API POST validates server-side without UI | P1 | Integration / API | **Planned** | API test suite |
| **TC-RES-01** | Simulated slow network response maintains loading state | P2 | Performance / UX | **Planned** | Extended resilience |
| **TC-NET-01** | Network disconnection triggers client offline error | P2 | Negative / Resilience | **Manual** | Network throttling simulation |
| **TC-ACC-01** | Keyboard navigation and WCAG accessibility compliance | P2 | Accessibility (a11y) | **Manual** | Screen reader / Tab traversal |
| **TC-CMP-01** | Responsive layout across mobile, tablet, and desktop viewports | P2 | Compatibility / UI | **Manual** | DevTools Viewport Emulation |

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
