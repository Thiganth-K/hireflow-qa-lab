import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ApplicationForm from '@/components/ApplicationForm';
import { getJobById } from '@/lib/jobs/service';
import { SEED_JOBS } from '@/lib/jobs/jobs-data';

export function generateStaticParams() {
  return SEED_JOBS.map((job) => ({
    id: job.id
  }));
}

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

function JobDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8" data-testid="job-detail-skeleton">
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-28"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="h-6 bg-slate-200 rounded w-28"></div>
            <div className="h-6 bg-slate-200 rounded w-24"></div>
            <div className="h-6 bg-slate-200 rounded w-28"></div>
          </div>
        </div>
        <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="h-6 bg-slate-200 rounded w-52 mb-6"></div>
        <div className="space-y-4">
          <div className="h-10 bg-slate-200 rounded w-full"></div>
          <div className="h-10 bg-slate-200 rounded w-full"></div>
          <div className="h-10 bg-slate-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}

async function JobDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJobById(id);

  // Graceful Handling for Invalid or Missing Job ID: Trigger authentic HTTP 404
  if (!job) {
    notFound();
  }

  return (
    <>
      {/* Job Overview Card */}
      <section
        aria-labelledby="job-title-heading"
        className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-8"
        data-testid="job-details-container"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
              {job.company}
            </span>
            <h1 id="job-title-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight" data-testid="detail-job-title">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded" data-testid="detail-job-location">
                📍 {job.location}
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded" data-testid="detail-job-type">
                💼 {job.jobType}
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded" data-testid="detail-job-experience">
                ⏳ {job.experienceLevel}
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded">
                📅 Posted {job.postedDate}
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                job.status === 'Open'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
              data-testid="detail-job-status"
            >
              {job.status} Role
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-800" data-testid="detail-job-salary">
              {job.salaryRange}
            </span>
            <a
              href="#apply-section"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm"
              data-testid="apply-now-hero-btn"
            >
              Apply Now ↓
            </a>
          </div>
        </div>

        {/* Job Description Body */}
        <div className="py-6 border-b border-slate-100 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2">Role Overview</h2>
            <p className="text-sm text-slate-700 leading-relaxed" data-testid="detail-job-description">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2">Key Responsibilities</h2>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700">
              {job.responsibilities.map((resp, index) => (
                <li key={index} className="leading-relaxed">
                  {resp}
                </li>
              ))}
            </ul>
          </div>

          {/* Required Skills */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2">Required Skills & Technologies</h2>
            <div className="flex flex-wrap gap-2" data-testid="detail-skills-list">
              {job.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Reference ID: <span className="font-mono text-slate-600">{job.id}</span></span>
          <a
            href="#apply-section"
            className="text-blue-600 font-semibold hover:underline"
          >
            Ready to submit? Scroll to application form ↓
          </a>
        </div>
      </section>

      {/* Application Form Section */}
      <ApplicationForm
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.company}
      />
    </>
  );
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = getJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb / Back Navigation (App Shell Component) */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
            data-testid="back-nav-link"
          >
            <span aria-hidden="true">←</span>
            <span>Back to Job Listings</span>
          </Link>
        </nav>

        {/* URL-dependent dynamic content rendered behind Suspense */}
        <Suspense fallback={<JobDetailSkeleton />}>
          <JobDetailContent params={params} />
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HireFlow QA Lab • Job Application Platform</span>
          <span>Deterministic QA Harness</span>
        </div>
      </footer>
    </div>
  );
}
