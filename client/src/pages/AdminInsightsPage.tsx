import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { useDemoMode } from '../context/DemoModeContext';
import { GrowthRecommendationItem } from '../types';

export const AdminInsightsPage: React.FC = () => {
  const { isDemoMode } = useDemoMode();

  const [recommendations, setRecommendations] = useState<GrowthRecommendationItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeExplanation, setActiveExplanation] = useState<GrowthRecommendationItem | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await api.getInsights(isDemoMode);
      if (res.success && Array.isArray(res.data)) {
        setRecommendations(res.data);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [isDemoMode]);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
            High Priority
          </span>
        );
      case 'opportunity':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Growth Opportunity
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Optimization
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Explainable Growth Intelligence</h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
              Rule Engine v1.4
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Deterministic algorithmic campaign recommendations with full mathematical transparency. Zero paid AI APIs.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-evaluate Telemetry</span>
        </button>
      </div>

      {/* Rules Engine Transparency Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
        <Cpu className="w-5 h-5 text-cyan-highlight shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-0.5">
          <div className="font-semibold text-white">How This Recommendation Engine Works:</div>
          <p className="text-slate-400 leading-relaxed">
            This module evaluates real-time registration funnels, viral coefficients (K), and campus density
            against pre-calibrated statistical growth heuristics. Every recommendation is 100% deterministic,
            auditable, and requires zero paid third-party API dependencies.
          </p>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs font-mono text-slate-400">
          Running telemetry rules engine across database collections...
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-12 rounded-2xl bg-navy-900 border border-slate-800 text-center text-xs text-slate-400">
          All channels operating within optimal performance thresholds. No active alerts.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono text-slate-400">{rec.ruleId}</div>
                  {getPriorityBadge(rec.priority)}
                </div>

                <h3 className="text-sm font-bold text-white">{rec.title}</h3>

                {/* Observation */}
                <p className="text-xs text-slate-300 leading-relaxed">{rec.observation}</p>

                {/* Supporting Metrics Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {rec.supportingMetrics.map((m, i) => (
                    <div
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300"
                    >
                      <span className="text-slate-400">{m.label}: </span>
                      <strong className="text-cyan-300">{m.value}</strong>
                    </div>
                  ))}
                </div>

                {/* Recommended Action */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                  <span className="font-semibold text-brand-300 text-[11px] uppercase tracking-wider block">
                    Action Plan:
                  </span>
                  <p className="text-slate-200">{rec.recommendedAction}</p>
                </div>

                {/* Expected Impact */}
                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Expected Impact: {rec.expectedImpact}</span>
                </div>
              </div>

              {/* Bottom Action: Explain This Recommendation */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-xs">
                  Trigger: {rec.triggerLogic}
                </span>
                <button
                  onClick={() => setActiveExplanation(rec)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Explain This</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Explanation Modal / Drawer */}
      {activeExplanation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-navy-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-brand-400 font-semibold uppercase">
                  Explainable Rule Intelligence
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {activeExplanation.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveExplanation(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Why Triggered */}
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                  1. Why Was This Triggered?
                </h4>
                <p className="text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {activeExplanation.explanation.whyTriggered}
                </p>
              </div>

              {/* Mathematical Evidence */}
              <div className="space-y-1">
                <h4 className="font-semibold text-cyan-300 uppercase tracking-wider text-[11px]">
                  2. Mathematical Evidence &amp; Thresholds
                </h4>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-slate-300">
                  {activeExplanation.explanation.mathematicalEvidence}
                </div>
              </div>

              {/* Concrete Action Items */}
              <div className="space-y-1.5">
                <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                  3. Prescribed Tactical Action Items
                </h4>
                <ul className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {activeExplanation.explanation.actionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="text-brand-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk If Ignored */}
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300 space-y-0.5">
                <div className="font-semibold text-[11px] uppercase tracking-wider text-rose-200">
                  Risk If Left Unaddressed:
                </div>
                <p>{activeExplanation.explanation.riskIfIgnored}</p>
              </div>

              {/* AI Architecture Note */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono">
                <strong>Architecture Verification: </strong>
                {activeExplanation.explanation.aiArchitectureNote}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveExplanation(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
