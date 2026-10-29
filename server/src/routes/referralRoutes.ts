import { Router } from 'express';
import { RegistrationRepository, ReferralEventRepository, CampaignEventRepository } from '../db/repository.js';
import { ReferralEngine } from '../services/referralEngine.js';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Public: Look up referral code for invitation preview
router.get('/lookup/:code', async (req, res, next) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const referrer = await RegistrationRepository.findByReferralCode(code);

    if (!referrer || referrer.status !== 'verified') {
      res.status(404).json({
        success: false,
        error: 'Referral code not found or inactive.',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        referralCode: referrer.referralCode,
        referrerDisplayName: referrer.displayName || ReferralEngine.createDisplayName(referrer.fullName),
        referrerCollege: referrer.college,
        isVerified: true,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Public: Leaderboard with privacy protection
router.get('/leaderboard', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 25;
    const leaderboard = await ReferralEngine.getPublicLeaderboard(limit);

    res.json({
      success: true,
      data: leaderboard,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// Admin: Referral performance and viral metrics
router.get('/admin/analytics', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const isDemoFilter = req.query.isDemo !== undefined ? req.query.isDemo === 'true' : undefined;
    const filter = isDemoFilter !== undefined ? { isDemo: isDemoFilter } : {};

    const [allRegistrations, verifiedEvents, referralVisits] = await Promise.all([
      RegistrationRepository.findMany(filter),
      ReferralEventRepository.findMany({ ...filter, status: 'verified' }),
      CampaignEventRepository.count({ ...filter, eventType: 'referral_visit' }),
    ]);

    const totalRegistrations = allRegistrations.length;
    const totalVerifiedReferrals = verifiedEvents.length;

    // Viral coefficient K = verified referrals / total registrations
    const viralCoefficient = totalRegistrations > 0 ? totalVerifiedReferrals / totalRegistrations : 0;

    // Unique active referrers
    const activeReferrerIds = new Set(verifiedEvents.map((e) => e.referrerRegistrationId));
    const participationRate = totalRegistrations > 0 ? (activeReferrerIds.size / totalRegistrations) * 100 : 0;

    // Aggregate top referrers
    const countByReferrer: Record<string, number> = {};
    for (const ev of verifiedEvents) {
      countByReferrer[ev.referrerRegistrationId] = (countByReferrer[ev.referrerRegistrationId] || 0) + 1;
    }

    const topReferrers = [];
    for (const [refId, count] of Object.entries(countByReferrer)) {
      const reg = allRegistrations.find((r) => r.id === refId);
      if (reg) {
        topReferrers.push({
          id: reg.id,
          fullName: reg.fullName,
          displayName: reg.displayName,
          college: reg.college,
          referralCode: reg.referralCode,
          verifiedCount: count,
          emailMasked: ReferralEngine.maskEmail(reg.email),
          channel: reg.originalSource,
        });
      }
    }

    topReferrers.sort((a, b) => b.verifiedCount - a.verifiedCount);

    res.json({
      success: true,
      data: {
        summary: {
          totalVerifiedReferrals,
          viralCoefficient: Number(viralCoefficient.toFixed(3)),
          activeReferrersCount: activeReferrerIds.size,
          referralParticipationRate: Number(participationRate.toFixed(1)),
          trackedReferralVisits: referralVisits,
          referralVisitConversionRate: referralVisits > 0
            ? Number(((totalVerifiedReferrals / referralVisits) * 100).toFixed(1))
            : 0,
        },
        topReferrers: topReferrers.slice(0, 15),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
