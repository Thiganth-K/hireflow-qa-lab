import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import JobDetailInteractive from '@/components/JobDetailInteractive';
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
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-sm">
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-28"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="h-6 bg-slate-200 rounded w-28"></div>
            <div className="h-6 bg-slate-200 rounded w-24"></div>
            <div className="h-6 bg-slate-200 rounded w-28"></div>
          </div>
        </div>
        <div className="mt-8 space-y-3 pt-6 border-t border-[var(--border-subtle)]">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
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

  return <JobDetailInteractive job={job} />;
}

export const instant = false;

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = getJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col font-sans text-[var(--ink)] antialiased">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb / Back Link */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded p-1"
            data-testid="back-nav-link"
          >
            <span aria-hidden="true">←</span>
            <span>Back to Job Listings</span>
          </Link>
        </nav>

        {/* Static Shell with PPR Streaming for Async URL Parameters */}
        <Suspense fallback={<JobDetailSkeleton />}>
          <JobDetailContent params={params} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-6 text-center text-xs text-[var(--muted)] mt-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HireFlow QA Lab • Job Application Platform</span>
          <span>Deterministic QA Harness</span>
        </div>
      </footer>
    </div>
  );
}
