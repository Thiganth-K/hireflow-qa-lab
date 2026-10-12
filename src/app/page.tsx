'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { SEED_JOBS } from '@/lib/jobs/jobs-data';

export default function JobCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredJobs = useMemo(() => {
    return SEED_JOBS.filter((job) => {
      // Type filter
      if (selectedType !== 'All' && job.jobType !== selectedType) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'All' && job.status !== statusFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim().length > 0) {
        const query = searchTerm.toLowerCase().trim();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesLocation = job.location.toLowerCase().includes(query);
        const matchesSkill = job.requiredSkills.some((s) =>
          s.toLowerCase().includes(query)
        );
        return matchesTitle || matchesCompany || matchesLocation || matchesSkill;
      }
      return true;
    });
  }, [searchTerm, selectedType, statusFilter]);

  const jobTypes = ['All', 'Full-time', 'Contract', 'Part-time'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center sm:text-left mb-8 pb-8 border-b border-slate-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            <span>HireFlow Open Positions</span>
            <span>•</span>
            <span data-testid="total-jobs-count">{SEED_JOBS.length} Verified Roles</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore Open Engineering & QA Opportunities
          </h1>
          <p className="mt-2 text-base text-slate-600 max-w-2xl">
            Browse our deterministic job catalog, inspect role requirements, and submit testable applications.
            Every listing maps directly to verified detail pages and server-side validation rules.
          </p>

          {/* Search and Filters Bar */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3" role="search" aria-label="Filter Job Catalog">
            <div className="sm:col-span-6 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, skill, or company..."
                aria-label="Search jobs"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors shadow-sm"
                data-testid="job-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                aria-label="Filter by job type"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors shadow-sm"
                data-testid="filter-job-type"
              >
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'All' ? 'All Job Types' : type}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors shadow-sm"
                data-testid="filter-job-status"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open Only</option>
                <option value="Closed">Closed Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <section aria-labelledby="listings-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="listings-heading" className="text-xl font-bold text-slate-900 tracking-tight">
              Available Positions ({filteredJobs.length})
            </h2>
            {(searchTerm || selectedType !== 'All' || statusFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('All');
                  setStatusFilter('All');
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                data-testid="clear-filters-btn"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {filteredJobs.length === 0 ? (
            /* Empty State */
            <div
              className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center"
              data-testid="empty-jobs-state"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-xl font-bold mb-3">
                ?
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Job Postings Found</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                No open positions match your search criteria. Try modifying your keywords or resetting filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('All');
                  setStatusFilter('All');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                View All Positions
              </button>
            </div>
          ) : (
            /* Job Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-testid="job-listings-grid">
              {filteredJobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                  data-testid="job-card"
                  data-job-id={job.id}
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
                          {job.company}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug" data-testid="job-title">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                          >
                            {job.title}
                          </Link>
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider flex-shrink-0 ${
                          job.status === 'Open'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                        data-testid="job-status-badge"
                      >
                        {job.status}
                      </span>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded" data-testid="job-location">
                        📍 {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded" data-testid="job-type">
                        💼 {job.jobType}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded" data-testid="job-experience">
                        ⏳ {job.experienceLevel}
                      </span>
                    </div>

                    {/* Salary Highlight */}
                    <div className="mt-3 text-sm font-semibold text-emerald-800" data-testid="job-salary">
                      {job.salaryRange}
                    </div>

                    {/* Description snippet */}
                    <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed" data-testid="job-description">
                      {job.description}
                    </p>

                    {/* Skills pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Required skills">
                      {job.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: {job.id}
                    </span>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
                      data-testid="view-job-link"
                    >
                      <span>View Role & Apply</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HireFlow QA Lab • Automated Testing & Assessment Harness</span>
          <span>Next.js 16 • React 19 • Playwright Automation</span>
        </div>
      </footer>
    </div>
  );
}
