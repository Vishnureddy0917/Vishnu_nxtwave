import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, CheckCircle, AlertCircle, ArrowRight, Shield, Award, Users } from 'lucide-react';
import { api } from '../../services/api';

const registrationSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name (at least 2 characters)'),
  email: z.string().email('Please enter a valid email address'),
  college: z.string().min(2, 'Please enter your college / university name'),
  graduationYear: z.coerce.number().int().min(2024, 'Invalid year').max(2028, 'Invalid year'),
  degreeBranch: z.string().min(2, 'Please specify your degree & branch'),
  primaryInterest: z.string().min(2, 'Please select your primary interest'),
  phone: z.string().optional(),
  phoneConsent: z.boolean().optional(),
  referralCode: z.string().optional(),
  shareOnLeaderboard: z.boolean().default(true),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  initialReferralCode?: string;
  referrerInfo?: { displayName: string; college: string } | null;
  onSuccess?: (data: any) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  initialReferralCode,
  referrerInfo,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Read UTM params from URL
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmContent = searchParams.get('utm_content');
  const campusIdentifier = searchParams.get('campus');
  const ambassadorIdentifier = searchParams.get('ambassador');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      college: '',
      graduationYear: 2025,
      degreeBranch: '',
      primaryInterest: 'Building working AI portfolio projects',
      phone: '',
      phoneConsent: false,
      referralCode: initialReferralCode || searchParams.get('ref') || '',
      shareOnLeaderboard: true,
    },
  });

  const phoneValue = watch('phone');

  useEffect(() => {
    if (initialReferralCode) {
      setValue('referralCode', initialReferralCode);
    }
  }, [initialReferralCode, setValue]);

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        ...data,
        email: data.email.toLowerCase().trim(),
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        utmContent: utmContent || undefined,
        campusIdentifier: campusIdentifier || undefined,
        ambassadorIdentifier: ambassadorIdentifier || undefined,
      };

      const res = await api.register(payload);
      if (res.success && res.data) {
        if (onSuccess) {
          onSuccess(res.data);
        } else {
          // Navigate to success page with student info
          navigate('/registration/success', { state: { student: res.data } });
        }
      }
    } catch (err: any) {
      setServerError(err.message || 'An error occurred while submitting your registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const branches = [
    'B.Tech - Computer Science & Engineering',
    'B.Tech - Artificial Intelligence & Data Science',
    'B.Tech - Information Technology',
    'B.Tech - Electronics & Communication Engineering',
    'B.Tech - Electrical & Electronics Engineering',
    'B.Tech - Mechanical / Civil / Other',
    'B.Sc / BCA / MCA / Other Tech Degree',
  ];

  const interests = [
    'Building working AI portfolio projects',
    'Cracking technical product company placements',
    'Understanding Generative AI application architecture',
    'Full-stack AI integration (Next.js + LLMs)',
    'Practical hands-on AI without paid cloud costs',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
      {/* Referral Invitation Banner if referred */}
      {referrerInfo && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-brand-800 uppercase tracking-wider">
              Priority Peer Invitation Active
            </div>
            <p className="text-xs text-brand-900 mt-0.5">
              You were invited by <strong className="font-semibold text-brand-700">{referrerInfo.displayName}</strong> from{' '}
              {referrerInfo.college}. Your spot includes access to the peer project starter kit!
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Free Online Registration</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          Reserve Your Spot for the 60-Minute AI Workshop
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          No credit card required. Free live workshop organized by NxtWave for final-year engineering students.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            {...register('fullName')}
            type="text"
            placeholder="e.g. Rahul Sharma"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-rose-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            College / Personal Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="e.g. rahul.sharma@gmail.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
          )}
        </div>

        {/* College / University */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            College / Institute Name <span className="text-rose-500">*</span>
          </label>
          <input
            {...register('college')}
            type="text"
            placeholder="e.g. VNR VJIET, Hyderabad"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          {errors.college && (
            <p className="mt-1 text-xs text-rose-500">{errors.college.message}</p>
          )}
        </div>

        {/* Graduation Year & Branch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Graduation Year <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('graduationYear')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="2025">2025 (Final Year)</option>
              <option value="2026">2026 (Third Year)</option>
              <option value="2024">2024 (Recent Graduate)</option>
              <option value="2027">2027</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Degree & Branch <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('degreeBranch')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="">Select your branch</option>
              {branches.map((b, i) => (
                <option key={i} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {errors.degreeBranch && (
              <p className="mt-1 text-xs text-rose-500">{errors.degreeBranch.message}</p>
            )}
          </div>
        </div>

        {/* Primary Interest */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Primary Workshop Interest <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('primaryInterest')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            {interests.map((it, i) => (
              <option key={i} value={it}>
                {it}
              </option>
            ))}
          </select>
        </div>

        {/* Optional WhatsApp Number with Consent */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-0.5">
              WhatsApp Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Provide for instant workshop join link and 1-click calendar reminder.
            </p>
            <input
              {...register('phone')}
              type="tel"
              placeholder="e.g. 9876543210"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          {phoneValue && (
            <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                {...register('phoneConsent')}
                type="checkbox"
                className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>
                I explicitly consent to receive the workshop calendar invitation and reminders on WhatsApp.
              </span>
            </label>
          )}
        </div>

        {/* Referral Code (prefilled or editable) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-0.5">
            Referral Code <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            {...register('referralCode')}
            type="text"
            placeholder="e.g. LL-AB12CD"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-sm tracking-wider uppercase focus:outline-none focus:border-brand-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            If a friend or campus ambassador gave you a code, enter it here to give them verified credit.
          </p>
        </div>

        {/* Privacy Leaderboard Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              {...register('shareOnLeaderboard')}
              type="checkbox"
              className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>
              Display my rank on the student referral leaderboard (Your email & phone are never shown publicly; only your first name and college).
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>Verifying and Reserving Spot...</span>
            </>
          ) : (
            <>
              <span>Reserve My Free Spot</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-2">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your privacy is protected. Free entry guaranteed by NxtWave challenge rules.</span>
        </div>
      </form>
    </div>
  );
};
