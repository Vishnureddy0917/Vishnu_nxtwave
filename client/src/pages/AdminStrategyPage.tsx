import React, { useState, useEffect } from 'react';
import {
  Target,
  Calendar,
  AlertTriangle,
  Presentation,
  CheckCircle2,
  TrendingUp,
  Layers,
  ChevronRight,
  Shield,
  RefreshCw,
  Download,
} from 'lucide-react';
import { api } from '../services/api';
import { useDemoMode } from '../context/DemoModeContext';
import { DailyPlanItem, PresentationSlide } from '../types';

export const AdminStrategyPage: React.FC = () => {
  const { isDemoMode } = useDemoMode();

  const [activeTab, setActiveTab] = useState<'planner' | 'slides'>('planner');
  const [dailyPlans, setDailyPlans] = useState<DailyPlanItem[]>([]);
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [channelTargets, setChannelTargets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [stratRes, slidesRes] = await Promise.all([
        api.getStrategy(isDemoMode),
        api.getPresentationSlides(),
      ]);

      if (stratRes.success && stratRes.data) {
        setDailyPlans(stratRes.data.dailyPlans || []);
        setChannelTargets(stratRes.data.channelTargets || []);
      }
      if (slidesRes.success && Array.isArray(slidesRes.data)) {
        setSlides(slidesRes.data);
      }
    } catch (err) {
      console.error('Error fetching strategy data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isDemoMode]);

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Seven-Day Campaign Strategy &amp; Submission Deck
          </h1>
          <p className="text-xs text-slate-400">
            Path to 500 engineering registrations on ₹2,000 budget with decision rules and 5-slide challenge presentation.
          </p>
        </div>

        {/* Tab Pills & Download PDF */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/NxtWave_LaunchLoop_Growth_Plan_5_Slides.pdf"
            download="NxtWave_LaunchLoop_Growth_Plan_5_Slides.pdf"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md active:scale-95"
            title="Download executive 5-slide PDF presentation"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF (5 Slides)</span>
          </a>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'planner'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>7-Day Pacing Planner</span>
            </button>
            <button
              onClick={() => setActiveTab('slides')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'slides'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>5-Slide Challenge Deck</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'planner' ? (
        <div className="space-y-6">
          {/* Channel Targets Overview Banner */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Channel Acquisition Target Model (500 Total)
              </h3>
              <span className="text-[10px] text-brand-300 font-mono">
                * Referral acquisition is an attribution overlay
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {channelTargets.map((ch, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 truncate" title={ch.channel}>
                    {ch.channel}
                  </div>
                  <div className="text-lg font-bold text-white font-mono">{ch.target}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {ch.percentage}% of cohort
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Rule Alert Box */}
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-white">Campaign Strategic Decision Rule:</div>
              <p className="text-amber-200/90 leading-relaxed">
                If actual registrations drop below <strong>70% of the cumulative target</strong> on any day,
                automatically shift effort toward the two highest-converting channels and recruit 5 additional campus
                ambassadors before increasing promotional spending.
              </p>
            </div>
          </div>

          {/* 7-Day Timeline Cards */}
          <div className="space-y-4">
            {dailyPlans.map((plan) => (
              <div
                key={plan.day}
                className={`p-5 rounded-2xl border transition-all ${
                  plan.isPacingAlert
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                    : 'bg-navy-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-600/30 border border-brand-500/40 text-brand-300 font-bold font-mono text-sm flex items-center justify-center shrink-0">
                      D{plan.day}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{plan.objective}</h4>
                      <span className="text-[11px] text-brand-300 font-medium">
                        Primary Channel: {plan.primaryChannel}
                      </span>
                    </div>
                  </div>

                  {/* Daily & Cumulative Targets */}
                  <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                    <div className="text-slate-400">
                      Day Target: <strong className="text-white">{plan.target}</strong>
                    </div>
                    <div className="text-slate-400">
                      Cum. Target: <strong className="text-cyan-300">{plan.cumulativeTarget}</strong>
                    </div>
                    {plan.cumulativeActual !== undefined && (
                      <div className="text-slate-400">
                        Actual:{' '}
                        <strong
                          className={
                            plan.isPacingAlert ? 'text-rose-400 font-bold' : 'text-emerald-400'
                          }
                        >
                          {plan.cumulativeActual}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Activities List */}
                  <div className="lg:col-span-7 space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Planned Tactical Activities:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {plan.activities.map((act, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Corrective Action if behind */}
                  <div className="lg:col-span-5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                      Operational Action:
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {plan.correctiveAction}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* 5-Slide Presentation Deck Viewer */
        <div className="space-y-6">
          {/* Slide Navigator Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlideIdx(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeSlideIdx === idx
                    ? 'bg-brand-600 text-white border-brand-500 shadow-glow-indigo'
                    : 'bg-navy-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Slide {s.slideNumber}: {s.title.split(',')[0]}
              </button>
            ))}
          </div>

          {/* Active Slide Card */}
          {slides[activeSlideIdx] && (
            <div className="bg-navy-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
              {/* Slide Header */}
              <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
                    Slide {slides[activeSlideIdx].slideNumber} of 5 • Executive Submission
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                    {slides[activeSlideIdx].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    {slides[activeSlideIdx].subtitle}
                  </p>
                </div>
              </div>

              {/* Slide Content Dynamic Renderer */}
              <div className="space-y-5 text-sm text-slate-200">
                {/* Slide 1 Renderer */}
                {activeSlideIdx === 0 && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="font-bold text-white text-xs uppercase tracking-wider">
                        Target Audience
                      </div>
                      <p className="text-slate-300 text-xs">
                        {slides[0].content.targetAudience}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="font-bold text-white text-xs uppercase tracking-wider">
                        Core Student Pain Points
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {slides[0].content.corePainPoints.map((pt: string, i: number) => (
                          <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                            {pt}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-brand-950/50 border border-brand-500/40 text-brand-200 text-xs">
                      <strong className="text-white block mb-0.5">Value Proposition:</strong>
                      {slides[0].content.valueProposition}
                    </div>
                  </div>
                )}

                {/* Slide 2 Renderer */}
                {activeSlideIdx === 1 && (
                  <div className="space-y-4">
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Priority Channel</th>
                            <th className="p-3">Registrations</th>
                            <th className="p-3">Share</th>
                            <th className="p-3">Cost Allocation</th>
                            <th className="p-3">Tactical Acquisition Play</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {slides[1].content.channelModel.map((ch: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-800/40">
                              <td className="p-3 font-semibold text-white">{ch.channel}</td>
                              <td className="p-3 font-mono text-cyan-300">{ch.registrations}</td>
                              <td className="p-3 font-mono">{ch.share}</td>
                              <td className="p-3 font-mono text-amber-300">{ch.cost}</td>
                              <td className="p-3 text-slate-400 text-[11px]">{ch.tactic}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-slate-400">Total Goal</div>
                        <div className="text-lg font-bold text-white font-mono">500 Students</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-slate-400">Budget Limit</div>
                        <div className="text-lg font-bold text-emerald-400 font-mono">₹2,000 Total</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-slate-400">Blended CAC</div>
                        <div className="text-lg font-bold text-brand-300 font-mono">₹4.00 / Student</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Slide 3 Renderer */}
                {activeSlideIdx === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {slides[2].content.timeline.map((item: any, i: number) => (
                        <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{item.day}</span>
                            <span className="font-mono text-brand-300 text-[11px]">{item.target}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">{item.focus}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Slide 4 Renderer */}
                {activeSlideIdx === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {slides[3].content.budgetAllocation.map((b: any, i: number) => (
                        <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <div className="text-xs font-semibold text-white">{b.category}</div>
                          <div className="text-lg font-bold text-amber-300 font-mono">{b.planned}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{b.share} of budget</div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
                      <strong>Automated Decision Rule: </strong>
                      {slides[3].content.decisionRule}
                    </div>
                  </div>
                )}

                {/* Slide 5 Renderer */}
                {activeSlideIdx === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="font-bold text-white text-xs uppercase tracking-wider">
                        Working Software Asset Capabilities
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {slides[4].content.workingAssetFeatures.map((f: string, i: number) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                            • {f}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-white text-xs uppercase tracking-wider">
                        Risks &amp; Mitigations
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {slides[4].content.risksAndMitigations.map((rm: any, i: number) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                            <div className="font-bold text-rose-300">Risk: {rm.risk}</div>
                            <div className="text-[11px] text-emerald-300">Fix: {rm.mitigation}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
