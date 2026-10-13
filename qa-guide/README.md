# HireFlow QA Lab — Visual QA Features Guide & Dashboard

Welcome to the **HireFlow QA Features Visualizer & Interactive Guide**.

This directory contains an interactive, single-page visual dashboard designed to help you:
1. **Understand and master** every quality assurance feature, concurrency protection, and security control enabled in this repository.
2. **Interact live** with the validation engine, deduplication policy, and concurrency race conditions in a browser sandbox.
3. **Present and explain** the architecture, test strategy, and bug lifecycle to interviewers, managers, and engineering peers.

---

## 🚀 How to Open and View the Visualizer

You can open the HTML visualizer in **any web browser** without needing a web server or compilation:

### Option 1: Direct File Open
Double-click [`index.html`](./index.html) or open it from your file explorer:
```text
d:\IMPORTANT_FILES\PROJECT_FILES\hireflow-qa-lab\qa-guide\index.html
```

### Option 2: Browser Subagent or Static Server
If you are running a local dev server or static HTTP server, you can serve the file or open it directly:
```powershell
start d:\IMPORTANT_FILES\PROJECT_FILES\hireflow-qa-lab\qa-guide\index.html
```

---

## 🌟 What is Visualized in `index.html`?

### 1. The QA Test Pyramid (Interactive Diagram)
- **Layer 4: E2E Browser Journeys**: Playwright Chromium (24 UI tests) with accessibility-first locators (`getByRole`, `getByTestId`), web-first assertions, zero arbitrary sleeps, and automated screenshot/trace capture on failure.
- **Layer 3: API Contracts & Hardening**: Direct route testing with HTTP 415 media type verification, malformed JSON handling, and the 5-parallel request race condition test.
- **Layer 2: Hardened Persistence**: MongoDB compound unique index `{ normalizedEmail: 1, jobId: 1 }`, atomic file replacement (`writeFileAtomic`), and split-brain protection (HTTP 503 instead of silent JSON fallback).
- **Layer 1: Static Contracts & Hydration**: TypeScript strict mode (`tsc --noEmit`), ESLint 9 Next.js rules, and React 19 `useSyncExternalStore` hydration detection.

### 2. The 8 Pillars of QA Features
- **Pillar 1: Concurrency & TOCTOU Race Condition Mitigation** (Scenario 15: 5 parallel requests tested with `Promise.all` ➔ 1 saved with 201, 4 rejected with 409).
- **Pillar 2: Applicant PII Protection & Access Control** (`GET /api/applications` fails-closed with 401 Unauthorized unless authenticated via `ADMIN_API_KEY`).
- **Pillar 3: Input Boundary Gates** (Rejection of whitespace-only strings `'   '`, boundary minimums/maximums, dynamic inline keystroke clearing, auto-focus to first invalid field).
- **Pillar 4: Canonical Email Normalization** (`email.trim().toLowerCase()` uniform across ingestion and lookup; cross-job applications allowed).
- **Pillar 5: Controlled QA Failure Simulation** (`x-test-simulate-delay`, `x-test-simulate-error: 500`, and the in-app QA controls panel on the form).
- **Pillar 6: Accessibility (a11y) & Hydration Safety** (`useSyncExternalStore` preventing fast automation clicks before React hydrates).
- **Pillar 7: Production Safety Lockdown** (`POST /api/test-support/reset` unconditionally blocked with 403 Forbidden in `NODE_ENV === 'production'`).
- **Pillar 8: Storage Resilience & Split-Brain Prevention** (MongoDB outage returns 503 Service Unavailable rather than silently bifurcating data to file storage).

### 3. Interactive Live Playground
Test the application rules in real-time right in your browser:
- **Boundary Sandbox**: Type names, emails, phones, and URLs to watch RFC regex and boundary limits trigger live hints and character counters.
- **Scenario 15 Concurrency Race Simulator**: Fire 5 simulated concurrent threads at once to watch the atomic compound index permit exactly 1 thread (201 Created) and reject the other 4 (409 Conflict).
- **Normalization Sandbox**: Test submitting uppercase, padded emails to see how canonical normalization detects duplicates.
- **Security & PII Simulator**: Toggle between anonymous public access, invalid tokens, and valid admin tokens to inspect PII protection.
- **QA Headers Simulator**: Inject artificial 2,500ms delay and HTTP 500 server errors to observe user-facing resilience.

### 4. Traceability Matrix (All 41 Automated Scenarios)
- Searchable, filterable table spanning all 6 test suite files:
  - `tests/critical-scenarios.spec.ts` (5 tests)
  - `tests/extended-scenarios.spec.ts` (7 tests)
  - `tests/hardening-scenarios.spec.ts` (13 tests)
  - `tests/catalog-filters.spec.ts` (7 tests)
  - `tests/form-boundaries.spec.ts` (5 tests)
  - `tests/api-contracts.spec.ts` (4 tests)
- Filter pills by Priority (**P0 Blocker**, **P1 High**, **P2 Medium**).

### 5. "How to Explain to Others" Presentation Toolkit
- **The 2-Minute Elevator Pitch**: What to say in an interview or quick overview.
- **The 5-Minute Technical Deep Dive**: How to explain the TOCTOU race condition and MongoDB compound unique index.
- **Tailored Talking Points**: Specific highlights for QA Leads, Backend Engineers, and Security Auditors.
- **Anticipated Interview Questions**: Flashcards addressing why 1 worker is used, how React 19 hydration was handled, and why split-brain prevention matters.

### 6. Real Code Inspector
- Tabbed view of key code snippets: `repository.ts`, `api/applications/route.ts`, `ApplicationForm.tsx`, `hardening-scenarios.spec.ts`, and `playwright.config.ts`.

---

## 🧪 Testing Commands Summary

| Command | Purpose |
|---|---|
| `npm run test:e2e` | Run all 41 automated Playwright scenarios |
| `npm run test:report` | Open the official Playwright HTML execution report |
| `npx playwright test tests/critical-scenarios.spec.ts` | Run the 5 core P0 scenarios |
| `npx playwright test tests/hardening-scenarios.spec.ts` | Run the 13 concurrency & security hardening scenarios |
| `npx tsc --noEmit && npm run lint` | Verify TypeScript types and ESLint 9 rules |
