import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Receipt,
  FileSpreadsheet,
  Edit2,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { useDemoMode } from '../context/DemoModeContext';
import { BudgetCategoryItem } from '../types';

export const AdminBudgetPage: React.FC = () => {
  const { isDemoMode } = useDemoMode();

  const [isLoading, setIsLoading] = useState(true);
  const [budgetData, setBudgetData] = useState<{
    summary: {
      totalBudgetCap: number;
      totalPlanned: number;
      totalActualSpend: number;
      totalRemaining: number;
      overallCAC: number | null;
      isCapExceeded: boolean;
    };
    categories: BudgetCategoryItem[];
  } | null>(null);

  // Record Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [expenseWarning, setExpenseWarning] = useState<string | null>(null);

  // Edit Allocations Modal State
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [allocValues, setAllocValues] = useState<Record<string, number>>({});
  const [allocWarning, setAllocWarning] = useState<string | null>(null);

  const fetchBudget = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBudget(isDemoMode);
      if (res.success && res.data) {
        setBudgetData(res.data);
        if (res.data.categories.length > 0) {
          setSelectedCategory(res.data.categories[0].id);
          const initialAlloc: Record<string, number> = {};
          for (const c of res.data.categories) {
            initialAlloc[c.id] = c.plannedAmount;
          }
          setAllocValues(initialAlloc);
        }
      }
    } catch (err) {
      console.error('Error fetching budget:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [isDemoMode]);

  const handleRecordExpense = async (confirmExceed: boolean = false) => {
    setIsSubmittingExpense(true);
    setExpenseWarning(null);

    try {
      const res = await api.recordExpense({
        categoryId: selectedCategory,
        amount: Number(expenseAmount),
        description: expenseDesc,
        date: expenseDate,
        confirmedExceed: confirmExceed,
      });

      if (res.success) {
        setShowExpenseModal(false);
        setExpenseAmount('');
        setExpenseDesc('');
        setExpenseWarning(null);
        fetchBudget();
      } else if (res.warning) {
        setExpenseWarning(res.message || 'Exceeds budget cap');
      }
    } catch (err: any) {
      if (err.details?.warning) {
        setExpenseWarning(err.details.message);
      } else {
        alert(err.message || 'Failed to record expense');
      }
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const handleSaveAllocations = async (confirmExceed: boolean = false) => {
    setAllocWarning(null);
    const payload = Object.entries(allocValues).map(([id, amount]) => ({
      id,
      plannedAmount: Number(amount),
    }));

    try {
      const res = await api.updateAllocations(payload, confirmExceed);
      if (res.success) {
        setShowAllocModal(false);
        setAllocWarning(null);
        fetchBudget();
      } else if (res.warning) {
        setAllocWarning(res.message || 'Exceeds budget cap');
      }
    } catch (err: any) {
      if (err.details?.warning) {
        setAllocWarning(err.details.message);
      } else {
        alert(err.message || 'Failed to update allocations');
      }
    }
  };

  const summary = budgetData?.summary;
  const categories = budgetData?.categories || [];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">₹2,000 Budget Planner</h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
              Strict ₹2,000 Cap
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Disciplined capital allocation for 500 registrations. Prioritizes organic campus club distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllocModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Allocations</span>
          </button>

          <button
            onClick={() => {
              setExpenseWarning(null);
              setShowExpenseModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </button>

          <a
            href={api.exportBudgetCsvUrl(isDemoMode)}
            download
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            title="Export Budget CSV"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Total Campaign Budget</div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ₹{summary?.totalBudgetCap || 2000}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Hard cap limit</div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Actual Spend to Date</div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono">
            ₹{summary?.totalActualSpend || 0}
          </div>
          <div className="text-[11px] text-amber-400 font-mono">
            {summary?.totalActualSpend
              ? ((summary.totalActualSpend / (summary.totalBudgetCap || 2000)) * 100).toFixed(0)
              : 0}% consumed
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Remaining Budget</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            ₹{summary?.totalRemaining || 0}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">Available headroom</div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Blended CAC</div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono">
            {summary?.overallCAC ? `₹${summary.overallCAC}` : '₹0.00'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Per verified registration</div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Category Allocations &amp; Spend Telemetry
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 font-semibold">Budget Category</th>
                <th className="px-5 py-3 font-semibold text-right">Planned (INR)</th>
                <th className="px-5 py-3 font-semibold text-right">Actual Spend</th>
                <th className="px-5 py-3 font-semibold text-right">Remaining</th>
                <th className="px-5 py-3 font-semibold text-right">Attributed Regs</th>
                <th className="px-5 py-3 font-semibold text-right">CAC (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-white">{cat.categoryLabel}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{cat.notes}</div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-slate-300">
                    ₹{cat.plannedAmount}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-amber-300">
                    ₹{cat.actualSpend}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-400">
                    ₹{cat.remainingAmount}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-brand-300">
                    {cat.attributedRegistrations || 0}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono">
                    {cat.costPerRegistration ? (
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-bold">
                        ₹{cat.costPerRegistration}
                      </span>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Audit Logs */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 overflow-hidden shadow-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Receipt className="w-4 h-4 text-cyan-highlight" />
          <span>Recorded Expense Audit Trail</span>
        </div>

        <div className="space-y-2">
          {categories
            .flatMap((c) => (c.expenseLogs || []).map((l) => ({ ...l, categoryLabel: c.categoryLabel })))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((exp, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{exp.description}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{exp.categoryLabel}</span>
                    <span>•</span>
                    <span className="font-mono">{exp.date}</span>
                    <span>•</span>
                    <span>Logged by: {exp.loggedBy}</span>
                  </div>
                </div>
                <div className="font-mono font-bold text-amber-300 text-sm">
                  ₹{exp.amount}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-navy-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Record Campaign Expense</span>
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {expenseWarning && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-300 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <p>{expenseWarning}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRecordExpense(true)}
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  I Confirm: Allow Exceeding ₹2,000 Cap
                </button>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Budget Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoryLabel} (Rem: ₹{c.remainingAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expense Amount (INR)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 250"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description &amp; Justification</label>
                <input
                  type="text"
                  placeholder="e.g. Printed 50 flyers for college departmental notice boards"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expense Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingExpense || !expenseAmount || !expenseDesc}
                  onClick={() => handleRecordExpense(false)}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingExpense ? 'Saving...' : 'Record Expense'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Allocations Modal */}
      {showAllocModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-navy-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-400" />
                <span>Edit Planned Allocations</span>
              </h3>
              <button
                onClick={() => setShowAllocModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {allocWarning && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-300 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <p>{allocWarning}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveAllocations(true)}
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  I Confirm: Allow Allocation Exceeding ₹2,000 Cap
                </button>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {categories.map((c) => (
                <div key={c.id}>
                  <label className="block text-slate-300 font-semibold mb-1">{c.categoryLabel}</label>
                  <input
                    type="number"
                    min="0"
                    value={allocValues[c.id] ?? c.plannedAmount}
                    onChange={(e) =>
                      setAllocValues((prev) => ({
                        ...prev,
                        [c.id]: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              ))}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
                <span className="text-slate-400">Total Planned:</span>
                <span
                  className={`font-bold ${
                    Object.values(allocValues).reduce((a, b) => a + b, 0) > 2000
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  ₹{Object.values(allocValues).reduce((a, b) => a + b, 0)} / ₹2,000
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAllocModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAllocations(false)}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-glow-indigo active:scale-95"
                >
                  Update Allocations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
