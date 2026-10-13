'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`border-b border-[var(--border)] sticky top-0 z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-slate-200/80'
          : 'bg-[var(--surface)] shadow-none'
      }`}
    >
      <div
        className={`relative w-full px-6 sm:px-10 lg:px-14 xl:px-20 flex items-center justify-between transition-all duration-300 ease-in-out ${
          scrolled ? 'h-16 sm:h-18' : 'h-20 sm:h-24'
        }`}
      >
        {/* Left: Brand Link with Official HireFlow Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg py-1"
            aria-label="HireFlow Home"
          >
            <Image
              src="/HireFlow Modern Jobs Logo.png"
              alt="HireFlow - Modern Jobs. Real Opportunities."
              width={240}
              height={60}
              priority
              className={`w-auto object-contain transition-all duration-300 group-hover:scale-[1.02] ${
                scrolled ? 'h-9 sm:h-11' : 'h-11 sm:h-14'
              }`}
            />
          </Link>
        </div>

        {/* Center: Editorial Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 pointer-events-auto"
          aria-label="Main Navigation"
        >
          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold text-[var(--ink)] hover:text-[var(--accent)] transition-colors py-1 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
          >
            Jobs
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)] rounded-full transition-all" />
          </Link>
          <a
            href="#catalog-section"
            className="text-xs sm:text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors py-1 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
          >
            Catalog
          </a>
          <a
            href="#tech-stack"
            className="text-xs sm:text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors py-1 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
          >
            Tech Stack
          </a>
        </nav>

        {/* Right Actions: How it works & Explore opportunities */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#catalog-section"
            className={`hidden sm:inline-flex items-center justify-center rounded-lg bg-white/90 hover:bg-white text-[var(--ink-secondary)] hover:text-[var(--ink)] font-medium transition-all duration-300 border border-[var(--border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] shadow-xs ${
              scrolled ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:text-sm'
            }`}
          >
            How it works
          </a>
          <a
            href="#catalog-section"
            className={`inline-flex items-center justify-center rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold transition-all duration-300 shadow-xs hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] active:scale-[0.98] ${
              scrolled ? 'px-3.5 py-1.5 text-xs' : 'px-4.5 py-2 text-xs sm:text-sm'
            }`}
          >
            <span>Explore opportunities</span>
            <span className="ml-1 text-[11px]" aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </header>
  );
}
