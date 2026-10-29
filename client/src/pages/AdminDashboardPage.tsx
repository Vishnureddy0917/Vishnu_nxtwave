import React, { useState, useEffect } from 'react';
import {
  Users,
  Target,
  Clock,
  GitFork,
  IndianRupee,
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import { useDemoMode } from '../context/DemoModeContext';
import { DashboardKpis, DailyTrendItem, ChannelBreakdownItem, ConversionRateItem } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { isDemoMode } = useDemoMode();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    kpis: DashboardKpis;
    dailyTrend: DailyTrendItem[];
    channelBreakdown: ChannelBreakdownItem[];
    conversionRates: ConversionRateItem[];
    budgetChart: any[];
    collegeDistribution: any[];
  } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDashboardData(isDemoMode);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isDemoMode]);

  const COLORS = ['#6366F1', '#10B981', '#06B6D4', '#EC4899', '#F59E0B', '#8B5CF6', '#64748B'];

  if (isLoading && !data) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-400">
        Loading Command Center telemetry...
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Top Banner / Goal Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Campaign Command Center
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold font-mono">
              7-Day Sprint
            </span>
          </div>
          <p className="text-xs text-slate-400">
            NxtWave Workshop: “Build Your First AI Project in 60 Minutes” • Target: 500 Registrations • Budget: ₹2,000
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-xs text-slate-300 font-medium transition-colors border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Valid Registrations */}
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Valid Registrations</span>
            <Users className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {kpis?.totalRegistrations || 0}
          </div>
          <div className="text-[11px] text-brand-400 font-medium flex items-center gap-1">
            <span>Target: {kpis?.targetRegistrations || 500}</span>
            <span>({kpis?.progressPercent || 0}%)</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-cyan-highlight rounded-full transition-all"
              style={{ width: `${Math.min(100, kpis?.progressPercent || 0)}%` }}
            />
          </div>
        </div>

        {/* Registrations Remaining */}
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Deficit to 500 Goal</span>
            <Target className="w-4 h-4 text-cyan-highlight" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono">
            {kpis?.remainingToTarget || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            {kpis?.remainingToTarget === 0 ? 'Goal achieved!' : 'Registrations needed'}
          </div>
        </div>

        {/* Referral-Driven Registrations */}
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Referral Attributed</span>
            <GitFork className="w-4 h-4 text-violet-glow" />
          </div>
          <div className="text-2xl font-extrabold text-violet-300 font-mono">
            {kpis?.referralDrivenCount || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Participation: {kpis?.referralParticipationRate || 0}%
          </div>
        </div>

        {/* Budget Remaining */}
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Remaining Budget</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-300 font-mono">
            ₹{kpis?.remainingBudget || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Spent: ₹{kpis?.totalActualSpend || 0} / ₹{kpis?.totalBudgetLimit || 2000}
          </div>
        </div>

        {/* CAC (Cost Per Registration) */}
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Blended CAC</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono">
            {kpis?.costPerRegistration ? `₹${kpis.costPerRegistration}` : '₹0.00'}
          </div>
          <div className="text-[11px] text-slate-400">Cap: ₹4.00 per reg max</div>
        </div>

        {/* Registrations Today */}
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Logged Today</span>
            <Clock className="w-4 h-4 text-cyan-accent" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {kpis?.registrationsToday || 0}
          </div>
          <div className="text-[11px] text-slate-400">Past 24 hours activity</div>
        </div>

        {/* Viral Coefficient K */}
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Viral Factor (K)</span>
            <Sparkles className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-extrabold text-brand-300 font-mono">
            {kpis?.totalRegistrations
              ? (Number(kpis.referralDrivenCount) / Number(kpis.totalRegistrations)).toFixed(2)
              : '0.00'}
          </div>
          <div className="text-[11px] text-slate-400">Benchmark: &gt;= 0.35</div>
        </div>

        {/* Budget Burn Efficiency */}
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Budget Burn</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {kpis?.totalActualSpend
              ? ((kpis.totalActualSpend / (kpis.totalBudgetLimit || 2000)) * 100).toFixed(0)
              : 0}%
          </div>
          <div className="text-[11px] text-emerald-400">Well under ₹2,000 cap</div>
        </div>
      </div>

      {/* Row 2: Charts — Daily Trend & Cumulative Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Progress vs Target Trajectory */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Cumulative Acquisition vs 7-Day Plan</h3>
              <p className="text-[11px] text-slate-400">Tracking daily actuals against 500-registration roadmap</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyTrend || []}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Actual Registrations"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#actualGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="plannedTarget"
                  name="Planned 500 Target"
                  stroke="#06B6D4"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Registrations */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Acquisition Volume</h3>
              <p className="text-[11px] text-slate-400">Registrations logged each day of the campaign</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.dailyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', fontSize: '12px' }}
                />
                <Bar dataKey="registrations" name="New Registrations" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Acquisition Channels & Channel Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Breakdown */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Acquisition Channel Breakdown</h3>
            <p className="text-[11px] text-slate-400">
              Registrations attributed by original acquisition source
            </p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.channelBreakdown || []}
                  dataKey="registrations"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {(data?.channelBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Conversion Rate */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Channel Conversion Performance</h3>
            <p className="text-[11px] text-slate-400">
              Conversion rate (%) calculated from verified tracked visits
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.conversionRates || []}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" stroke="#64748B" fontSize={11} unit="%" />
                <YAxis dataKey="channel" type="category" stroke="#64748B" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', fontSize: '12px' }}
                />
                <Bar dataKey="conversionRate" name="Conversion Rate (%)" fill="#06B6D4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Top Colleges Distribution */}
      <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white">Top Participating Engineering Colleges</h3>
        <p className="text-[11px] text-slate-400">
          Institutions with highest registration density (identifies candidate campus ambassador hubs)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {(data?.collegeDistribution || []).map((col, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-mono">Rank #{idx + 1}</div>
              <div className="text-xs font-semibold text-slate-200 truncate" title={col.college}>
                {col.college}
              </div>
              <div className="text-lg font-bold text-brand-400 font-mono">
                {col.registrations} <span className="text-[11px] font-normal text-slate-400">students</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
