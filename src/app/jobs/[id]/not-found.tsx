'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function JobNotFound() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb / Back Navigation */}
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

        {/* Not Found Container */}
        <div
          className="rounded-2xl border border-slate-200 bg-white p-10 sm:p-14 shadow-sm text-center"
          data-testid="job-not-found-container"
        >
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-2xl mx-auto mb-4">
            ✕
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900" data-testid="job-not-found-heading">
            Job Posting Not Found
          </h1>
          <p className="mt-3 text-slate-600 text-sm max-w-md mx-auto">
            We could not find any active job posting{' '}
            {id ? (
              <>
                matching ID{' '}
                <code className="bg-slate-100 px-2 py-0.5 rounded text-rose-600 font-mono text-xs">
                  {id}
                </code>
              </>
            ) : (
              'matching the requested reference ID'
            )}
            . It may have been removed, archived, or the link is invalid.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm"
              data-testid="back-to-jobs-link"
            >
              <span>← Back to All Job Listings</span>
            </Link>
          </div>
        </div>
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
