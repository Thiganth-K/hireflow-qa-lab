'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { SEED_JOBS } from '@/lib/jobs/jobs-data';

// Helper for company badge icons & metadata matching the reference mockup
function getCompanyBadge(id: string) {
  switch (id) {
    case 'job-qa-lead-001':
      return {
        bg: 'bg-[#1e2337]',
        tagline: 'Better Cloud Tools',
        pill: 'bg-indigo-50/90 text-indigo-700 border border-indigo-100/70',
        icon: (
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2.52-11 4 4 0 6 1 6 1z" />
          </svg>
        )
      };
    case 'job-qa-sdet-002':
      return {
        bg: 'bg-[#0d9488]',
        tagline: 'Better Financial Tools',
        pill: 'bg-emerald-50/90 text-emerald-700 border border-emerald-100/70',
        icon: (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
          </svg>
        )
      };
    case 'job-fe-dev-003':
      return {
        bg: 'bg-[#4f46e5]',
        tagline: 'Build What\'s Next',
        pill: 'bg-blue-50/90 text-blue-700 border border-blue-100/70',
        icon: (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        )
      };
    case 'job-qa-eng-004':
      return {
        bg: 'bg-[#0284c7]',
        tagline: 'Healthier Tomorrow',
        pill: 'bg-teal-50/90 text-teal-700 border border-teal-100/70',
        icon: (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      };
    case 'job-devops-005':
      return {
        bg: 'bg-[#0f172a]',
        tagline: 'Cloud Infrastructure',
        pill: 'bg-purple-50/90 text-purple-700 border border-purple-100/70',
        icon: (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
      };
    case 'job-qa-contract-006':
    default:
      return {
        bg: 'bg-[#6366f1]',
        tagline: 'Interactive NextGen Media',
        pill: 'bg-indigo-50/90 text-indigo-700 border border-indigo-100/70',
        icon: (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      };
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
        className="relative w-full border-b border-[var(--border)] overflow-hidden bg-[#f4f7fb] min-h-[calc(100vh-5rem)] sm:min-h-[calc(100vh-6rem)] flex items-center py-8 sm:py-12"
        style={{
          backgroundImage: "url('/herosection.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Subtle linear overlay on mobile to guarantee typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent lg:from-white/70 lg:via-white/20 lg:to-transparent pointer-events-none" />

        <div className="relative w-full px-6 sm:px-10 lg:px-14 xl:px-20 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
            {/* ------------------------------------------------------------------- */}
            {/* Left Side: Scaled Editorial Typography, Search & Actions            */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-7 xl:col-span-6 space-y-6 sm:space-y-8">
              {/* Headline & Supporting Text with Scaled Text Size & In-Animation */}
              <div className="space-y-3.5 sm:space-y-4 animate-hero-entrance stagger-1">
                <h1
                  id="hero-heading"
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black text-[var(--ink)] tracking-tight leading-[1.06]"
                >
                  Find work that moves <br className="hidden sm:inline" />
                  you forward.
                  {/* Accessible sub-heading preserving Playwright contract */}
                  <span className="block text-base sm:text-lg lg:text-xl font-semibold text-[var(--muted)] mt-2.5 sm:mt-3 font-normal">
                    Explore Open Engineering &amp; QA Opportunities
                  </span>
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-[var(--ink-secondary)] max-w-2xl leading-relaxed">
                  Explore opportunities, discover roles that match your skills, and take the next step in your career with verified employers.
                </p>
              </div>

              {/* Integrated Scaled Accessible Search Input with In-Animation */}
              <div className="pt-1 max-w-2xl animate-hero-entrance stagger-2" role="search" aria-label="Search jobs">
                <label htmlFor="hero-search-input" className="sr-only">
                  Search jobs, skills, or companies
                </label>
                <div className="relative flex items-center bg-white/95 backdrop-blur-xs rounded-full border border-slate-200/90 shadow-md hover:shadow-lg focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:border-transparent transition-all p-1.5 sm:p-2">
                  <div className="pl-4 text-slate-400 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="hero-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search jobs, skills, or companies..."
                    className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base text-[var(--ink)] placeholder-slate-400 bg-transparent focus:outline-none font-medium"
                    data-testid="job-search-input"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      aria-label="Clear search"
                      className="px-2.5 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors mr-1"
                    >
                      ✕
                    </button>
                  )}
                  {/* Smooth Search Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('catalog-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm md:text-base shadow-xs hover:shadow transition-all flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Live Count & Metrics with SVGs, Badges & In-Animation */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 text-xs sm:text-sm text-[var(--muted)] font-medium animate-hero-entrance stagger-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs text-[var(--ink)]">
                  <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span data-testid="total-jobs-count" className="font-semibold text-[var(--ink)]">{SEED_JOBS.length} Verified Roles</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs text-[var(--ink-secondary)]">
                  <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium">6 Top Companies</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-xs text-[var(--ink-secondary)]">
                  <svg className="w-4 h-4 text-cyan-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Remote &amp; Hybrid Positions</span>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* Right Side: Left open to celebrate herosection.png artwork         */}
            {/* ------------------------------------------------------------------- */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-6" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Main Content (Catalog & Listings) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ========================================================================= */}
        {/* OPPORTUNITIES SECTION HEADER (INSPIRED BY REFERENCE DESIGN)               */}
        {/* ========================================================================= */}
        <div
          id="catalog-section"
          className="relative mb-10 pt-4"
        >
          {/* Decorative soft pastel shapes in top right (matching reference image) */}
          <div className="pointer-events-none absolute -top-10 right-0 w-80 h-52 opacity-70 hidden md:block overflow-hidden" aria-hidden="true">
            <div className="relative w-full h-full">
              <div className="absolute top-0 right-14 w-44 h-44 rounded-full bg-gradient-to-br from-indigo-200/50 via-purple-100/40 to-transparent blur-2xl transform rotate-12" />
              <div className="absolute top-8 right-2 w-40 h-40 rounded-full bg-gradient-to-bl from-teal-200/40 via-emerald-100/30 to-transparent blur-2xl transform -rotate-12" />
            </div>
          </div>

          <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
            {/* Left: Eyebrow + Big Headline + Subtitle */}
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-0.5 bg-indigo-600 rounded-full" />
                <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase font-mono">
                  OPPORTUNITIES
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--ink)] tracking-tight">
                A good place to start.
              </h2>

              <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
                Explore roles worth your attention, from growing teams to established companies.
              </p>
            </div>

            {/* Right: View all link & Filtering Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-shrink-0">
              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Type Filter */}
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    aria-label="Filter by job type"
                    className="pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[var(--ink-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-2xs"
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
                    className="pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[var(--ink-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-2xs"
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
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded px-1.5 py-1"
                    data-testid="clear-filters-btn"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* View all opportunities link from reference mockup */}
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('All');
                  setStatusFilter('All');
                }}
                className="hidden lg:inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors group cursor-pointer"
              >
                <span>View all opportunities</span>
                <span className="ml-1.5 transition-transform group-hover:translate-x-1 font-bold">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LISTINGS SECTION (OPPORTUNITY CARDS MATCHING REFERENCE DESIGN)             */}
        {/* ========================================================================= */}
        <section aria-label="Job Listings">
          {filteredJobs.length === 0 ? (
            /* Empty State */
            <div
              className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs"
              data-testid="empty-jobs-state"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[var(--ink)]">No Job Postings Found</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                No open positions match your search criteria. Try modifying your keywords or resetting filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('All');
                  setStatusFilter('All');
                }}
                className="mt-4 px-5 py-2.5 rounded-full bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
              >
                View All Positions
              </button>
            </div>
          ) : (
            /* Responsive 3-Column Grid Matching Reference Mockup */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7" data-testid="job-listings-grid">
              {filteredJobs.map((job, idx) => {
                const badge = getCompanyBadge(job.id);
                return (
                  <article
                    key={job.id}
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className={`cursor-pointer rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_40px_-10px_rgba(99,102,241,0.12)] hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full group animate-fade-in-up stagger-${(idx % 6) + 1}`}
                    data-testid="job-card"
                    data-job-id={job.id}
                  >
                    <div className="flex flex-col">
                      {/* 1. Company Header (Uniform Height h-13) */}
                      <div className="flex items-center justify-between gap-3 h-13 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-12 h-12 rounded-2xl ${badge.bg} text-white flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                            {badge.icon}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-[var(--ink)] leading-snug truncate">
                              {job.company}
                            </h3>
                            <span className="text-xs text-slate-400 font-medium block truncate mt-0.5">
                              {badge.tagline}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase flex-shrink-0 ${
                            job.status === 'Open'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                          data-testid="job-status-badge"
                        >
                          {job.status}
                        </span>
                      </div>

                      {/* 2. Job Title (Locked Height h-14 sm:h-16 for Perfect Baseline Alignment) */}
                      <div className="h-14 sm:h-16 flex items-start mb-2.5">
                        <h3 className="text-lg sm:text-xl font-black text-[var(--ink)] group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2" data-testid="job-title">
                          <Link
                            href={`/jobs/${job.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded"
                          >
                            {job.title}
                          </Link>
                        </h3>
                      </div>

                      {/* 3. Location & Job Type Row (Locked Height h-6) */}
                      <div className="h-6 flex items-center text-xs text-slate-500 font-medium mb-3">
                        <span className="inline-flex items-center gap-1.5 truncate max-w-[170px]" data-testid="job-location">
                          <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{job.location}</span>
                        </span>
                        <span className="text-slate-300 font-light mx-2" aria-hidden="true">|</span>
                        <span className="inline-flex items-center gap-1.5 flex-shrink-0" data-testid="job-type">
                          <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{job.jobType}</span>
                        </span>
                      </div>

                      {/* 4. Salary & Experience Micro-Row (Locked Height h-8) */}
                      <div className="h-8 flex items-center justify-between text-xs px-3 rounded-lg bg-slate-50 border border-slate-100/90 mb-3.5 font-medium">
                        <span className="font-bold text-emerald-700" data-testid="job-salary">
                          {job.salaryRange}
                        </span>
                        <span className="text-slate-400 font-normal" data-testid="job-experience">
                          {job.experienceLevel}
                        </span>
                      </div>

                      {/* 5. Description Snippet (Locked Height h-10 with line-clamp-2) */}
                      <div className="h-10 overflow-hidden mb-4">
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal" data-testid="job-description">
                          {job.description}
                        </p>
                      </div>

                      {/* 6. Skill Badges (Uniform Single Row h-7 to Prevent Wrapping Differences) */}
                      <div className="h-7 flex items-center gap-1.5 overflow-hidden mb-5" aria-label="Required skills">
                        {job.requiredSkills.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badge.pill}`}
                          >
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills.length > 2 && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 whitespace-nowrap">
                            +{job.requiredSkills.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 7. Footer Actions (Locked Height pt-4 Aligned Across All Cards) */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                      <Link
                        href={`/jobs/${job.id}`}
                        onClick={(e) => e.stopPropagation()}
                        data-testid="view-job-link"
                        className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors group/link focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded"
                      >
                        <span>View role</span>
                        <span className="ml-1.5 transition-transform group-hover/link:translate-x-1 font-bold">→</span>
                      </Link>

                      <div
                        aria-hidden="true"
                        className="w-9 h-9 rounded-full bg-indigo-50/90 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs"
                      >
                        <span className="text-sm font-bold">→</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* TECH STACK & DEVELOPER ARCHITECTURE SECTION                               */}
        {/* ========================================================================= */}
        <section
          id="tech-stack"
          className="mt-20 pt-16 border-t border-[var(--border)]"
          aria-labelledby="tech-stack-heading"
        >
          {/* Section Header */}
          <div className="mb-12 text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 font-mono">
              DEVELOPER ARCHITECTURE &amp; STACK
            </span>
            <h2
              id="tech-stack-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--ink)] tracking-tight"
            >
              Architected for Performance &amp; Precision
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
              Explore the developer architecture powering HireFlow — built with Graphify AST mapping, UI/UX Pro Max design intelligence, and an optimized Next.js engineering workflow.
            </p>
          </div>

          {/* 3-Pillar Developer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Graphify AST Intelligence */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 border border-indigo-100 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-[var(--ink)]">Graphify AST Engine</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Code Graph</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-4">
                  Full codebase knowledge graph extracted via persistent Abstract Syntax Trees (AST). Automatically maps node relationships, detects god nodes, and prevents architecture drift.
                </p>
              </div>
              <ul className="space-y-2 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--ink-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>AST hierarchy &amp; dependency cluster mapping</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Zero circular import &amp; god-node detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Persistent cross-file symbol indexing</span>
                </li>
              </ul>
            </div>

            {/* Card 2: UI/UX Pro Max System */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 border border-purple-100 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-[var(--ink)]">UI/UX Pro Max</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Design Tokens</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-4">
                  Curated Quiet Precision token architecture. 3-layer design tokens, WCAG AAA readability, fluid responsive typography, and tactile micro-animations without runtime bloat.
                </p>
              </div>
              <ul className="space-y-2 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--ink-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>3-tier CSS variables (--canvas, --surface, --ink)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>Dynamic scroll transitions &amp; staggered entrance</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>Interactive card reveal with accessible focus states</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Optimised Dev Engine */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 md:col-span-2 lg:col-span-1">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-[var(--ink)]">Optimised Dev Engine</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Next.js 15</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-4">
                  Built on modern Next.js 15 App Router with pure React 19 reconciliation. Zero-bundle overhead client boundaries, sub-millisecond filtering, and deterministic rendering.
                </p>
              </div>
              <ul className="space-y-2 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--ink-secondary)]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Next.js 15 App Router with hybrid hydration</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Strict end-to-end TypeScript data contracts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Sub-millisecond client filtering &amp; instant search</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Developer Stack Tech Pill Badges */}
          <div className="mt-8 rounded-xl bg-slate-50 border border-[var(--border)] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[var(--ink)] uppercase tracking-wider font-mono">
              Tech Stack:
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">Next.js 15</span>
              <span className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">React 19</span>
              <span className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">TypeScript 5</span>
              <span className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">Graphify AST</span>
              <span className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">UI/UX Pro Max</span>
              <span className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">Tailwind CSS</span>
              <span className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-xs">Vanilla Design Tokens</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-6 text-center text-xs text-[var(--muted)] mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HireFlow • Modern Engineering &amp; Developer Stack</span>
          <span>Powered by Graphify AST • UI/UX Pro Max • Next.js 15</span>
        </div>
      </footer>
    </div>
  );
}
