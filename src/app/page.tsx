'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { SEED_JOBS } from '@/lib/jobs/jobs-data';

// Helper for company badge icons matching the reference mockup
function getCompanyIcon(id: string) {
  switch (id) {
    case 'job-qa-lead-001':
      return { bg: 'bg-indigo-600', icon: '⚡' };
    case 'job-qa-sdet-002':
      return { bg: 'bg-emerald-600', icon: '🛡️' };
    case 'job-qa-perf-003':
      return { bg: 'bg-purple-600', icon: '⚙️' };
    case 'job-qa-sec-004':
      return { bg: 'bg-amber-600', icon: '🔒' };
    case 'job-qa-man-005':
      return { bg: 'bg-teal-600', icon: '📊' };
    default:
      return { bg: 'bg-blue-600', icon: '🚀' };
  }
}

export default function JobCatalogPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col font-sans text-[var(--ink)] antialiased">
      <Navbar />

      {/* ========================================================================= */}
      {/* HERO SECTION — Full-bleed with herosection.png background (No card box)  */}
      {/* ========================================================================= */}
      <section
        aria-labelledby="hero-heading"
        className="relative w-full border-b border-[var(--border)] overflow-hidden bg-[#f4f7fb]"
        style={{
          backgroundImage: "url('/herosection.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Subtle linear overlay on mobile to guarantee typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent lg:from-white/60 lg:via-white/10 lg:to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* ------------------------------------------------------------------- */}
            {/* Left Side: Editorial Typography, Search & Actions                   */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow */}
              <div className="animate-fade-in-up stagger-1">
                <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wider text-[var(--accent)] uppercase font-mono bg-white/90 backdrop-blur-xs border border-[var(--border)] px-3 py-1 rounded-full shadow-xs">
                  YOUR NEXT CHAPTER STARTS HERE
                </span>
              </div>

              {/* Headline & Supporting Text */}
              <div className="space-y-3 animate-fade-in-up stagger-2">
                <h1
                  id="hero-heading"
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--ink)] tracking-tight leading-[1.12]"
                >
                  Find work that moves <br className="hidden sm:inline" />
                  you forward.
                  {/* Accessible sub-heading preserving Playwright contract */}
                  <span className="block text-sm sm:text-base font-medium text-[var(--muted)] mt-2 font-normal">
                    Explore Open Engineering &amp; QA Opportunities
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[var(--ink-secondary)] max-w-xl leading-relaxed">
                  Explore opportunities, discover roles that match your skills, and take the next step in your career.
                </p>
              </div>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1 animate-fade-in-up stagger-3">
                <a
                  href="#catalog-section"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Explore opportunities</span>
                  <span className="ml-1.5" aria-hidden="true">↓</span>
                </a>

                <a
                  href="#catalog-section"
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-white/90 hover:bg-white text-[var(--ink-secondary)] text-xs sm:text-sm font-medium transition-colors border border-[var(--border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] shadow-xs"
                >
                  How it works
                </a>
              </div>

              {/* Integrated Accessible Search Input matching reference image */}
              <div className="pt-2 max-w-xl animate-fade-in-up stagger-4" role="search" aria-label="Search jobs">
                <label htmlFor="hero-search-input" className="sr-only">
                  Search jobs, skills, or companies
                </label>
                <div className="relative flex items-center bg-white rounded-full border border-slate-200/90 shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:border-transparent transition-all p-1 sm:p-1.5">
                  <div className="pl-3.5 text-slate-400 flex items-center pointer-events-none">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="hero-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search jobs, skills, or companies..."
                    className="w-full px-3 py-2 text-xs sm:text-sm text-[var(--ink)] placeholder-slate-400 bg-transparent focus:outline-none"
                    data-testid="job-search-input"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      aria-label="Clear search"
                      className="px-2 text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors mr-1"
                    >
                      ✕
                    </button>
                  )}
                  {/* Smooth Search Button matching reference image */}
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('catalog-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-5 sm:px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow transition-all flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Live Count & Metrics as plain text (no badges) */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[var(--muted)] font-medium animate-fade-in-up stagger-5">
                <span className="inline-flex items-center gap-1.5 text-[var(--ink-secondary)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                  <span data-testid="total-jobs-count">{SEED_JOBS.length} Verified Roles</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[var(--ink-secondary)]">6 Top Companies</span>
                <span className="text-slate-300">•</span>
                <span className="text-[var(--ink-secondary)]">Remote &amp; Hybrid Positions</span>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* Right Side: Left open to celebrate herosection.png artwork         */}
            {/* ------------------------------------------------------------------- */}
            <div className="hidden lg:block lg:col-span-5" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Main Content (Catalog & Listings) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ========================================================================= */}
        {/* CATALOG TOOLBAR & SECTION HEADER                                         */}
        {/* ========================================================================= */}
        <div
          id="catalog-section"
          className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
              Featured Jobs
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-[var(--muted)]">
              {filteredJobs.length} Available
            </span>
          </div>

          {/* Filtering Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                aria-label="Filter by job type"
                className="pl-3 pr-8 py-2 rounded-lg border border-[var(--border)] bg-white text-xs font-medium text-[var(--ink-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors shadow-xs"
                data-testid="filter-job-type"
              >
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'All' ? 'All Job Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className="pl-3 pr-8 py-2 rounded-lg border border-[var(--border)] bg-white text-xs font-medium text-[var(--ink-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors shadow-xs"
                data-testid="filter-job-status"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open Only</option>
                <option value="Closed">Closed Only</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedType !== 'All' || statusFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('All');
                  setStatusFilter('All');
                }}
                className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded px-1 py-1"
                data-testid="clear-filters-btn"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LISTINGS SECTION                                                         */}
        {/* ========================================================================= */}
        <section aria-label="Job Listings">
          {filteredJobs.length === 0 ? (
            /* Quiet Minimalist Empty State */
            <div
              className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center"
              data-testid="empty-jobs-state"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--canvas)] text-[var(--muted)] mx-auto flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[var(--ink)]">No Job Postings Found</h3>
              <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
                No open positions match your search criteria. Try modifying your keywords or resetting filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('All');
                  setStatusFilter('All');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
              >
                View All Positions
              </button>
            </div>
          ) : (
            /* Responsive 3-Column Grid matching Reference Mockup */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="job-listings-grid">
              {filteredJobs.map((job, idx) => {
                const badge = getCompanyIcon(job.id);
                return (
                  <article
                    key={job.id}
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className={`cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between group animate-fade-in-up stagger-${(idx % 6) + 1}`}
                    data-testid="job-card"
                    data-job-id={job.id}
                  >
                    <div>
                      {/* Top Header with Avatar & Status */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${badge.bg} text-white flex items-center justify-center text-lg font-bold shadow-xs flex-shrink-0`}>
                            {badge.icon}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors leading-snug" data-testid="job-title">
                              <Link
                                href={`/jobs/${job.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
                              >
                                {job.title}
                              </Link>
                            </h3>
                            <span className="text-xs font-medium text-[var(--muted)] block">
                              {job.company}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase flex-shrink-0 ${
                            job.status === 'Open'
                              ? 'bg-[var(--success-subtle)] text-[var(--success)] border border-[var(--success-border)]'
                              : 'bg-slate-100 text-[var(--muted)] border border-slate-200'
                          }`}
                          data-testid="job-status-badge"
                        >
                          {job.status}
                        </span>
                      </div>

                      {/* Metadata Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-[var(--muted)]">
                        <span className="inline-flex items-center gap-1 bg-[var(--canvas)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)]" data-testid="job-location">
                          📍 {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-[var(--canvas)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)]" data-testid="job-type">
                          💼 {job.jobType}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-[var(--canvas)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)]" data-testid="job-experience">
                          ⏳ {job.experienceLevel}
                        </span>
                      </div>

                      {/* Salary */}
                      <div className="text-xs font-semibold text-[var(--success)] mb-2" data-testid="job-salary">
                        {job.salaryRange}
                      </div>

                      {/* Description snippet */}
                      <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed mb-4" data-testid="job-description">
                        {job.description}
                      </p>
                    </div>

                    {/* Footer: Skills & Chevron Arrow Button */}
                    <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5" aria-label="Required skills">
                        {job.requiredSkills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50/70 text-[var(--accent)] border border-indigo-100"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-[var(--muted)]">
                            +{job.requiredSkills.length - 3}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/jobs/${job.id}`}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`View details for ${job.title}`}
                        data-testid="view-job-link"
                        className="w-8 h-8 rounded-full border border-[var(--border)] bg-white text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)] group-hover:bg-indigo-50/50 flex items-center justify-center transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                      >
                        <span className="text-sm font-bold" aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom Banner */}
        <aside className="mt-16 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="text-2xl" aria-hidden="true">✨</span>
            <div>
              <p className="text-sm sm:text-base font-bold text-white">
                Clean. Modern. Focused.
              </p>
              <p className="text-xs text-indigo-100">
                A design system built for real people, real jobs, and real opportunities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white font-bold text-sm tracking-tight opacity-90">
            <Image
              src="/HireFlow Modern Jobs Logo.png"
              alt="HireFlow"
              width={140}
              height={34}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-6 text-center text-xs text-[var(--muted)] mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HireFlow QA Lab • Job Application Platform</span>
          <span>Deterministic QA Harness • 100% Automated Coverage</span>
        </div>
      </footer>
    </div>
  );
}
