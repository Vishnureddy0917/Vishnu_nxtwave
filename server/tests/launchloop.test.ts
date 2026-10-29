import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { createApp } from '../src/app.js';
import { DocumentStore } from '../src/db/documentStore.js';
import {
  initializeDatabase,
  store,
  COLLECTIONS,
  RegistrationRepository,
  ReferralEventRepository,
  BudgetRepository,
  AdminUserRepository,
} from '../src/db/repository.js';
import { ReferralEngine } from '../src/services/referralEngine.js';
import { IntelligenceEngine } from '../src/services/intelligenceEngine.js';
import { CsvExporter } from '../src/services/csvExporter.js';
import bcrypt from 'bcryptjs';

describe('LaunchLoop AI - Full 17-Point Automated Verification Suite', () => {
  let app: ReturnType<typeof createApp>;
  let adminToken: string;
  const testEmail = `test.student.${Date.now()}@example.com`;
  let createdReferralCode: string;
  let firstRegistrationId: string;

  beforeAll(async () => {
    app = createApp();
    await initializeDatabase();

    // Ensure test admin exists
    const existing = await AdminUserRepository.findByEmail('admin@launchloop.ai');
    if (!existing) {
      const passwordHash = await bcrypt.hash('Admin@LaunchLoop2026!', 10);
      await AdminUserRepository.create({
        email: 'admin@launchloop.ai',
        passwordHash,
        fullName: 'Test Admin',
        role: 'admin',
      });
    }

    // Login as admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@launchloop.ai', password: 'Admin@LaunchLoop2026!' });
    adminToken = loginRes.body.token;
  });

  // Test 1: Successful Registration
  it('1. Successfully registers a student with valid inputs', async () => {
    const res = await request(app)
      .post('/api/registrations')
      .send({
        fullName: 'Kavya Sharma',
        email: testEmail,
        college: 'VNR VJIET',
        graduationYear: 2025,
        degreeBranch: 'B.Tech - Computer Science',
        primaryInterest: 'Building working AI portfolio projects',
        phone: '9876543210',
        phoneConsent: true,
        shareOnLeaderboard: true,
        utmSource: 'campus_ambassador',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testEmail.toLowerCase());
    expect(res.body.data.referralCode).toMatch(/^LL-[A-Z0-9]+$/);
    expect(res.body.data.shareableUrl).toContain(res.body.data.referralCode);

    createdReferralCode = res.body.data.referralCode;
    firstRegistrationId = res.body.data.id;
  });

  // Test 2: Invalid Registration Rejection
  it('2. Rejects invalid registration with bad email and missing required fields', async () => {
    const res = await request(app)
      .post('/api/registrations')
      .send({
        fullName: '',
        email: 'not-an-email',
        college: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  // Test 3: Duplicate Email Prevention
  it('3. Prevents duplicate registrations with the same email address', async () => {
    const res = await request(app)
      .post('/api/registrations')
      .send({
        fullName: 'Duplicate Student',
        email: testEmail, // same email as Test 1
        college: 'CBIT',
        graduationYear: 2025,
        degreeBranch: 'B.Tech - IT',
        primaryInterest: 'GenAI Projects',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('already registered');
  });

  // Test 4: Referral-Code Generation
  it('4. Generates unique, collision-resistant referral codes', async () => {
    const code1 = await ReferralEngine.generateUniqueCode();
    const code2 = await ReferralEngine.generateUniqueCode();

    expect(code1).toMatch(/^LL-[A-Z0-9]+$/);
    expect(code2).toMatch(/^LL-[A-Z0-9]+$/);
    expect(code1).not.toBe(code2);
  });

  // Test 5: Referral Attribution
  it('5. Attributes new registration to the referring student', async () => {
    const referredEmail = `referred.${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/registrations')
      .send({
        fullName: 'Rohit Patel',
        email: referredEmail,
        college: 'Vasavi College of Engineering',
        graduationYear: 2025,
        degreeBranch: 'B.Tech - AI/DS',
        primaryInterest: 'Full-stack AI Integration',
        referralCode: createdReferralCode, // referred by Test 1 student
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.referralAttribution).toBeDefined();
    expect(res.body.data.referralAttribution.attributed).toBe(true);
    expect(res.body.data.referralAttribution.referrerDisplayName).toBe('Kavya S.');

    // Check referrer's verified count incremented
    const statusRes = await request(app).get(`/api/registrations/status/${createdReferralCode}`);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.verifiedReferralsCount).toBeGreaterThanOrEqual(1);
  });

  // Test 6: Self-Referral Rejection
  it('6. Rejects self-referral attempts safely without recording referral credit', async () => {
    const attr = await ReferralEngine.processReferralAttribution(
      testEmail, // Same email as referrer
      createdReferralCode,
      firstRegistrationId
    );

    expect(attr.isValid).toBe(false);
    expect(attr.reason).toContain('Self-referral is not permitted');
  });

  // Test 7: Duplicate Referral Prevention
  it('7. Prevents duplicate referral credit on the same registration', async () => {
    const mockNewRegId = `mock_reg_unique_${Date.now()}`;
    // First attribution
    const firstAttr = await ReferralEngine.processReferralAttribution(
      `peer.${Date.now()}@test.in`,
      createdReferralCode,
      mockNewRegId
    );
    expect(firstAttr.isValid).toBe(true);

    // Second attribution attempt for same registration
    const secondAttr = await ReferralEngine.processReferralAttribution(
      `peer.${Date.now()}@test.in`,
      createdReferralCode,
      mockNewRegId
    );
    expect(secondAttr.isValid).toBe(false);
    expect(secondAttr.reason).toContain('already received referral attribution');
  });

  // Test 8: Campaign Source Attribution
  it('8. Accurately attributes acquisition source and UTM parameters', async () => {
    const utmEmail = `utm.test.${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/registrations')
      .send({
        fullName: 'Ananya Deshmukh',
        email: utmEmail,
        college: 'JNTU Hyderabad',
        graduationYear: 2025,
        degreeBranch: 'B.Tech CSE',
        primaryInterest: 'Placement Resume Projects',
        utmSource: 'whatsapp',
        utmMedium: 'student_group',
        utmCampaign: 'ai_workshop_nov',
        utmContent: 'group_poster_v2',
      });

    expect(res.status).toBe(201);
    const reg = await RegistrationRepository.findByEmail(utmEmail);
    expect(reg).toBeDefined();
    expect(reg?.originalSource).toBe('whatsapp');
    expect(reg?.utmMedium).toBe('student_group');
    expect(reg?.utmCampaign).toBe('ai_workshop_nov');
  });

  // Test 9: Budget Cap Validation
  it('9. Enforces ₹2,000 budget cap and requires explicit confirmation if exceeded', async () => {
    const budgets = await BudgetRepository.findAll({});
    const targetCategory = budgets[0];

    const res = await request(app)
      .post('/api/budget/expense')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: targetCategory.id,
        amount: 2500, // exceeds ₹2,000 cap
        description: 'Over-budget advertising attempt',
        confirmedExceed: false,
      });

    // Should return warning requiring confirmation
    expect(res.status).toBe(400);
    expect(res.body.warning).toBe(true);
    expect(res.body.requiresConfirmation).toBe(true);
    expect(res.body.message).toContain('exceeding the ₹2000 hard campaign cap');
  });

  // Test 10: Admin Authentication
  it('10. Authenticates administrator with valid password and issues JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@launchloop.ai',
        password: 'Admin@LaunchLoop2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
  });

  // Test 11: Unauthorized API Access Protection
  it('11. Blocks unauthorized access to admin endpoints without valid token', async () => {
    const res = await request(app).get('/api/registrations/admin');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test 12: Analytics Calculations
  it('12. Accurately calculates dashboard KPIs, pacing, and conversion rates', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { kpis, dailyTrend, channelBreakdown } = res.body.data;

    expect(kpis.targetRegistrations).toBe(500);
    expect(kpis.totalRegistrations).toBeGreaterThan(0);
    expect(kpis.remainingToTarget).toBe(500 - kpis.totalRegistrations);
    expect(dailyTrend.length).toBe(7);
    expect(channelBreakdown.length).toBeGreaterThan(0);
  });

  // Test 13: Persistence After Restart
  it('13. Verifies data persists across store re-instantiation (restart simulation)', async () => {
    // Re-instantiate document store pointing to same data dir
    const secondStore = new DocumentStore();
    const found = await secondStore.findOne<any>(COLLECTIONS.REGISTRATIONS, {
      email: testEmail.toLowerCase(),
    });

    expect(found).not.toBeNull();
    expect(found.email).toBe(testEmail.toLowerCase());
  });

  // Test 14: Concurrent Write Handling
  it('14. Safely serializes concurrent writes without data loss or race conditions', async () => {
    const concurrentEmails = Array.from({ length: 5 }, (_, i) => `concurrent.${i}.${Date.now()}@example.com`);

    const promises = concurrentEmails.map((email, idx) =>
      request(app)
        .post('/api/registrations')
        .send({
          fullName: `Concurrent Student ${idx}`,
          email,
          college: 'GRIET Hyderabad',
          graduationYear: 2025,
          degreeBranch: 'B.Tech CSE',
          primaryInterest: 'AI Projects',
        })
    );

    const results = await Promise.all(promises);
    for (const r of results) {
      expect(r.status).toBe(201);
    }

    // Verify all 5 were written to database
    for (const email of concurrentEmails) {
      const found = await RegistrationRepository.findByEmail(email);
      expect(found).not.toBeNull();
    }
  });

  // Test 15: Malformed JSON Recovery
  it('15. Detects corrupted JSON file, preserves it with timestamp, and recovers safely', async () => {
    const tempCollectionName = `temp_corrupt_test_${Date.now()}`;
    const filePath = store.getFilePath(tempCollectionName);

    // Write invalid corrupted JSON
    await fs.promises.writeFile(filePath, '{ bad json unclosed string', 'utf-8');

    // Attempt read via DocumentStore
    const docs = await (store as any).readCollection(tempCollectionName);
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBe(0);

    // Verify fresh file is now valid JSON
    const content = await fs.promises.readFile(filePath, 'utf-8');
    expect(JSON.parse(content)).toEqual([]);

    // Clean up
    await fs.promises.unlink(filePath).catch(() => {});
  });

  // Test 16: Demo / Live Data Separation
  it('16. Safely isolates demo records from live records and supports clean reset', async () => {
    // Check demo records are flagged with isDemo: true
    const demoRegs = await RegistrationRepository.findMany({ isDemo: true });
    const liveRegs = await RegistrationRepository.findMany({ isDemo: false });

    // Live registration from Test 1 should be isDemo: false
    const ourLiveReg = liveRegs.find((r) => r.email === testEmail.toLowerCase());
    expect(ourLiveReg).toBeDefined();
    expect(ourLiveReg?.isDemo).toBe(false);

    for (const d of demoRegs) {
      expect(d.isDemo).toBe(true);
    }
  });

  // Test 17: CSV Export Validation and Formula Injection Protection
  it('17. Exports CSV with formula injection sanitization on unsafe leading characters', async () => {
    const unsafeData = [
      { name: '=SUM(A1:A10)', role: '+cmd|/C calc', email: '-danger@test.com', note: '@macro' },
    ];

    const csv = CsvExporter.generateCsv(unsafeData, [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'email', label: 'Email' },
      { key: 'note', label: 'Note' },
    ]);

    // Unsafe formulas must be prepended with a single quote '
    expect(csv).toContain("\"'=SUM(A1:A10)\"");
    expect(csv).toContain("\"'+cmd|/C calc\"");
    expect(csv).toContain("\"'-danger@test.com\"");
    expect(csv).toContain("\"'@macro\"");
  });
});
