export interface StudentRegistration {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  emailMasked?: string;
  college: string;
  graduationYear: number;
  degreeBranch: string;
  primaryInterest: string;
  phone?: string | null;
  phoneConsent?: boolean;
  referralCode: string;
  referredByCode?: string | null;
  referredByRegistrationId?: string | null;
  originalSource: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  campusIdentifier?: string | null;
  ambassadorIdentifier?: string | null;
  shareOnLeaderboard: boolean;
  displayName: string;
  status: 'verified' | 'pending' | 'cancelled';
  isDemo?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  college: string;
  verifiedReferrals: number;
  badge?: string;
}

export interface DashboardKpis {
  totalRegistrations: number;
  targetRegistrations: number;
  progressPercent: number;
  remainingToTarget: number;
  registrationsToday: number;
  referralDrivenCount: number;
  referralParticipationRate: number;
  remainingBudget: number;
  totalBudgetLimit: number;
  totalActualSpend: number;
  costPerRegistration: number | null;
}

export interface DailyTrendItem {
  day: string;
  registrations: number;
  cumulative: number;
  plannedTarget: number;
}

export interface ChannelBreakdownItem {
  channel: string;
  label: string;
  registrations: number;
  percentage: number;
}

export interface ConversionRateItem {
  channel: string;
  visits: number;
  registrations: number;
  conversionRate: number;
}

export interface BudgetCategoryItem {
  id: string;
  category: string;
  categoryLabel: string;
  plannedAmount: number;
  actualSpend: number;
  remainingAmount: number;
  attributedRegistrations?: number;
  costPerRegistration?: number | null;
  expenseLogs?: Array<{
    id: string;
    date: string;
    amount: number;
    description: string;
    loggedBy: string;
  }>;
  notes?: string;
}

export interface CampaignLinkItem {
  id: string;
  name: string;
  channel: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  campusIdentifier?: string | null;
  ambassadorIdentifier?: string | null;
  generatedUrl: string;
  clicksCount: number;
  registrationsCount: number;
  conversionRate: number;
  isActive: boolean;
  createdAt: string;
}

export interface GrowthRecommendationItem {
  id: string;
  ruleId: string;
  priority: 'high' | 'medium' | 'low' | 'opportunity';
  title: string;
  observation: string;
  supportingMetrics: Array<{
    label: string;
    value: string | number;
    benchmark?: string | number;
  }>;
  recommendedAction: string;
  expectedImpact: string;
  triggerLogic: string;
  thresholds: Record<string, any>;
  explanation: {
    whyTriggered: string;
    mathematicalEvidence: string;
    actionItems: string[];
    riskIfIgnored: string;
    aiArchitectureNote: string;
  };
}

export interface DailyPlanItem {
  day: number;
  target: number;
  cumulativeTarget: number;
  objective: string;
  primaryChannel: string;
  activities: string[];
  actualRegistrations?: number;
  cumulativeActual?: number;
  gap?: number;
  pacingRatio?: number;
  isPacingAlert?: boolean;
  correctiveAction?: string;
}

export interface PresentationSlide {
  slideNumber: number;
  title: string;
  subtitle: string;
  content: any;
}
