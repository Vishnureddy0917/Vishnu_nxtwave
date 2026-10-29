import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>LaunchLoop AI</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Integrated student acquisition and viral referral platform built for NxtWave's Growth Challenge:
              “Build Your First AI Project in 60 Minutes”.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                100% Local NoSQL Persistence
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                Zero Paid AI APIs
              </span>
            </div>
          </div>

          {/* Workshop Details */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 tracking-wider uppercase">Workshop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Registration Form
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-white transition-colors">
                  Campus Referral Leaderboard
                </Link>
              </li>
              <li>
                <a href="#project-preview" className="hover:text-white transition-colors">
                  Interactive Project Preview
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Admin & Security */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 tracking-wider uppercase">Campaign Admin</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Command Center
                </Link>
              </li>
              <li>
                <Link to="/admin/budget" className="hover:text-white transition-colors">
                  ₹2,000 Budget Planner
                </Link>
              </li>
              <li>
                <Link to="/admin/insights" className="hover:text-white transition-colors">
                  Growth Intelligence Rules
                </Link>
              </li>
              <li>
                <Link to="/admin/strategy" className="hover:text-white transition-colors">
                  7-Day Campaign Strategy & Slides
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LaunchLoop AI — Built for the NxtWave Growth Challenge. All data stored locally in JSON files.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Target: 500 Registrations / 7 Days / ₹2,000 Budget</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
