import bcrypt from 'bcryptjs';
import {
  RegistrationRepository,
  ReferralEventRepository,
  CampaignLinkRepository,
  BudgetRepository,
  CampaignEventRepository,
  AdminUserRepository,
  CampaignSettingsRepository,
  initializeDatabase,
} from './repository.js';
import { store, COLLECTIONS } from './repository.js';
import { Registration, ReferralEvent, CampaignLink, BudgetEntry, CampaignEvent } from './schemas.js';

const COLLEGES = [
  'VNR Vignana Jyothi Institute of Engineering (VNR VJIET)',
  'Chaitanya Bharathi Institute of Technology (CBIT)',
  'JNTU College of Engineering Hyderabad',
  'Vasavi College of Engineering',
  'Gokaraju Rangaraju Institute of Engineering (GRIET)',
  'Vellore Institute of Technology (VIT)',
  'SRM Institute of Science and Technology',
  'BVRIT Hyderabad College of Engineering for Women',
  'Mahatma Gandhi Institute of Technology (MGIT)',
  'BITS Pilani, Hyderabad Campus',
];

const BRANCHES = [
  'B.Tech - Computer Science & Engineering',
  'B.Tech - Artificial Intelligence & Data Science',
  'B.Tech - Information Technology',
  'B.Tech - Electronics & Communication Engineering',
  'B.Tech - Computer Science & Business Systems',
];

const INTERESTS = [
  'Building working AI portfolio projects',
  'Cracking technical product company placements',
  'Understanding Generative AI application architecture',
  'Full-stack AI integration (Next.js + LLMs)',
];

const FIRST_NAMES = [
  'Aarav', 'Sneha', 'Rahul', 'Priya', 'Aditya', 'Ananya', 'Rohan', 'Kavya', 'Vikram', 'Divya',
  'Karthik', 'Meera', 'Arjun', 'Pooja', 'Nikhil', 'Tanvi', 'Siddharth', 'Ishita', 'Manish', 'Neha',
  'Sai', 'Harini', 'Teja', 'Sravani', 'Praneeth', 'Deepika', 'Varun', 'Ritu', 'Akash', 'Shruti',
];

const LAST_NAMES = [
  'Sharma', 'Reddy', 'Verma', 'Patel', 'Iyer', 'Rao', 'Gupta', 'Singh', 'Nair', 'Kulkarni',
  'Chowdhury', 'Mishra', 'Joshi', 'Bose', 'Deshmukh', 'Chauhan', 'Menon', 'Bhat', 'Saxena', 'Kumar'
];

export async function seedDemoData(resetOnly: boolean = false): Promise<{
  registrationsCount: number;
  referralsCount: number;
  adminEmail: string;
}> {
  await initializeDatabase();

  // 1. Clean existing demo data if any
  const allRegistrations = await RegistrationRepository.findMany({});
  const nonDemoRegistrations = allRegistrations.filter((r) => !r.isDemo);
  await store.replaceCollection(COLLECTIONS.REGISTRATIONS, nonDemoRegistrations);

  const allReferralEvents = await ReferralEventRepository.findMany({});
  const nonDemoReferrals = allReferralEvents.filter((r) => !r.isDemo);
  await store.replaceCollection(COLLECTIONS.REFERRAL_EVENTS, nonDemoReferrals);

  const allLinks = await CampaignLinkRepository.findMany({});
  const nonDemoLinks = allLinks.filter((l) => !l.isDemo);
  await store.replaceCollection(COLLECTIONS.CAMPAIGN_LINKS, nonDemoLinks);

  const allEvents = await CampaignEventRepository.findMany({});
  const nonDemoEvents = allEvents.filter((e) => !e.isDemo);
  await store.replaceCollection(COLLECTIONS.CAMPAIGN_EVENTS, nonDemoEvents);

  if (resetOnly) {
    console.log('[Seed] Reset completed. Demo records removed safely; real records preserved.');
    return { registrationsCount: 0, referralsCount: 0, adminEmail: '' };
  }

  // 2. Ensure Admin User exists
  const existingAdmin = await AdminUserRepository.findByEmail('admin@launchloop.ai');
  const passwordHash = await bcrypt.hash('Admin@LaunchLoop2026!', 10);
  if (!existingAdmin) {
    await AdminUserRepository.create({
      email: 'admin@launchloop.ai',
      passwordHash,
      fullName: 'Campaign Director',
      role: 'admin',
      lastLoginAt: new Date().toISOString(),
    });
  } else {
    await AdminUserRepository.update(existingAdmin.id, { passwordHash });
  }

  // 3. Seed Tracked Campaign Links
  const campaignLinksData: Array<Omit<CampaignLink, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      name: 'Campus Ambassador Lead Kit',
      channel: 'campus_ambassador',
      utmSource: 'campus_ambassador',
      utmMedium: 'college_rep',
      utmCampaign: 'ai_workshop_nov',
      utmContent: 'lead_kit_v1',
      campusIdentifier: 'VNR VJIET',
      ambassadorIdentifier: 'AMB-AARAV',
      generatedUrl: 'http://localhost:5173/?utm_source=campus_ambassador&utm_medium=college_rep&utm_campaign=ai_workshop_nov&utm_content=lead_kit_v1&campus=vnr_vjiet',
      clicksCount: 310,
      registrationsCount: 92,
      isActive: true,
      isDemo: true,
    },
    {
      name: 'WhatsApp Class Groups Official Blast',
      channel: 'whatsapp',
      utmSource: 'whatsapp',
      utmMedium: 'student_group',
      utmCampaign: 'ai_workshop_nov',
      utmContent: 'class_poster_v2',
      campusIdentifier: 'CBIT',
      ambassadorIdentifier: 'AMB-SNEHA',
      generatedUrl: 'http://localhost:5173/?utm_source=whatsapp&utm_medium=student_group&utm_campaign=ai_workshop_nov&utm_content=class_poster_v2',
      clicksCount: 285,
      registrationsCount: 84,
      isActive: true,
      isDemo: true,
    },
    {
      name: 'College Placement Cell Email Bulletin',
      channel: 'college_email',
      utmSource: 'college_email',
      utmMedium: 'newsletter',
      utmCampaign: 'ai_workshop_nov',
      utmContent: 'placement_bulletin',
      campusIdentifier: 'JNTU',
      ambassadorIdentifier: null,
      generatedUrl: 'http://localhost:5173/?utm_source=college_email&utm_medium=newsletter&utm_campaign=ai_workshop_nov&utm_content=placement_bulletin',
      clicksCount: 160,
      registrationsCount: 42,
      isActive: true,
      isDemo: true,
    },
    {
      name: 'LinkedIn Student Showcase Video',
      channel: 'social_organic',
      utmSource: 'social_organic',
      utmMedium: 'linkedin_post',
      utmCampaign: 'ai_workshop_nov',
      utmContent: 'student_teaser_clip',
      campusIdentifier: null,
      ambassadorIdentifier: null,
      generatedUrl: 'http://localhost:5173/?utm_source=social_organic&utm_medium=linkedin_post&utm_campaign=ai_workshop_nov&utm_content=student_teaser_clip',
      clicksCount: 240,
      registrationsCount: 36,
      isActive: true,
      isDemo: true,
    },
    {
      name: 'High-Intent Search Capstone Experiment',
      channel: 'paid_experiment',
      utmSource: 'paid_experiment',
      utmMedium: 'search_intent',
      utmCampaign: 'ai_workshop_nov',
      utmContent: 'capstone_keywords',
      campusIdentifier: null,
      ambassadorIdentifier: null,
      generatedUrl: 'http://localhost:5173/?utm_source=paid_experiment&utm_medium=search_intent&utm_campaign=ai_workshop_nov&utm_content=capstone_keywords',
      clicksCount: 145,
      registrationsCount: 22,
      isActive: true,
      isDemo: true,
    },
  ];

  for (const link of campaignLinksData) {
    await CampaignLinkRepository.create(link);
  }

  // 4. Seed 285 Realistic Student Registrations over a 7-day timeline
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const baseStartTime = now - 6 * dayMs; // Starts 6 days ago

  const createdRegistrations: Registration[] = [];

  // Top Student Ambassadors who will drive referral cascades
  const ambassadors = [
    { name: 'Aarav Sharma', college: 'VNR Vignana Jyothi Institute of Engineering (VNR VJIET)', code: 'LL-AARAV', count: 14 },
    { name: 'Sneha Reddy', college: 'Chaitanya Bharathi Institute of Technology (CBIT)', code: 'LL-SNEHA', count: 11 },
    { name: 'Rahul Verma', college: 'JNTU College of Engineering Hyderabad', code: 'LL-RAHUL', count: 9 },
    { name: 'Priya Iyer', college: 'Vasavi College of Engineering', code: 'LL-PRIYA', count: 7 },
    { name: 'Aditya Rao', college: 'Vellore Institute of Technology (VIT)', code: 'LL-ADITY', count: 6 },
    { name: 'Ananya Gupta', college: 'SRM Institute of Science and Technology', code: 'LL-ANANY', count: 5 },
  ];

  // Create ambassadors first
  for (let i = 0; i < ambassadors.length; i++) {
    const amb = ambassadors[i];
    const ambCreatedAt = new Date(baseStartTime + (i * 2 * 3600 * 1000)).toISOString();
    const email = `ambassador.${amb.name.toLowerCase().replace(/\s+/g, '.')}@demo.nxtwave.in`;

    const reg = await RegistrationRepository.create({
      fullName: amb.name,
      email,
      college: amb.college,
      graduationYear: 2025,
      degreeBranch: 'B.Tech - Computer Science & Engineering',
      primaryInterest: 'Building working AI portfolio projects',
      phone: `98765432${10 + i}`,
      phoneConsent: true,
      referralCode: amb.code,
      referredByCode: null,
      referredByRegistrationId: null,
      originalSource: 'campus_ambassador',
      utmSource: 'campus_ambassador',
      utmMedium: 'college_rep',
      utmCampaign: 'ai_workshop_nov',
      utmContent: 'lead_kit_v1',
      campusIdentifier: amb.college.split(' ')[0],
      ambassadorIdentifier: `AMB-${amb.code.slice(3)}`,
      shareOnLeaderboard: true,
      displayName: `${amb.name.split(' ')[0]} ${amb.name.split(' ')[1].charAt(0)}.`,
      status: 'verified',
      isDemo: true,
    });
    // Set custom createdAt
    await store.updateOne<Registration>(COLLECTIONS.REGISTRATIONS, { id: reg.id }, {
      createdAt: ambCreatedAt,
      updatedAt: ambCreatedAt,
    });
    createdRegistrations.push(reg);
  }

  // Create referred students linked to ambassadors
  let studentIdx = 1;
  const channelList: Registration['originalSource'][] = [
    'campus_ambassador',
    'whatsapp',
    'college_email',
    'social_organic',
    'paid_experiment',
    'direct'
  ];

  for (const amb of ambassadors) {
    const referrerReg = createdRegistrations.find((r) => r.referralCode === amb.code)!;

    for (let r = 0; r < amb.count; r++) {
      const fName = FIRST_NAMES[(studentIdx + r) % FIRST_NAMES.length];
      const lName = LAST_NAMES[(studentIdx + r * 2) % LAST_NAMES.length];
      const fullName = `${fName} ${lName}`;
      const email = `student.${fName.toLowerCase()}.${lName.toLowerCase()}.${studentIdx}@demo.nxtwave.in`;
      const college = r % 2 === 0 ? amb.college : COLLEGES[(studentIdx + r) % COLLEGES.length];
      const branch = BRANCHES[(studentIdx + r) % BRANCHES.length];
      const interest = INTERESTS[(studentIdx + r) % INTERESTS.length];
      const dayOffset = Math.min(6, Math.floor(r / 2) + 1);
      const regTime = new Date(baseStartTime + (dayOffset * dayMs) + (r * 35 * 60 * 1000)).toISOString();
      const code = `LL-${(1000 + studentIdx).toString(36).toUpperCase()}`;

      const referredStudent = await RegistrationRepository.create({
        fullName,
        email,
        college,
        graduationYear: 2025,
        degreeBranch: branch,
        primaryInterest: interest,
        phone: null,
        phoneConsent: false,
        referralCode: code,
        referredByCode: amb.code,
        referredByRegistrationId: referrerReg.id,
        originalSource: 'referral',
        utmSource: 'referral',
        utmMedium: 'peer_link',
        utmCampaign: 'ai_workshop_nov',
        utmContent: amb.code,
        campusIdentifier: college.split(' ')[0],
        shareOnLeaderboard: true,
        displayName: `${fName} ${lName.charAt(0)}.`,
        status: 'verified',
        isDemo: true,
      });

      await store.updateOne<Registration>(COLLECTIONS.REGISTRATIONS, { id: referredStudent.id }, {
        createdAt: regTime,
        updatedAt: regTime,
      });
      createdRegistrations.push(referredStudent);

      // Create verified referral event
      const refEvt = await ReferralEventRepository.create({
        referrerRegistrationId: referrerReg.id,
        referrerCode: amb.code,
        referredRegistrationId: referredStudent.id,
        referredEmailMasked: `${email.charAt(0)}***@demo.nxtwave.in`,
        status: 'verified',
        isDemo: true,
      });

      await store.updateOne<ReferralEvent>(COLLECTIONS.REFERRAL_EVENTS, { id: refEvt.id }, {
        createdAt: regTime,
        updatedAt: regTime,
      });

      studentIdx++;
    }
  }

  // Now create organic & channel students to reach 285 total
  const remainingCount = 285 - createdRegistrations.length;

  for (let i = 0; i < remainingCount; i++) {
    const fName = FIRST_NAMES[(i * 3) % FIRST_NAMES.length];
    const lName = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const fullName = `${fName} ${lName}`;
    const email = `candidate.${fName.toLowerCase()}.${lName.toLowerCase()}.${i + 100}@demo.nxtwave.in`;
    const college = COLLEGES[i % COLLEGES.length];
    const branch = BRANCHES[i % BRANCHES.length];
    const interest = INTERESTS[i % INTERESTS.length];
    const channel = channelList[i % channelList.length];
    const dayProgress = (i / remainingCount) * 6; // 0 to 6 days
    const regTime = new Date(baseStartTime + (dayProgress * dayMs) + ((i % 12) * 1800 * 1000)).toISOString();
    const code = `LL-${(5000 + i).toString(36).toUpperCase()}`;

    const newReg = await RegistrationRepository.create({
      fullName,
      email,
      college,
      graduationYear: 2025,
      degreeBranch: branch,
      primaryInterest: interest,
      phone: i % 3 === 0 ? `912345${(1000 + i).toString().slice(-4)}` : null,
      phoneConsent: i % 3 === 0,
      referralCode: code,
      referredByCode: null,
      referredByRegistrationId: null,
      originalSource: channel,
      utmSource: channel,
      utmMedium: channel === 'whatsapp' ? 'student_group' : channel === 'campus_ambassador' ? 'college_rep' : 'direct',
      utmCampaign: 'ai_workshop_nov',
      utmContent: 'banner_v1',
      campusIdentifier: college.split(' ')[0],
      shareOnLeaderboard: i % 5 !== 0, // 80% opt-in to leaderboard
      displayName: `${fName} ${lName.charAt(0)}.`,
      status: 'verified',
      isDemo: true,
    });

    await store.updateOne<Registration>(COLLECTIONS.REGISTRATIONS, { id: newReg.id }, {
      createdAt: regTime,
      updatedAt: regTime,
    });
    createdRegistrations.push(newReg);
  }

  // 5. Seed Budget Entries with Realistic Expenses
  const budgets: BudgetEntry[] = await BudgetRepository.findAll({});
  for (const b of budgets) {
    let actualSpend = 0;
    const logs = [];

    if (b.category === 'campus_ambassador') {
      actualSpend = 350;
      logs.push({
        id: 'exp_amb_01',
        date: new Date(baseStartTime + dayMs).toISOString().split('T')[0],
        amount: 350,
        description: 'Physical workshop flyers & college club notice board prints for 5 campuses',
        loggedBy: 'admin',
      });
    } else if (b.category === 'student_creative') {
      actualSpend = 180;
      logs.push({
        id: 'exp_cre_01',
        date: new Date(baseStartTime + 2 * dayMs).toISOString().split('T')[0],
        amount: 180,
        description: 'WhatsApp carousel micro-creative kit & student community banners',
        loggedBy: 'admin',
      });
    } else if (b.category === 'paid_experiment') {
      actualSpend = 420;
      logs.push({
        id: 'exp_paid_01',
        date: new Date(baseStartTime + 4 * dayMs).toISOString().split('T')[0],
        amount: 420,
        description: 'High-intent search experiment for final-year AI project seekers (22 registrations acquired)',
        loggedBy: 'admin',
      });
    }

    await store.updateOne<BudgetEntry>(COLLECTIONS.BUDGET_ENTRIES, { id: b.id }, {
      actualSpend,
      expenseLogs: logs,
      isDemo: true,
    });
  }

  // 6. Seed Telemetry Campaign Events (Visits)
  const channels = ['campus_ambassador', 'whatsapp', 'college_email', 'social_organic', 'paid_experiment', 'direct'];
  for (let v = 0; v < 1140; v++) {
    const ch = channels[v % channels.length];
    const visitTime = new Date(baseStartTime + ((v / 1140) * 6.5 * dayMs)).toISOString();
    await CampaignEventRepository.create({
      eventType: v % 4 === 0 ? 'referral_visit' : 'page_visit',
      path: v % 4 === 0 ? `/r/LL-${ambassadors[v % ambassadors.length].code.slice(3)}` : '/',
      referralCode: v % 4 === 0 ? ambassadors[v % ambassadors.length].code : null,
      utmSource: ch,
      utmMedium: ch === 'whatsapp' ? 'student_group' : 'web',
      utmCampaign: 'ai_workshop_nov',
      utmContent: 'v1',
      campusIdentifier: COLLEGES[v % COLLEGES.length].split(' ')[0],
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      isDemo: true,
    });
  }

  // 7. Update Campaign Settings to Demo Mode
  await CampaignSettingsRepository.update({
    isDemoModeActive: true,
  });

  console.log(`[Seed Success] Deterministic demo data seeded:`);
  console.log(`- 285 Student Registrations`);
  console.log(`- 52 Verified Referral Events with active leaderboards`);
  console.log(`- 1,140 Campaign Visits across 6 channels`);
  console.log(`- ₹950 total spent across 3 expense logs, ₹1,050 remaining under ₹2,000 cap`);
  console.log(`- Admin account: admin@launchloop.ai / Admin@LaunchLoop2026!`);

  return {
    registrationsCount: createdRegistrations.length,
    referralsCount: 52,
    adminEmail: 'admin@launchloop.ai',
  };
}
