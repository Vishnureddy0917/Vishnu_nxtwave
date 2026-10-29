import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const ReferralRedirectPage: React.FC = () => {
  const { referralCode } = useParams<{ referralCode: string }>();
  const navigate = useNavigate();
  const [statusText, setStatusText] = useState('Attributing peer referral code...');

  useEffect(() => {
    async function processReferral() {
      if (!referralCode) {
        navigate('/');
        return;
      }

      const cleanCode = referralCode.trim().toUpperCase();
      localStorage.setItem('launchloop_referred_by', cleanCode);

      try {
        // Track referral visit telemetry
        api.trackEvent({
          eventType: 'referral_visit',
          path: `/r/${cleanCode}`,
          referralCode: cleanCode,
          utmSource: 'referral',
          utmMedium: 'peer_link',
        }).catch(() => {});

        // Lookup referrer info
        const res = await api.lookupReferralCode(cleanCode);
        if (res.success && res.data) {
          setStatusText(`Referred by ${res.data.referrerDisplayName}! Preparing your priority pass...`);
          setTimeout(() => {
            navigate(`/register?ref=${cleanCode}`);
          }, 600);
        } else {
          navigate(`/register?ref=${cleanCode}`);
        }
      } catch (err) {
        // If code lookup fails, continue to registration anyway
        navigate(`/register?ref=${cleanCode}`);
      }
    }

    processReferral();
  }, [referralCode, navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center animate-bounce">
        <Sparkles className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-800">Connecting Campus Referral</h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">{statusText}</p>
      </div>
    </div>
  );
};
