# Graph Report - hireflow-qa-lab  (2026-10-13)

## Corpus Check
- Corpus is ~49,525 words - fits in a single context window. You may not need a graph.

## Summary
- 172 nodes · 286 edges · 18 communities (9 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.88)
- Token cost: 12,500 input · 2,800 output

## Community Hubs (Navigation)
- Project Configuration & Runtime Dependencies
- Test Harness & Hardened Persistence
- Applications API & Authorization Routes
- TypeScript Compilation Settings
- Next.js App Shell & Routing
- Job Catalog & Dynamic Detail Views
- QA Defect Tracking & Hardening Specs
- Development Tooling & Linters
- QA Visualizer & Architecture Pillars
- Next.js App Router Rules
- Agent Guidelines & Prompts
- React 19 Form Hydration Guard
- Layered Test Pyramid Strategy
- Test Priority Governance
- QA Risk Mitigation Framework
- Next.js Vector Assets
- Vercel Platform Branding
- Visual Guide Documentation

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `saveApplication()` - 14 edges
3. `DatabaseUnavailableError` - 11 edges
4. `getAllApplications()` - 10 edges
5. `findApplication()` - 10 edges
6. `next` - 9 edges
7. `initMongo()` - 9 edges
8. `clearApplications()` - 9 edges
9. `@playwright/test` - 8 edges
10. `isMongoConfigured()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Interactive Scenario 15 Concurrency Race Simulator` --semantically_similar_to--> `TC-CONCUR-01 (Scenario 15 Simultaneous Duplicate Race)`  [INFERRED] [semantically similar]
  qa-guide/index.html → docs/test-cases.md
- `MongoDB Atomic Compound Unique Index Architecture` --conceptually_related_to--> `TOCTOU Concurrency Race in Application Submission Fix`  [INFERRED]
  README.md → docs/bug-reports.md
- `Controlled Failure Simulation & Test Support System` --conceptually_related_to--> `8 Pillars of Quality Assurance in HireFlow`  [INFERRED]
  README.md → qa-guide/index.html
- `POST()` --calls--> `clearApplications()`  [EXTRACTED]
  src/app/api/test-support/reset/route.ts → src/lib/applications/repository.ts
- `HireFlow QA Lab Platform README` --cites--> `HireFlow QA Lab Test Plan`  [EXTRACTED]
  README.md → docs/test-plan.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **QA Reliability Hardening Trio** — docs_bug_reports_toctou_concurrency_race_finding, docs_bug_reports_candidate_pii_exposure_finding, docs_bug_reports_react19_hydration_defect_res_001 [EXTRACTED 0.75]
- **HireFlow Quality Assurance Documentation Suite** — docs_test_plan_test_plan_hireflow_qa_lab, docs_test_cases_test_cases_specification, docs_bug_reports_defect_reports_bug_tracking, qa_guide_readme_visual_qa_guide [EXTRACTED 0.75]

## Communities (18 total, 9 thin omitted)

### Community 0 - "Project Configuration & Runtime Dependencies"
Cohesion: 0.06
Nodes (27): eslintConfig, dependencies, mongodb, next, react, react-dom, name, private (+19 more)

### Community 1 - "Test Harness & Hardened Persistence"
Cohesion: 0.17
Nodes (25): envLocalPath, ref_fs, ref_path, assertDeploymentBackendAllowed(), AsyncMutex, clearApplications(), DATA_DIR, DATA_FILE (+17 more)

### Community 2 - "Applications API & Authorization Routes"
Cohesion: 0.16
Nodes (16): react, GET(), isApplicationJson(), isAuthorizedAdmin(), POST(), POST(), ApplicationFormProps, SubmittedData (+8 more)

### Community 3 - "TypeScript Compilation Settings"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "Next.js App Shell & Routing"
Cohesion: 0.18
Nodes (10): nextConfig, next, src_app_globals, JobNotFound(), JobsPage(), geistMono, geistSans, metadata (+2 more)

### Community 5 - "Job Catalog & Dynamic Detail Views"
Cohesion: 0.21
Nodes (11): instant, JobDetailContent(), JobDetailPage(), JobDetailPageProps, JobDetailSkeleton(), ApplicationForm(), SEED_JOBS, getJobById() (+3 more)

### Community 6 - "QA Defect Tracking & Hardening Specs"
Cohesion: 0.24
Nodes (10): Unprotected Candidate PII Exposure Guard Fix, HireFlow Defect Reports & Bug Tracking, TOCTOU Concurrency Race in Application Submission Fix, TC-AUTH-01 (Unauthenticated Candidate PII Listing Rejected), TC-CONCUR-01 (Scenario 15 Simultaneous Duplicate Race), HireFlow Test Cases Specification (41 Scenarios), HireFlow QA Lab Test Plan, Interactive Scenario 15 Concurrency Race Simulator (+2 more)

### Community 7 - "Development Tooling & Linters"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, @playwright/test, tailwindcss, @tailwindcss/turbopack, @types/node, @types/react (+2 more)

### Community 8 - "QA Visualizer & Architecture Pillars"
Cohesion: 0.50
Nodes (4): QA Traceability Matrix & Execution Summary, 8 Pillars of Quality Assurance in HireFlow, Interactive QA Features Visualizer Dashboard HTML, Controlled Failure Simulation & Test Support System

## Knowledge Gaps
- **74 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+69 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 86 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Next.js App Shell & Routing` to `Project Configuration & Runtime Dependencies`, `Applications API & Authorization Routes`, `Job Catalog & Dynamic Detail Views`?**
  _High betweenness centrality (0.173) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Development Tooling & Linters` to `Project Configuration & Runtime Dependencies`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `@playwright/test` connect `Project Configuration & Runtime Dependencies` to `Test Harness & Hardened Persistence`, `Applications API & Authorization Routes`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Project Configuration & Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `TypeScript Compilation Settings` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._