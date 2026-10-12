import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md p-1"
          aria-label="HireFlow QA Lab Home"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-blue-700 transition-colors">
            HF
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
              HireFlow <span className="text-blue-600">QA Lab</span>
            </span>
            <span className="text-xs text-slate-500 font-medium block">
              Job Application Platform
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Job Board
          </Link>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Deterministic QA Environment
          </div>
        </nav>
      </div>
    </header>
  );
}
