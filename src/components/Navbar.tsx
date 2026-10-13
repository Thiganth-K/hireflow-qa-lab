import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand Link with Official HireFlow Logo */}
        <div className="flex items-center gap-8">
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
              className="h-11 sm:h-13 md:h-14 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Editorial Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-xs font-semibold text-[var(--ink)] hover:text-[var(--accent)] transition-colors py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              Jobs
            </Link>
            <a
              href="#catalog-section"
              className="text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              Catalog
            </a>
            <a
              href="#catalog-section"
              className="text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              Verification
            </a>
          </nav>
        </div>

        {/* Right Status: designed by Thiganth */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50/80 text-[var(--accent)] border border-indigo-100 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
            <span>designed by Thiganth</span>
          </div>
        </div>
      </div>
    </header>
  );
}
