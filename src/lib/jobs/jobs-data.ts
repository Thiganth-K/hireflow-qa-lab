import { Job } from './types';

export const SEED_JOBS: Job[] = [
  {
    id: 'job-qa-lead-001',
    title: 'Lead QA Automation Engineer',
    company: 'CloudScale Technologies',
    location: 'Remote (US/Canada)',
    jobType: 'Full-time',
    experienceLevel: '5+ years',
    salaryRange: '$140,000 - $170,000 / year',
    description:
      'Lead our quality engineering initiative across distributed microservices and modern web frontends. Architect robust Playwright E2E suites, mentor QA engineers, and champion CI/CD testing standards.',
    requiredSkills: [
      'Playwright',
      'TypeScript',
      'CI/CD Pipelines',
      'API Automation',
      'Test Strategy'
    ],
    responsibilities: [
      'Design, maintain, and scale multi-tier automated test architectures in Playwright and TypeScript.',
      'Establish test coverage metrics and regression test suites for daily production releases.',
      'Collaborate with product and engineering teams to identify edge cases early in sprint cycles.',
      'Drive test environment reliability and deterministic seed data strategies.'
    ],
    status: 'Open',
    postedDate: '2026-10-01'
  },
  {
    id: 'job-qa-sdet-002',
    title: 'Senior SDET (Software Development Engineer in Test)',
    company: 'FinPulse Systems',
    location: 'New York, NY (Hybrid)',
    jobType: 'Full-time',
    experienceLevel: '4+ years',
    salaryRange: '$130,000 - $160,000 / year',
    description:
      'Build mission-critical automated verification pipelines for our high-throughput financial transaction engine. Focus on API contract testing, performance validation, and resilient UI workflows.',
    requiredSkills: [
      'TypeScript',
      'Playwright',
      'REST & GraphQL APIs',
      'Docker',
      'Jest'
    ],
    responsibilities: [
      'Implement automated smoke, sanity, and full regression test suites across modern browsers.',
      'Construct automated API mock harnesses and test isolation utilities.',
      'Partner with DevOps to execute automated tests in parallel GitHub Actions runners.',
      'Investigate production anomalies and reproduce bugs with clear root cause analyses.'
    ],
    status: 'Open',
    postedDate: '2026-10-04'
  },
  {
    id: 'job-fe-dev-003',
    title: 'Senior Frontend Engineer (React / Next.js)',
    company: 'Apex Digital Studio',
    location: 'San Francisco, CA (Hybrid)',
    jobType: 'Full-time',
    experienceLevel: '4+ years',
    salaryRange: '$135,000 - $165,000 / year',
    description:
      'Craft high-performance, accessible web applications using Next.js App Router, React 19, and Tailwind CSS. Emphasize WCAG compliance, user experience excellence, and testability.',
    requiredSkills: [
      'React',
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Web Accessibility (a11y)'
    ],
    responsibilities: [
      'Develop modular, accessible UI component libraries following WCAG 2.1 AA guidelines.',
      'Optimize Core Web Vitals, server-side streaming, and layout shifts.',
      'Work alongside QA engineers to add test identifiers and verify resilient form states.',
      'Ensure strict client and server data validation across all user interactions.'
    ],
    status: 'Open',
    postedDate: '2026-10-06'
  },
  {
    id: 'job-qa-eng-004',
    title: 'QA Automation Engineer',
    company: 'HealthSync Solutions',
    location: 'Austin, TX (On-site)',
    jobType: 'Full-time',
    experienceLevel: '2+ years',
    salaryRange: '$95,000 - $120,000 / year',
    description:
      'Verify healthcare compliance workflows and patient portal features. Build maintainable automated test scripts and validate boundary conditions for patient data forms.',
    requiredSkills: [
      'Playwright',
      'JavaScript / TypeScript',
      'Manual Test Design',
      'Jira',
      'Postman'
    ],
    responsibilities: [
      'Draft detailed test cases spanning positive, negative, and boundary scenarios.',
      'Execute automated end-to-end regression suites and report defects with steps to reproduce.',
      'Verify form validation behaviors, error handling states, and cross-browser responsiveness.',
      'Participate in daily standups and sprint bug grooming sessions.'
    ],
    status: 'Open',
    postedDate: '2026-10-08'
  },
  {
    id: 'job-devops-005',
    title: 'DevOps & Reliability Engineer',
    company: 'Aegis Cloud Security',
    location: 'Remote (Global)',
    jobType: 'Contract',
    experienceLevel: '3+ years',
    salaryRange: '$65 - $85 / hour',
    description:
      'Manage containerized test environments, ephemeral staging deployments, and automated testing infrastructure across multi-region Kubernetes clusters.',
    requiredSkills: [
      'Kubernetes',
      'AWS',
      'Terraform',
      'GitHub Actions',
      'Linux'
    ],
    responsibilities: [
      'Automate ephemeral preview environments for pull-request testing workflows.',
      'Optimize browser automation execution times in CI via sharding and caching.',
      'Monitor application latency, error rates, and resource utilization.',
      'Implement zero-trust security policies for staging and test infrastructure.'
    ],
    status: 'Open',
    postedDate: '2026-10-09'
  },
  {
    id: 'job-qa-contract-006',
    title: 'Junior QA Tester (Manual & Exploratory)',
    company: 'NextWave Interactive',
    location: 'Chicago, IL (Hybrid)',
    jobType: 'Part-time',
    experienceLevel: '1+ years',
    salaryRange: '$35 - $45 / hour',
    description:
      'Conduct rigorous exploratory, functional, and accessibility testing across desktop and mobile browsers. Document detailed bug reports and assist in automation triage.',
    requiredSkills: [
      'Exploratory Testing',
      'Bug Reporting',
      'Test Matrix Creation',
      'Cross-browser Testing'
    ],
    responsibilities: [
      'Execute manual test scripts against new releases before automated test sign-off.',
      'Log actionable bug reports containing clear repro steps, expected vs. actual results, and logs.',
      'Audit form boundaries, input field limitations, and error banner accessibility.'
    ],
    status: 'Closed',
    postedDate: '2026-09-20'
  }
];
