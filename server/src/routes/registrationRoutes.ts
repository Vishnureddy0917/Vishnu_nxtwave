import { Router } from 'express';
import { CreateRegistrationInputSchema, Registration } from '../db/schemas.js';
import {
  RegistrationRepository,
  ReferralEventRepository,
  CampaignSettingsRepository,
  CampaignLinkRepository,
} from '../db/repository.js';
import { ReferralEngine } from '../services/referralEngine.js';
import { CsvExporter } from '../services/csvExporter.js';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { registrationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public: Create registration
router.post('/', registrationLimiter, async (req, res, next) => {
  try {
    const input = CreateRegistrationInputSchema.parse(req.body);
    const normalizedEmail = input.email.toLowerCase().trim();

    // Check duplicate email
    const existing = await RegistrationRepository.findByEmail(normalizedEmail);
    if (existing) {
      res.status(409).json({
        success: false,
        error: 'This email address is already registered for the workshop. Check your confirmation details or use your referral link.',
        field: 'email',
      });
      return;
    }

    // Generate unique collision-resistant referral code for this new student
    const studentReferralCode = await ReferralEngine.generateUniqueCode();
    const displayName = ReferralEngine.createDisplayName(input.fullName);

    // Determine acquisition channel
    let originalSource: Registration['originalSource'] = 'direct';
    if (input.referralCode) {
      originalSource = 'referral';
    } else if (input.utmSource) {
      const matchSource = input.utmSource.toLowerCase();
      if (['campus_ambassador', 'whatsapp', 'college_email', 'social_organic', 'paid_experiment'].includes(matchSource)) {
        originalSource = matchSource as Registration['originalSource'];
      }
    }

    // Create the registration document
    const newReg = await RegistrationRepository.create({
      fullName: input.fullName.trim(),
      email: normalizedEmail,
      college: input.college.trim(),
      graduationYear: input.graduationYear,
      degreeBranch: input.degreeBranch.trim(),
      primaryInterest: input.primaryInterest.trim(),
      phone: input.phone?.trim() || null,
      phoneConsent: Boolean(input.phoneConsent),
      referralCode: studentReferralCode,
      referredByCode: input.referralCode ? input.referralCode.trim().toUpperCase() : null,
      referredByRegistrationId: null, // will update if verified
      originalSource,
      utmSource: input.utmSource || null,
      utmMedium: input.utmMedium || null,
      utmCampaign: input.utmCampaign || null,
      utmContent: input.utmContent || null,
      campusIdentifier: input.campusIdentifier || null,
      ambassadorIdentifier: input.ambassadorIdentifier || null,
      shareOnLeaderboard: input.shareOnLeaderboard !== false,
      displayName,
      status: 'verified',
      isDemo: false,
    });

    // Handle Referral Attribution if referral code was provided
    let referralAttributionResult: any = null;
    if (input.referralCode) {
      const attr = await ReferralEngine.processReferralAttribution(
        normalizedEmail,
        input.referralCode,
        newReg.id
      );

      if (attr.isValid && attr.referrer) {
        // Link referrer's registration ID
        await RegistrationRepository.update(newReg.id, {
          referredByRegistrationId: attr.referrer.id,
        });
        referralAttributionResult = {
          attributed: true,
          referrerDisplayName: attr.referrer.displayName,
          referrerCollege: attr.referrer.college,
        };
      } else {
        referralAttributionResult = {
          attributed: false,
          reason: attr.reason,
        };
      }
    }

    // If utmCampaign or source matches a tracked campaign link, increment its registration count
    if (input.utmSource) {
      const links = await CampaignLinkRepository.findMany({ utmSource: input.utmSource });
      for (const link of links) {
        await CampaignLinkRepository.update(link.id, {
          registrationsCount: (link.registrationsCount || 0) + 1,
        });
      }
    }

    const settings = await CampaignSettingsRepository.get();
    const shareableUrl = `${settings.publicBaseUrl}/r/${studentReferralCode}`;

    res.status(201).json({
      success: true,
      data: {
        id: newReg.id,
        fullName: newReg.fullName,
        displayName: newReg.displayName,
        email: newReg.email,
        college: newReg.college,
        referralCode: studentReferralCode,
        shareableUrl,
        verifiedReferralsCount: 0,
        referralAttribution: referralAttributionResult,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Public: Get registration referral status by code (for success & sharing dashboard)
router.get('/status/:referralCode', async (req, res, next) => {
  try {
    const code = req.params.referralCode.trim().toUpperCase();
    const student = await RegistrationRepository.findByReferralCode(code);

    if (!student) {
      res.status(404).json({
        success: false,
        error: 'Student registration with this referral code not found.',
      });
      return;
    }

    const verifiedCount = await ReferralEngine.getVerifiedReferralCount(student.id);
    const settings = await CampaignSettingsRepository.get();

    res.json({
      success: true,
      data: {
        displayName: student.displayName,
        college: student.college,
        referralCode: student.referralCode,
        shareableUrl: `${settings.publicBaseUrl}/r/${student.referralCode}`,
        verifiedReferralsCount: verifiedCount,
        registeredAt: student.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Admin: Get paginated registrations list with search and filters
router.get('/admin', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string || '').toLowerCase().trim();
    const channel = req.query.channel as string;
    const college = req.query.college as string;
    const gradYear = req.query.graduationYear ? parseInt(req.query.graduationYear as string, 10) : undefined;
    const isReferralOnly = req.query.isReferral === 'true';
    const isDemoFilter = req.query.isDemo !== undefined ? req.query.isDemo === 'true' : undefined;

    const filter: any = {};

    if (isDemoFilter !== undefined) {
      filter.isDemo = isDemoFilter;
    }

    if (channel && channel !== 'all') {
      filter.originalSource = channel;
    }

    if (college && college !== 'all') {
      filter.college = college;
    }

    if (gradYear) {
      filter.graduationYear = gradYear;
    }

    if (isReferralOnly) {
      filter.referredByCode = { $ne: null };
    }

    let result = await RegistrationRepository.findPaginated(
      filter,
      page,
      limit,
      { createdAt: -1 }
    );

    // If search keyword provided, filter in memory or predicate
    if (search) {
      const allMatching = await RegistrationRepository.findMany((doc: Registration) => {
        const matchesFilter = Object.keys(filter).every((k) => (doc as any)[k] === filter[k]);
        if (!matchesFilter) return false;
        return (
          doc.fullName.toLowerCase().includes(search) ||
          doc.email.toLowerCase().includes(search) ||
          doc.college.toLowerCase().includes(search) ||
          doc.referralCode.toLowerCase().includes(search)
        );
      });

      const total = allMatching.length;
      const skip = (page - 1) * limit;
      const data = allMatching.slice(skip, skip + limit);

      result = {
        data,
        total,
        skip,
        limit,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Mask emails for safe admin view
    const safeData = result.data.map((r) => ({
      ...r,
      emailMasked: ReferralEngine.maskEmail(r.email),
    }));

    res.json({
      success: true,
      data: safeData,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Admin: Export registrations to secure CSV
router.get('/admin/export', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const isDemoFilter = req.query.isDemo !== undefined ? req.query.isDemo === 'true' : undefined;
    const filter = isDemoFilter !== undefined ? { isDemo: isDemoFilter } : {};

    const registrations = await RegistrationRepository.findMany(filter, {
      sort: { createdAt: -1 },
    });

    const csvContent = CsvExporter.generateCsv(registrations, [
      { key: 'id', label: 'Registration ID' },
      { key: 'createdAt', label: 'Registered At' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'email', label: 'Email Address' },
      { key: 'college', label: 'College' },
      { key: 'graduationYear', label: 'Graduation Year' },
      { key: 'degreeBranch', label: 'Degree & Branch' },
      { key: 'primaryInterest', label: 'Primary Interest' },
      { key: 'referralCode', label: 'Student Referral Code' },
      { key: 'referredByCode', label: 'Referred By Code', transform: (v) => v || 'None' },
      { key: 'originalSource', label: 'Acquisition Channel' },
      { key: 'utmSource', label: 'UTM Source', transform: (v) => v || 'N/A' },
      { key: 'utmMedium', label: 'UTM Medium', transform: (v) => v || 'N/A' },
      { key: 'status', label: 'Registration Status' },
      { key: 'isDemo', label: 'Is Demo Record', transform: (v) => (v ? 'YES' : 'NO') },
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="launchloop-registrations-${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    next(err);
  }
});

// Admin: Delete a registration
router.delete('/admin/:id', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = String(req.params.id);
    const deleted = await RegistrationRepository.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Registration not found' });
      return;
    }
    res.json({ success: true, message: 'Registration deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
