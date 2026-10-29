import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-md">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-widest">
          Error 404
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          The requested URL does not exist or has been moved. Explore the workshop landing page or student leaderboard.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-md active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Workshop Home</span>
        </Link>
        <Link
          to="/leaderboard"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all"
        >
          <span>View Leaderboard</span>
        </Link>
      </div>
    </div>
  );
};
