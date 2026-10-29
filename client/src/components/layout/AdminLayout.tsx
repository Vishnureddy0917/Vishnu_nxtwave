import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Share2,
  GitFork,
  IndianRupee,
  Lightbulb,
  Target,
  Sparkles,
  ExternalLink,
  LogOut,
  Database,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDemoMode } from '../../context/DemoModeContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Command Center', icon: LayoutDashboard, end: true },
    { to: '/admin/registrations', label: 'Registrations', icon: Users },
    { to: '/admin/channels', label: 'Acquisition Channels', icon: Share2 },
    { to: '/admin/referrals', label: 'Referral Engine', icon: GitFork },
    { to: '/admin/budget', label: '₹2,000 Budget Planner', icon: IndianRupee },
    { to: '/admin/insights', label: 'Growth Intelligence', icon: Lightbulb },
    { to: '/admin/strategy', label: '7-Day Strategy & Slides', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-navy-900 border-r border-slate-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-violet-electric flex items-center justify-center text-white shadow-glow-indigo">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight">LaunchLoop</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Campaign Operations Center</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Campaign Analytics
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Database Status Footer in Sidebar */}
        <div className="p-4 border-t border-slate-800/80 bg-navy-950/40 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-highlight" />
              <span>Storage:</span>
            </span>
            <span className="text-slate-300 font-mono text-[11px]">Local JSON NoSQL</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Operating Mode:</span>
            <button
              onClick={toggleDemoMode}
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase transition-colors ${
                isDemoMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isDemoMode ? 'Demo Data' : 'Live Mode'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-navy-900/90 backdrop-blur border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Demo Mode Pill */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                isDemoMode
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-sm'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-sm'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isDemoMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              <span>{isDemoMode ? 'DEMO DATA ACTIVE (285 Synthetic Records)' : 'LIVE DATABASE (Clean Production Data)'}</span>
              <button
                onClick={toggleDemoMode}
                className="ml-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                title="Click to toggle between Demo and Live Clean data"
              >
                Switch
              </button>
            </div>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 transition-colors border border-slate-700"
            >
              <span>View Workshop</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center font-bold text-white text-[11px]">
                A
              </span>
              <span className="hidden sm:inline font-mono">{user?.email || 'admin@launchloop.ai'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-navy-950 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
