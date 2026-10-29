import { z } from 'zod';

export const AcquisitionChannelEnum = z.enum([
  'campus_ambassador',
  'whatsapp',
  'college_email',
  'social_organic',
  'paid_experiment',
  'referral',
  'direct'
]);

export type AcquisitionChannel = z.infer<typeof AcquisitionChannelEnum>;

export const BudgetCategoryEnum = z.enum([
  'campus_ambassador',
  'student_creative',
  'paid_experiment',
  'contingency'
]);

export type BudgetCategory = z.infer<typeof BudgetCategoryEnum>;

// 1. Registration Schema
export const RegistrationSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').transform(val => val.toLowerCase().trim()),
  college: z.string().min(2, 'College name is required'),
  graduationYear: z.number().int().min(2024).max(2028),
  degreeBranch: z.string().min(2, 'Degree/branch is required'),
  primaryInterest: z.string().min(2, 'Primary interest is required'),
  phone: z.string().optional().nullable(),
  phoneConsent: z.boolean().default(false),
  referralCode: z.string().min(4),
  referredByCode: z.string().optional().nullable(),
  referredByRegistrationId: z.string().optional().nullable(),
  originalSource: AcquisitionChannelEnum.default('direct'),
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  utmContent: z.string().optional().nullable(),
  campusIdentifier: z.string().optional().nullable(),
  ambassadorIdentifier: z.string().optional().nullable(),
  shareOnLeaderboard: z.boolean().default(true),
  displayName: z.string(),
  status: z.enum(['verified', 'pending', 'cancelled']).default('verified'),
  isDemo: z.boolean().default(false),
});

export type Registration = z.infer<typeof RegistrationSchema>;

// Public Registration Input Schema
export const CreateRegistrationInputSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  college: z.string().min(2, 'Please enter your college or university name'),
  graduationYear: z.coerce.number().int().min(2024, 'Invalid graduation year').max(2028, 'Invalid graduation year'),
  degreeBranch: z.string().min(2, 'Please specify your degree & branch'),
  primaryInterest: z.string().min(2, 'Please select your primary interest'),
  phone: z.string().optional().nullable(),
  phoneConsent: z.boolean().optional().default(false),
  referralCode: z.string().optional().nullable(), // The referrer's code if referred
  shareOnLeaderboard: z.boolean().optional().default(true),
  // UTM and campaign attribution
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  utmContent: z.string().optional().nullable(),
  campusIdentifier: z.string().optional().nullable(),
  ambassadorIdentifier: z.string().optional().nullable(),
});

export type CreateRegistrationInput = z.infer<typeof CreateRegistrationInputSchema>;

// 2. Referral Event Schema
export const ReferralEventSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  referrerRegistrationId: z.string(),
  referrerCode: z.string(),
  referredRegistrationId: z.string(),
  referredEmailMasked: z.string(),
  status: z.enum(['verified', 'rejected']).default('verified'),
  rejectReason: z.string().optional().nullable(),
  isDemo: z.boolean().default(false),
});

export type ReferralEvent = z.infer<typeof ReferralEventSchema>;

// 3. Campaign Schema
export const CampaignSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string(),
  targetRegistrations: z.number().default(500),
  budgetLimit: z.number().default(2000),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['active', 'completed', 'paused']).default('active'),
  isDemo: z.boolean().default(false),
});

export type Campaign = z.infer<typeof CampaignSchema>;

// 4. Campaign Link Schema
export const CampaignLinkSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string(),
  channel: AcquisitionChannelEnum,
  utmSource: z.string(),
  utmMedium: z.string(),
  utmCampaign: z.string(),
  utmContent: z.string().default('default'),
  campusIdentifier: z.string().optional().nullable(),
  ambassadorIdentifier: z.string().optional().nullable(),
  generatedUrl: z.string(),
  clicksCount: z.number().default(0),
  registrationsCount: z.number().default(0),
  isActive: z.boolean().default(true),
  isDemo: z.boolean().default(false),
});

export type CampaignLink = z.infer<typeof CampaignLinkSchema>;

// 5. Budget Entry Schema
export const ExpenseLogSchema = z.object({
  id: z.string(),
  date: z.string(),
  amount: z.number().positive(),
  description: z.string(),
  loggedBy: z.string().default('admin'),
});

export const BudgetEntrySchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  category: BudgetCategoryEnum,
  categoryLabel: z.string(),
  plannedAmount: z.number(),
  actualSpend: z.number().default(0),
  expenseLogs: z.array(ExpenseLogSchema).default([]),
  notes: z.string().optional().nullable(),
  isDemo: z.boolean().default(false),
});

export type BudgetEntry = z.infer<typeof BudgetEntrySchema>;
export type ExpenseLog = z.infer<typeof ExpenseLogSchema>;

// 6. Campaign Event Schema (Visits, Clicks)
export const CampaignEventSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  eventType: z.enum(['page_visit', 'referral_visit', 'link_click', 'form_start', 'form_submit']),
  path: z.string(),
  referralCode: z.string().optional().nullable(),
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  utmContent: z.string().optional().nullable(),
  campusIdentifier: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  ipHash: z.string().optional().nullable(),
  isDemo: z.boolean().default(false),
});

export type CampaignEvent = z.infer<typeof CampaignEventSchema>;

// 7. Admin User Schema
export const AdminUserSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  email: z.string().email().transform(v => v.toLowerCase().trim()),
  passwordHash: z.string(),
  fullName: z.string(),
  role: z.enum(['admin', 'viewer']).default('admin'),
  lastLoginAt: z.string().optional().nullable(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

// 8. Campaign Settings & 7-Day Strategy Schema
export const DailyTargetPlanSchema = z.object({
  day: z.number().min(1).max(7),
  target: z.number(),
  cumulativeTarget: z.number(),
  objective: z.string(),
  primaryChannel: z.string(),
  activities: z.array(z.string()),
});

export type DailyTargetPlan = z.infer<typeof DailyTargetPlanSchema>;

export const CampaignSettingsSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  campaignTitle: z.string().default('Build Your First AI Project in 60 Minutes'),
  organizer: z.string().default('NxtWave'),
  workshopDuration: z.string().default('60 Minutes'),
  price: z.string().default('Free'),
  totalBudgetLimit: z.number().default(2000),
  targetRegistrations: z.number().default(500),
  publicBaseUrl: z.string().default('http://localhost:5173'),
  dailyPlans: z.array(DailyTargetPlanSchema),
  isDemoModeActive: z.boolean().default(false),
});

export type CampaignSettings = z.infer<typeof CampaignSettingsSchema>;
