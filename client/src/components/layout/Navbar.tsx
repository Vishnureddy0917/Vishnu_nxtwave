import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Trophy, ShieldCheck, ArrowRight, Layers } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-electric flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">LaunchLoop</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">AI</span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">Campus Growth & Referral Engine</p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {isHome ? (
            <>
              <a href="#overview" className="hover:text-brand-600 transition-colors">Overview</a>
              <a href="#project-preview" className="hover:text-brand-600 transition-colors">What You'll Build</a>
              <a href="#outcomes" className="hover:text-brand-600 transition-colors">Learning Outcomes</a>
              <a href="#faq" className="hover:text-brand-600 transition-colors">FAQ</a>
            </>
          ) : (
            <Link to="/" className="hover:text-brand-600 transition-colors">Workshop Home</Link>
          )}
          <Link
            to="/leaderboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200/60 font-semibold"
          >
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Leaderboard</span>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            title="Campaign Command Center"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Admin Portal</span>
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-sm shadow-brand-500/25 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <span>Reserve Free Spot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
