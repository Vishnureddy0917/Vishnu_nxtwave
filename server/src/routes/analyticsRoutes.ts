import { Router } from 'express';
import {
  RegistrationRepository,
  ReferralEventRepository,
  CampaignEventRepository,
  BudgetRepository,
  CampaignSettingsRepository,
} from '../db/repository.js';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Admin: Command Center KPI metrics & Chart telemetries
router.get('/dashboard', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const isDemoFilter = req.query.isDemo !== undefined ? req.query.isDemo === 'true' : undefined;
    const filter = isDemoFilter !== undefined ? { isDemo: isDemoFilter } : {};

    const [allRegistrations, verifiedReferrals, allEvents, budgets, settings] = await Promise.all([
      RegistrationRepository.findMany(filter),
      ReferralEventRepository.findMany({ ...filter, status: 'verified' }),
      CampaignEventRepository.findMany(filter),
      BudgetRepository.findAll(filter),
      CampaignSettingsRepository.get(),
    ]);

    const target = settings.targetRegistrations || 500;
    const totalValid = allRegistrations.filter((r) => r.status === 'verified').length;
    const remainingToTarget = Math.max(0, target - totalValid);
    const progressPercent = Number(((totalValid / target) * 100).toFixed(1));

    // Registrations today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const registrationsToday = allRegistrations.filter(
      (r) => new Date(r.createdAt).getTime() >= startOfToday.getTime()
    ).length;

    // Referral metrics
    const referralDrivenCount = verifiedReferrals.length;
    const uniqueReferrers = new Set(verifiedReferrals.map((r) => r.referrerRegistrationId));
    const referralParticipationRate = totalValid > 0
      ? Number(((uniqueReferrers.size / totalValid) * 100).toFixed(1))
      : 0;

    // Budget metrics
    const totalPlannedBudget = budgets.reduce((acc, b) => acc + b.plannedAmount, 0);
    const totalActualSpend = budgets.reduce((acc, b) => acc + b.actualSpend, 0);
    const remainingBudget = totalPlannedBudget - totalActualSpend;
    const costPerRegistration = totalValid > 0 && totalActualSpend > 0
      ? Number((totalActualSpend / totalValid).toFixed(1))
      : null;

    // 1. Channel Breakdown
    const channelCounts: Record<string, number> = {
      campus_ambassador: 0,
      whatsapp: 0,
      college_email: 0,
      social_organic: 0,
      paid_experiment: 0,
      referral: 0,
      direct: 0,
    };

    for (const r of allRegistrations) {
      const ch = r.originalSource || 'direct';
      channelCounts[ch] = (channelCounts[ch] || 0) + 1;
    }

    const channelBreakdown = Object.entries(channelCounts).map(([channel, count]) => {
      const channelLabels: Record<string, string> = {
        campus_ambassador: 'Campus Ambassadors',
        whatsapp: 'WhatsApp Communities',
        college_email: 'College Email / Bulletin',
        social_organic: 'Organic Social (LI/IG)',
        paid_experiment: 'Paid High-Intent Experiment',
        referral: 'Referral Engine (Overlay)',
        direct: 'Direct / Website',
      };
      return {
        channel,
        label: channelLabels[channel] || channel,
        registrations: count,
        percentage: totalValid > 0 ? Number(((count / totalValid) * 100).toFixed(1)) : 0,
      };
    });

    // 2. Daily Registration Trend & Cumulative Trajectory
    const sortedRegs = [...allRegistrations].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let baseTime = sortedRegs.length > 0 ? new Date(sortedRegs[0].createdAt).getTime() : Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const dailyTrendMap: { day: string; registrations: number; cumulative: number; plannedTarget: number }[] = [];
    let runningTotal = 0;

    for (let day = 1; day <= 7; day++) {
      const plan = settings.dailyPlans.find((p) => p.day === day);
      const plannedTarget = plan ? plan.cumulativeTarget : day * 70;

      // Filter registrations created on or before this day
      const dayEndMs = baseTime + day * dayMs;
      const dayStartMs = dayEndMs - dayMs;

      const regsInDay = sortedRegs.filter((r) => {
        const time = new Date(r.createdAt).getTime();
        return time >= dayStartMs && time < dayEndMs;
      }).length;

      runningTotal += regsInDay;

      dailyTrendMap.push({
        day: `Day ${day}`,
        registrations: regsInDay,
        cumulative: runningTotal,
        plannedTarget,
      });
    }

    // 3. Channel Conversion Rates (Registrations / Visits)
    const visitCounts: Record<string, number> = {};
    for (const ev of allEvents) {
      if (ev.eventType === 'page_visit' || ev.eventType === 'referral_visit') {
        const ch = ev.utmSource || 'direct';
        visitCounts[ch] = (visitCounts[ch] || 0) + 1;
      }
    }

    const conversionRates = Object.keys(channelCounts)
      .filter((ch) => ch !== 'referral') // Referral is attribution overlay
      .map((ch) => {
        const visits = visitCounts[ch] || 0;
        const regs = channelCounts[ch] || 0;
        const rate = visits > 0 ? Number(((regs / visits) * 100).toFixed(1)) : 0;
        return {
          channel: ch,
          visits,
          registrations: regs,
          conversionRate: rate,
        };
      });

    // 4. Budget vs Actual Spend by Category
    const budgetChart = budgets.map((b) => ({
      category: b.categoryLabel,
      planned: b.plannedAmount,
      actual: b.actualSpend,
      remaining: b.plannedAmount - b.actualSpend,
    }));

    // 5. College Distribution Top 8
    const collegeCounts: Record<string, number> = {};
    for (const r of allRegistrations) {
      if (r.college) {
        collegeCounts[r.college] = (collegeCounts[r.college] || 0) + 1;
      }
    }

    const collegeDistribution = Object.entries(collegeCounts)
      .map(([college, count]) => ({ college, registrations: count }))
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, 8);

    res.json({
      success: true,
      data: {
        kpis: {
          totalRegistrations: totalValid,
          targetRegistrations: target,
          progressPercent,
          remainingToTarget,
          registrationsToday,
          referralDrivenCount,
          referralParticipationRate,
          remainingBudget,
          totalBudgetLimit: settings.totalBudgetLimit || 2000,
          totalActualSpend,
          costPerRegistration,
        },
        dailyTrend: dailyTrendMap,
        channelBreakdown,
        conversionRates,
        budgetChart,
        collegeDistribution,
        isDemoMode: Boolean(settings.isDemoModeActive),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Admin: Toggle Demo Mode
router.post('/settings/toggle-demo', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const settings = await CampaignSettingsRepository.get();
    const newStatus = !settings.isDemoModeActive;
    await CampaignSettingsRepository.update({
      isDemoModeActive: newStatus,
    });

    res.json({
      success: true,
      isDemoModeActive: newStatus,
      message: `Demo mode is now ${newStatus ? 'ENABLED (Showing Synthetic Demo Records)' : 'DISABLED (Showing Live Clean Database)'}`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
