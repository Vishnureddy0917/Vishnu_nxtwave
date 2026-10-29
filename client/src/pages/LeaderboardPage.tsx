import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Medal, ShieldCheck, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { LeaderboardEntry } from '../types';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getLeaderboard(25);
      if (res.success && Array.isArray(res.data)) {
        setLeaderboard(res.data);
      }
    } catch (err: any) {
      setError('Unable to load leaderboard. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Verified Student Referrals</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Campus AI Movement Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Recognizing engineering student leaders driving peer AI literacy. Every verified peer registration
          strengthens your campus rank!
        </p>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Table Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Top Student Ambassadors
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold font-mono">
              Top 25
            </span>
          </div>
          <button
            onClick={fetchLeaderboard}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">
            Loading verified campus rankings...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-500">{error}</div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No student referrals recorded yet</p>
            <p className="text-xs text-slate-400">
              Be the first to register and share your link with your campus peers!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Rank</th>
                  <th className="px-6 py-3 font-semibold">Student</th>
                  <th className="px-6 py-3 font-semibold">College / University</th>
                  <th className="px-6 py-3 font-semibold text-right">Verified Referrals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((entry) => {
                  let rankBadge = null;
                  if (entry.rank === 1) {
                    rankBadge = (
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                        🥇
                      </span>
                    );
                  } else if (entry.rank === 2) {
                    rankBadge = (
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                        🥈
                      </span>
                    );
                  } else if (entry.rank === 3) {
                    rankBadge = (
                      <span className="w-6 h-6 rounded-full bg-amber-200/60 text-amber-900 flex items-center justify-center font-bold text-xs">
                        🥉
                      </span>
                    );
                  } else {
                    rankBadge = (
                      <span className="w-6 text-center text-xs font-mono text-slate-500 font-bold">
                        #{entry.rank}
                      </span>
                    );
                  }

                  return (
                    <tr key={entry.rank} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-2">{rankBadge}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-sm">
                          {entry.displayName}
                        </div>
                        {entry.badge && (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/60">
                            {entry.badge}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                        {entry.college}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-bold text-base text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200/60">
                          {entry.verifiedReferrals}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Privacy Note Footer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacy Notice: Personal emails and phones are never displayed on public leaderboards.</span>
          </div>
          <span className="hidden sm:inline">Opt-out available during registration.</span>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-brand-600 to-violet-electric rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-bold">Want to get your name on the leaderboard?</h3>
          <p className="text-xs text-brand-100 max-w-md">
            Reserve your free workshop spot, receive your unique collision-resistant link, and invite your lab peers!
          </p>
        </div>
        <Link
          to="/register"
          className="px-6 py-3 rounded-xl font-bold text-xs bg-white text-brand-700 hover:bg-slate-100 transition-all shadow-md shrink-0 active:scale-95 flex items-center gap-1.5"
        >
          <span>Register Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
