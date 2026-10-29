import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Award,
  Sparkles,
  TrendingUp,
  Users,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Gift,
} from 'lucide-react';
import { api } from '../services/api';
import { useDemoMode } from '../context/DemoModeContext';

export const AdminReferralsPage: React.FC = () => {
  const { isDemoMode } = useDemoMode();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    summary: {
      totalVerifiedReferrals: number;
      viralCoefficient: number;
      activeReferrersCount: number;
      referralParticipationRate: number;
      trackedReferralVisits: number;
      referralVisitConversionRate: number;
    };
    topReferrers: Array<{
      id: string;
      fullName: string;
      displayName: string;
      college: string;
      referralCode: string;
      verifiedCount: number;
      emailMasked: string;
      channel: string;
    }>;
  } | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReferralsAnalytics(isDemoMode);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching referral analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [isDemoMode]);

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white tracking-tight">Referral Engine Telemetry</h1>
          <p className="text-xs text-slate-400">
            Monitor viral coefficient (K), student ambassador velocity, and referral cascade attribution.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Viral Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Referrals</span>
            <GitFork className="w-4 h-4 text-violet-glow" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {summary?.totalVerifiedReferrals || 0}
          </div>
          <div className="text-[11px] text-violet-300">Total verified peer joins</div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Viral Factor (K)</span>
            <TrendingUp className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-extrabold text-brand-300 font-mono">
            {summary?.viralCoefficient || 0}
          </div>
          <div className="text-[11px] text-slate-400">Target baseline: &gt;= 0.35</div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Referrers</span>
            <Users className="w-4 h-4 text-cyan-highlight" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono">
            {summary?.activeReferrersCount || 0}
          </div>
          <div className="text-[11px] text-slate-400">Students with &gt;= 1 referral</div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Visit Conversion</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-300 font-mono">
            {summary?.referralVisitConversionRate || 0}%
          </div>
          <div className="text-[11px] text-slate-400">Of peer link clicks converted</div>
        </div>
      </div>

      {/* Top Student Referrers Table */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Top Student Ambassadors (Ranked by Verified Peers)
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400">
            Calculating referral trees...
          </div>
        ) : (data?.topReferrers || []).length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No student referrals recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Rank</th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">College</th>
                  <th className="px-4 py-3 font-semibold">Referral Code</th>
                  <th className="px-4 py-3 font-semibold">Masked Email</th>
                  <th className="px-4 py-3 font-semibold text-right">Verified Registrations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {(data?.topReferrers || []).map((ref, idx) => (
                  <tr key={ref.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-brand-300">#{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-white">{ref.fullName}</td>
                    <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{ref.college}</td>
                    <td className="px-4 py-3 font-mono text-slate-300 font-semibold">{ref.referralCode}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{ref.emailMasked}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-lg">
                        {ref.verifiedCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Proposed Incentive / Reward Rules Note */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-400">
          <Gift className="w-4 h-4" />
          <span>Configurable Reward Structure (Proposed Incentives)</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          In strict compliance with challenge guidelines, rewards are non-cash recognition assets designed to motivate
          campus-wide peer sharing without depleting the ₹2,000 budget:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
            <div className="font-bold text-white">Tier 1 (2 Referrals)</div>
            <p className="text-[11px] text-slate-400">
              Unlocks "AI Project Starter Kit" (Architecture diagrams, boilerplate repo, prompt templates).
            </p>
            <span className="inline-block text-[10px] text-brand-300 font-mono">Proposed Incentive</span>
          </div>

          <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
            <div className="font-bold text-white">Tier 2 (5 Referrals)</div>
            <p className="text-[11px] text-slate-400">
              Priority live Q&amp;A pass + "AI Vanguard" badge on the public campus leaderboard.
            </p>
            <span className="inline-block text-[10px] text-brand-300 font-mono">Proposed Incentive</span>
          </div>

          <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
            <div className="font-bold text-white">Tier 3 (10+ Referrals)</div>
            <p className="text-[11px] text-slate-400">
              Campus Lead Ambassador Certificate + LinkedIn spotlight recommendation.
            </p>
            <span className="inline-block text-[10px] text-brand-300 font-mono">Proposed Incentive</span>
          </div>
        </div>
      </div>
    </div>
  );
};
