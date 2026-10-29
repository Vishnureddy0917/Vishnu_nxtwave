import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RegistrationForm } from '../components/registration/RegistrationForm';
import { api } from '../services/api';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const refCodeFromQuery = searchParams.get('ref') || localStorage.getItem('launchloop_referred_by');
  const [referrerInfo, setReferrerInfo] = useState<{ displayName: string; college: string } | null>(null);

  useEffect(() => {
    async function checkReferrer() {
      if (refCodeFromQuery) {
        try {
          const res = await api.lookupReferralCode(refCodeFromQuery);
          if (res.success && res.data) {
            setReferrerInfo({
              displayName: res.data.referrerDisplayName,
              college: res.data.referrerCollege,
            });
          }
        } catch (e) {
          // invalid or expired code, continue normally
        }
      }
    }
    checkReferrer();
  }, [refCodeFromQuery]);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <RegistrationForm
        initialReferralCode={refCodeFromQuery || undefined}
        referrerInfo={referrerInfo}
      />
    </div>
  );
};
