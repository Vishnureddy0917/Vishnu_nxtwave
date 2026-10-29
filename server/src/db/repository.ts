import path from 'path';
import { DocumentStore } from './documentStore.js';
import {
  Registration,
  ReferralEvent,
  Campaign,
  CampaignLink,
  BudgetEntry,
  CampaignEvent,
  AdminUser,
  CampaignSettings,
  DailyTargetPlan,
} from './schemas.js';

export const COLLECTIONS = {
  REGISTRATIONS: 'registrations',
  REFERRAL_EVENTS: 'referralEvents',
  CAMPAIGNS: 'campaigns',
  CAMPAIGN_LINKS: 'campaignLinks',
  BUDGET_ENTRIES: 'budgetEntries',
  CAMPAIGN_EVENTS: 'campaignEvents',
  ADMIN_USERS: 'adminUsers',
  CAMPAIGN_SETTINGS: 'campaignSettings',
} as const;

export interface AppDatabase {
  registrations: DocumentStore;
  referralEvents: DocumentStore;
  campaigns: DocumentStore;
  campaignLinks: DocumentStore;
  budgetEntries: DocumentStore;
  campaignEvents: DocumentStore;
  adminUsers: DocumentStore;
  campaignSettings: DocumentStore;
}

// Single instance of DocumentStore managing all collections
const dataDirectory = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : process.env.VERCEL
  ? '/tmp/data'
  : path.resolve(process.cwd(), '../data');

export const store = new DocumentStore({
  dataDir: dataDirectory,
  uniqueIndexes: {
    [COLLECTIONS.REGISTRATIONS]: ['email', 'referralCode'],
    [COLLECTIONS.ADMIN_USERS]: ['email'],
    [COLLECTIONS.CAMPAIGN_LINKS]: ['generatedUrl'],
  },
});

/**
 * Initialize all collections and ensure safe defaults
 */
export async function initializeDatabase(): Promise<void> {
  const collectionNames = Object.values(COLLECTIONS);
  await store.init(collectionNames);

  // Check if campaign settings exist; if not, initialize standard default
  const settings = await store.findOne<CampaignSettings>(COLLECTIONS.CAMPAIGN_SETTINGS, {});
  if (!settings) {
    const defaultDailyPlans: DailyTargetPlan[] = [
      {
        day: 1,
        target: 30,
        cumulativeTarget: 30,
        objective: 'Launch Ambassador program & early WhatsApp outreach',
        primaryChannel: 'Campus Clubs & Ambassadors',
        activities: [
          'Brief 10 core student campus ambassadors with copy kit',
          'Post in 15 targeted final-year WhatsApp class groups',
          'Deploy verified referral link contest announcement'
        ]
      },
      {
        day: 2,
        target: 50,
        cumulativeTarget: 80,
        objective: 'Scale WhatsApp student communities & engineering clubs',
        primaryChannel: 'WhatsApp Student Communities',
        activities: [
          'Distribute "Build in 60 Mins" workshop carousel in departmental groups',
          'Follow up with ACM/IEEE campus chapter student leads',
          'First referral milestone leaderboard update'
        ]
      },
      {
        day: 3,
        target: 65,
        cumulativeTarget: 145,
        objective: 'College email & department newsletter outreach',
        primaryChannel: 'College Email & Newsletters',
        activities: [
          'Coordinate with college placement cell student reps for email blast',
          'Publish student project showcase teaser on LinkedIn',
          'Recognize top 5 referrers on public leaderboard'
        ]
      },
      {
        day: 4,
        target: 75,
        cumulativeTarget: 220,
        objective: 'Mid-campaign momentum & organic social blitz',
        primaryChannel: 'Instagram & LinkedIn Organic',
        activities: [
          'Post student breakdown: "Why 60 mins beats 10-hour tutorials"',
          'Launch mini live AMA on workshop prerequisites (beginner friendly)',
          'Assess pacing: apply growth rule if registrations < 70% of target'
        ]
      },
      {
        day: 5,
        target: 85,
        cumulativeTarget: 305,
        objective: 'High-intent experimentation & secondary college outreach',
        primaryChannel: 'High-Intent Promotional Experiment',
        activities: [
          'Deploy ₹800 high-intent experiment to engineering colleges in Telangana/AP',
          'Target students actively searching for AI capstone project guidance',
          'Activate peer-to-peer referral surge with priority resource incentive'
        ]
      },
      {
        day: 6,
        target: 95,
        cumulativeTarget: 400,
        objective: 'Referral cascade & registration countdown',
        primaryChannel: 'Referral-led Acquisition',
        activities: [
          'Direct nudge to existing registrants: "Invite 2 peers to unlock AI Project starter pack"',
          'Final call on major campus Discord and Telegram hubs',
          'Review channel conversion rates and redistribute outreach'
        ]
      },
      {
        day: 7,
        target: 100,
        cumulativeTarget: 500,
        objective: 'Final 24-hour sprint to hit 500 registrations',
        primaryChannel: 'Omnichannel Final Push',
        activities: [
          'Last-chance reminder across all WhatsApp community channels',
          'Ambassador final push leaderboard sprint with top student badge',
          'Registration closeout and preparation for workshop delivery'
        ]
      }
    ];

    await store.insertOne<CampaignSettings>(
      COLLECTIONS.CAMPAIGN_SETTINGS,
      {
        campaignTitle: 'Build Your First AI Project in 60 Minutes',
        organizer: 'NxtWave',
        workshopDuration: '60 Minutes',
        price: 'Free',
        totalBudgetLimit: 2000,
        targetRegistrations: 500,
        publicBaseUrl: 'http://localhost:5173',
        dailyPlans: defaultDailyPlans,
        isDemoModeActive: false,
      },
      'settings'
    );
  }

  // Check if budget categories exist; if not, initialize default ₹2,000 allocation
  const budgetCount = await store.countDocuments(COLLECTIONS.BUDGET_ENTRIES);
  if (budgetCount === 0) {
    const defaultBudgets: Array<Omit<BudgetEntry, 'id' | 'createdAt' | 'updatedAt'>> = [
      {
        category: 'campus_ambassador',
        categoryLabel: 'Campus Ambassador & Club Outreach Materials',
        plannedAmount: 500,
        actualSpend: 0,
        expenseLogs: [],
        notes: 'Printable club notice posters, digital asset kits, campus lead rewards',
        isDemo: false,
      },
      {
        category: 'student_creative',
        categoryLabel: 'Student-Community Creative Distribution',
        plannedAmount: 300,
        actualSpend: 0,
        expenseLogs: [],
        notes: 'WhatsApp micro-assets, Figma templates, student community graphics',
        isDemo: false,
      },
      {
        category: 'paid_experiment',
        categoryLabel: 'Optional High-Intent Promotional Experiment',
        plannedAmount: 800,
        actualSpend: 0,
        expenseLogs: [],
        notes: 'High-intent search or targeted engineering community experiment',
        isDemo: false,
      },
      {
        category: 'contingency',
        categoryLabel: 'Contingency & Reserve',
        plannedAmount: 400,
        actualSpend: 0,
        expenseLogs: [],
        notes: 'Buffer for mid-campaign optimization or unexpected outreach needs',
        isDemo: false,
      },
    ];

    for (const b of defaultBudgets) {
      await store.insertOne<BudgetEntry>(COLLECTIONS.BUDGET_ENTRIES, b, 'bgt');
    }
  }
}

/**
 * Repositories providing clean abstraction over store
 */
export const RegistrationRepository = {
  create: (data: Omit<Registration, 'id' | 'createdAt' | 'updatedAt'>) =>
    store.insertOne<Registration>(COLLECTIONS.REGISTRATIONS, data, 'reg'),
  findById: (id: string) =>
    store.findOne<Registration>(COLLECTIONS.REGISTRATIONS, { id }),
  findByEmail: (email: string) =>
    store.findOne<Registration>(COLLECTIONS.REGISTRATIONS, { email: email.toLowerCase().trim() }),
  findByReferralCode: (referralCode: string) =>
    store.findOne<Registration>(COLLECTIONS.REGISTRATIONS, { referralCode }),
  findMany: (filter: any = {}, options: any = {}) =>
    store.findMany<Registration>(COLLECTIONS.REGISTRATIONS, filter, options),
  findPaginated: (filter: any = {}, page: number = 1, limit: number = 20, sort: any = { createdAt: -1 }) =>
    store.findPaginated<Registration>(COLLECTIONS.REGISTRATIONS, filter, page, limit, sort),
  count: (filter: any = {}) =>
    store.countDocuments<Registration>(COLLECTIONS.REGISTRATIONS, filter),
  update: (id: string, update: Partial<Registration>) =>
    store.updateOne<Registration>(COLLECTIONS.REGISTRATIONS, { id }, update),
  delete: (id: string) =>
    store.deleteOne<Registration>(COLLECTIONS.REGISTRATIONS, { id }),
  aggregate: <R>(fn: (docs: Registration[]) => R) =>
    store.aggregate<Registration, R>(COLLECTIONS.REGISTRATIONS, fn),
};

export const ReferralEventRepository = {
  create: (data: Omit<ReferralEvent, 'id' | 'createdAt' | 'updatedAt'>) =>
    store.insertOne<ReferralEvent>(COLLECTIONS.REFERRAL_EVENTS, data, 'ref'),
  findMany: (filter: any = {}, options: any = {}) =>
    store.findMany<ReferralEvent>(COLLECTIONS.REFERRAL_EVENTS, filter, options),
  count: (filter: any = {}) =>
    store.countDocuments<ReferralEvent>(COLLECTIONS.REFERRAL_EVENTS, filter),
  findByReferrerId: (referrerRegistrationId: string) =>
    store.findMany<ReferralEvent>(COLLECTIONS.REFERRAL_EVENTS, { referrerRegistrationId }),
  aggregate: <R>(fn: (docs: ReferralEvent[]) => R) =>
    store.aggregate<ReferralEvent, R>(COLLECTIONS.REFERRAL_EVENTS, fn),
};

export const CampaignLinkRepository = {
  create: (data: Omit<CampaignLink, 'id' | 'createdAt' | 'updatedAt'>) =>
    store.insertOne<CampaignLink>(COLLECTIONS.CAMPAIGN_LINKS, data, 'lnk'),
  findById: (id: string) =>
    store.findOne<CampaignLink>(COLLECTIONS.CAMPAIGN_LINKS, { id }),
  findMany: (filter: any = {}, options: any = {}) =>
    store.findMany<CampaignLink>(COLLECTIONS.CAMPAIGN_LINKS, filter, options),
  update: (id: string, update: Partial<CampaignLink>) =>
    store.updateOne<CampaignLink>(COLLECTIONS.CAMPAIGN_LINKS, { id }, update),
  count: (filter: any = {}) =>
    store.countDocuments<CampaignLink>(COLLECTIONS.CAMPAIGN_LINKS, filter),
};

export const BudgetRepository = {
  findAll: (filter: any = {}) =>
    store.findMany<BudgetEntry>(COLLECTIONS.BUDGET_ENTRIES, filter),
  findByCategory: (category: BudgetEntry['category']) =>
    store.findOne<BudgetEntry>(COLLECTIONS.BUDGET_ENTRIES, { category }),
  update: (id: string, update: Partial<BudgetEntry> | ((doc: BudgetEntry) => Partial<BudgetEntry>)) =>
    store.updateOne<BudgetEntry>(COLLECTIONS.BUDGET_ENTRIES, { id }, update),
  aggregate: <R>(fn: (docs: BudgetEntry[]) => R) =>
    store.aggregate<BudgetEntry, R>(COLLECTIONS.BUDGET_ENTRIES, fn),
};

export const CampaignEventRepository = {
  create: (data: Omit<CampaignEvent, 'id' | 'createdAt' | 'updatedAt'>) =>
    store.insertOne<CampaignEvent>(COLLECTIONS.CAMPAIGN_EVENTS, data, 'evt'),
  findMany: (filter: any = {}, options: any = {}) =>
    store.findMany<CampaignEvent>(COLLECTIONS.CAMPAIGN_EVENTS, filter, options),
  count: (filter: any = {}) =>
    store.countDocuments<CampaignEvent>(COLLECTIONS.CAMPAIGN_EVENTS, filter),
  aggregate: <R>(fn: (docs: CampaignEvent[]) => R) =>
    store.aggregate<CampaignEvent, R>(COLLECTIONS.CAMPAIGN_EVENTS, fn),
};

export const AdminUserRepository = {
  create: (data: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>) =>
    store.insertOne<AdminUser>(COLLECTIONS.ADMIN_USERS, data, 'usr'),
  findByEmail: (email: string) =>
    store.findOne<AdminUser>(COLLECTIONS.ADMIN_USERS, { email: email.toLowerCase().trim() }),
  findById: (id: string) =>
    store.findOne<AdminUser>(COLLECTIONS.ADMIN_USERS, { id }),
  count: () =>
    store.countDocuments<AdminUser>(COLLECTIONS.ADMIN_USERS),
  update: (id: string, update: Partial<AdminUser>) =>
    store.updateOne<AdminUser>(COLLECTIONS.ADMIN_USERS, { id }, update),
};

export const CampaignSettingsRepository = {
  get: async (): Promise<CampaignSettings> => {
    let settings = await store.findOne<CampaignSettings>(COLLECTIONS.CAMPAIGN_SETTINGS, {});
    if (!settings) {
      await initializeDatabase();
      settings = await store.findOne<CampaignSettings>(COLLECTIONS.CAMPAIGN_SETTINGS, {});
    }
    return settings!;
  },
  update: async (update: Partial<CampaignSettings>): Promise<CampaignSettings> => {
    const existing = await CampaignSettingsRepository.get();
    const updated = await store.updateOne<CampaignSettings>(
      COLLECTIONS.CAMPAIGN_SETTINGS,
      { id: existing.id },
      update
    );
    return updated!;
  },
};
