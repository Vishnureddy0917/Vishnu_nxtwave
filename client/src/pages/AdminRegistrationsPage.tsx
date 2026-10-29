import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RefreshCw,
  ExternalLink,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { useDemoMode } from '../context/DemoModeContext';
import { StudentRegistration } from '../types';

export const AdminRegistrationsPage: React.FC = () => {
  const { isDemoMode } = useDemoMode();

  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [isReferralFilter, setIsReferralFilter] = useState('all');
  const [gradYearFilter, setGradYearFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const res = await api.getRegistrations({
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        channel: channelFilter !== 'all' ? channelFilter : undefined,
        isReferral: isReferralFilter === 'referral' ? true : undefined,
        graduationYear: gradYearFilter !== 'all' ? gradYearFilter : undefined,
        isDemo: isDemoMode,
      });

      if (res.success && res.data) {
        setRegistrations(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [pagination.page, channelFilter, isReferralFilter, gradYearFilter, isDemoMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchRegistrations();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this registration record?')) {
      return;
    }
    try {
      const res = await api.deleteRegistration(id);
      if (res.success) {
        fetchRegistrations();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & CSV Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Registration Management</h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono">
              {pagination.total} Records
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Search, filter, inspect attribution, and export protected student data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={api.exportRegistrationsCsvUrl(isDemoMode)}
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-glow-indigo active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Protected CSV</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, college, email, or referral code..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => {
              setChannelFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="campus_ambassador">Campus Ambassador</option>
            <option value="whatsapp">WhatsApp Community</option>
            <option value="college_email">College Email / Bulletin</option>
            <option value="social_organic">Organic Social</option>
            <option value="paid_experiment">Paid Experiment</option>
            <option value="referral">Referral Engine</option>
            <option value="direct">Direct</option>
          </select>

          {/* Referral Type */}
          <select
            value={isReferralFilter}
            onChange={(e) => {
              setIsReferralFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Registrations</option>
            <option value="referral">Referred Only</option>
          </select>

          {/* Graduation Year */}
          <select
            value={gradYearFilter}
            onChange={(e) => {
              setGradYearFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Grad Years</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400">
            Querying local NoSQL registrations...
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No registrations matching query criteria found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Masked Email</th>
                  <th className="px-4 py-3 font-semibold">College & Branch</th>
                  <th className="px-4 py-3 font-semibold">Referral Code</th>
                  <th className="px-4 py-3 font-semibold">Acquisition Source</th>
                  <th className="px-4 py-3 font-semibold">Registered At</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{reg.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {reg.id}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {reg.emailMasked || reg.email}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-slate-200 truncate" title={reg.college}>
                        {reg.college}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {reg.degreeBranch} ({reg.graduationYear})
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-semibold">
                        {reg.referralCode}
                      </span>
                      {reg.referredByCode && (
                        <div className="text-[10px] text-violet-300 mt-1">
                          Via: <span className="font-mono">{reg.referredByCode}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {reg.originalSource}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(reg.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete registration"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Page <span className="text-white font-semibold">{pagination.page}</span> of{' '}
            <span className="text-white font-semibold">{pagination.totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.totalPages, prev.page + 1),
                }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
