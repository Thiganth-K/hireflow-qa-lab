'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function JobNotFound() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col font-sans text-[var(--ink)] antialiased">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb / Back Navigation */}
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

        {/* Not Found Container */}
        <div
          className="card-quiet p-10 sm:p-14 text-center animate-fade-in-up"
          data-testid="job-not-found-container"
        >
          <div className="w-12 h-12 rounded-full bg-[var(--error-subtle)] text-[var(--error)] border border-[var(--error-border)] flex items-center justify-center font-bold text-lg mx-auto mb-4">
            ✕
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight" data-testid="job-not-found-heading">
            Job Posting Not Found
          </h1>
          <p className="mt-2 text-[var(--muted)] text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            We could not find any active job posting{' '}
            {id ? (
              <>
                matching reference ID{' '}
                <code className="bg-[var(--canvas)] px-2 py-0.5 rounded text-[var(--error)] font-mono text-xs border border-[var(--border)]">
                  {id}
                </code>
              </>
            ) : (
              'matching the requested reference ID'
            )}
            . It may have been archived or removed from the catalog.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] shadow-sm"
              data-testid="back-to-jobs-link"
            >
              <span>← Back to All Job Listings</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-6 text-center text-xs text-[var(--muted)] mt-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HireFlow QA Lab • Job Application Platform</span>
          <span>Deterministic QA Harness</span>
        </div>
      </footer>
    </div>
  );
}
