import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Trophy,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';

export const RegistrationSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const student = location.state?.student;

  const [copied, setCopied] = useState(false);
  const [verifiedCount, setVerifiedCount] = useState<number>(student?.verifiedReferralsCount || 0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const referralCode = student?.referralCode || 'LL-NX789';
  const shareableUrl = student?.shareableUrl || `${window.location.origin}/r/${referralCode}`;

  // Refresh status
  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getRegistrationStatus(referralCode);
      if (res.success && res.data) {
        setVerifiedCount(res.data.verifiedReferralsCount);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp share message with properly encoded URL
  const whatsappText = encodeURIComponent(
    `Hey! I just registered for NxtWave's free live workshop: "Build Your First AI Project in 60 Minutes".\n\nIt's practical, beginner-friendly, and designed for engineering students to build an AI mini-project for their resumes.\n\nReserve your free spot with my priority peer link here:\n${shareableUrl}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto space-y-6">
      {/* Confirmation Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Registration Confirmed
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Spot Reserved, {student?.displayName || 'Engineer'}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            You're officially registered for NxtWave's “Build Your First AI Project in 60 Minutes” workshop.
          </p>
        </div>

        {/* Schedule note as required */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-md mx-auto">
          <strong>Event Schedule: </strong> Date and time to be announced. Access instructions and calendar invitations will be delivered prior to the live broadcast.
        </div>
      </div>

      {/* Referral Engine Card: The Core Growth Loop */}
      <div className="bg-gradient-to-br from-brand-950 via-slate-900 to-navy-950 rounded-2xl border border-brand-500/30 shadow-2xl p-6 sm:p-8 text-slate-100 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Referral Movement</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Turn Your Registration Into a Campus Movement
            </h3>
            <p className="text-xs text-slate-400">
              Invite your lab partners and classmates. Track your referrals on the campus leaderboard:
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl font-extrabold text-white font-mono">{verifiedCount}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 justify-end">
              <span>Verified</span>
              <button
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                className="hover:text-brand-300 transition-colors"
                title="Refresh verified count"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Unique Referral Code Box */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Your Unique Referral Code
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-brand-300">
              {referralCode}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              Collision-Resistant
            </span>
          </div>
        </div>

        {/* Shareable Link Box & Copy Button */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Your Shareable Referral Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-300 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 transition-all shrink-0 active:scale-95 shadow-glow-indigo"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons: WhatsApp & Leaderboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via WhatsApp</span>
          </a>

          <Link
            to="/leaderboard"
            className="py-3 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>View Campus Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* Navigation Return */}
      <div className="text-center pt-4">
        <Link
          to="/"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
        >
          <span>← Return to Workshop Homepage</span>
        </Link>
      </div>
    </div>
  );
};
