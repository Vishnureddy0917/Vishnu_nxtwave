import React, { useState, useEffect } from 'react';
import {
  Share2,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Power,
  BarChart2,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { useDemoMode } from '../context/DemoModeContext';
import { CampaignLinkItem } from '../types';

export const AdminChannelsPage: React.FC = () => {
  const { isDemoMode } = useDemoMode();

  const [links, setLinks] = useState<CampaignLinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Link Modal State
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formChannel, setFormChannel] = useState('campus_ambassador');
  const [formSource, setFormSource] = useState('campus_ambassador');
  const [formMedium, setFormMedium] = useState('college_rep');
  const [formCampaign, setFormCampaign] = useState('ai_workshop_nov');
  const [formContent, setFormContent] = useState('lead_kit_v1');
  const [formCampus, setFormCampus] = useState('');
  const [formAmbassador, setFormAmbassador] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCampaignLinks(isDemoMode);
      if (res.success && Array.isArray(res.data)) {
        setLinks(res.data);
      }
    } catch (err) {
      console.error('Error fetching campaign links:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [isDemoMode]);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await api.toggleCampaignLink(id, !current);
      if (res.success) {
        fetchLinks();
      }
    } catch (err) {
      console.error('Error toggling link status:', err);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.createCampaignLink({
        name: formName,
        channel: formChannel,
        utmSource: formSource,
        utmMedium: formMedium,
        utmCampaign: formCampaign,
        utmContent: formContent,
        campusIdentifier: formCampus || null,
        ambassadorIdentifier: formAmbassador || null,
      });

      if (res.success) {
        setShowModal(false);
        setFormName('');
        setFormCampus('');
        setFormAmbassador('');
        fetchLinks();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate campaign link');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white tracking-tight">Campaign Link Generator & Channels</h1>
          <p className="text-xs text-slate-400">
            Generate tracked URLs with UTM parameters to measure student acquisition across campus ambassadors,
            WhatsApp groups, and organic social.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-violet-electric hover:from-brand-500 hover:to-violet-glow transition-all shadow-glow-indigo active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Tracked Campaign Link</span>
        </button>
      </div>

      {/* Campaign Links List */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Campaign Links ({links.length})
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400">
            Loading tracked campaign links...
          </div>
        ) : links.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No campaign links created yet. Click "New Tracked Campaign Link" above.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {links.map((link) => (
              <div key={link.id} className="p-5 hover:bg-slate-800/30 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        link.isActive ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                    />
                    <h3 className="text-sm font-bold text-white">{link.name}</h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {link.channel}
                    </span>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-slate-400">
                      Clicks: <strong className="text-white">{link.clicksCount}</strong>
                    </div>
                    <div className="text-slate-400">
                      Registrations: <strong className="text-brand-300">{link.registrationsCount}</strong>
                    </div>
                    <div className="text-slate-400">
                      Conversion:{' '}
                      <strong className="text-emerald-400">
                        {link.conversionRate}%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* URL preview with copy button */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={link.generatedUrl}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] font-mono text-slate-300 focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(link.id, link.generatedUrl)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs flex items-center gap-1 shrink-0"
                    title="Copy Link"
                  >
                    {copiedId === link.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleToggleActive(link.id, link.isActive)}
                    className={`p-2 rounded-lg transition-colors text-xs flex items-center gap-1 shrink-0 ${
                      link.isActive
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/50'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    title="Toggle active status"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{link.isActive ? 'Active' : 'Paused'}</span>
                  </button>
                </div>

                {/* Parameters tags */}
                <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                    utm_source: {link.utmSource}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                    utm_medium: {link.utmMedium}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                    utm_campaign: {link.utmCampaign}
                  </span>
                  {link.campusIdentifier && (
                    <span className="px-1.5 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800/40">
                      campus: {link.campusIdentifier}
                    </span>
                  )}
                  {link.ambassadorIdentifier && (
                    <span className="px-1.5 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/40">
                      ambassador: {link.ambassadorIdentifier}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Link Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-navy-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-brand-400" />
                <span>Create Tracked Campaign Link</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Campaign Link Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VNR VJIET IEEE Student Chapter Blast"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Acquisition Channel</label>
                  <select
                    value={formChannel}
                    onChange={(e) => {
                      setFormChannel(e.target.value);
                      setFormSource(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="campus_ambassador">Campus Ambassador</option>
                    <option value="whatsapp">WhatsApp Community</option>
                    <option value="college_email">College Email / Bulletin</option>
                    <option value="social_organic">Social Organic (LI/IG)</option>
                    <option value="paid_experiment">Paid Experiment</option>
                    <option value="direct">Direct</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">UTM Source</label>
                  <input
                    type="text"
                    required
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">UTM Medium</label>
                  <input
                    type="text"
                    required
                    value={formMedium}
                    onChange={(e) => setFormMedium(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">UTM Campaign</label>
                  <input
                    type="text"
                    required
                    value={formCampaign}
                    onChange={(e) => setFormCampaign(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">UTM Content</label>
                  <input
                    type="text"
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Campus ID <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VNR_VJIET"
                    value={formCampus}
                    onChange={(e) => setFormCampus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ambassador ID <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AMB_RAHUL"
                    value={formAmbassador}
                    onChange={(e) => setFormAmbassador(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-glow-indigo active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Generating...' : 'Save & Generate Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
