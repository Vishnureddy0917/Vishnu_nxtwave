import { Router } from 'express';
import { z } from 'zod';
import { CampaignSettingsRepository, RegistrationRepository } from '../db/repository.js';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Admin: Get 7-Day Strategy Plan with Live Telemetry Comparison
router.get('/', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const isDemoFilter = req.query.isDemo !== undefined ? req.query.isDemo === 'true' : undefined;
    const filter = isDemoFilter !== undefined ? { isDemo: isDemoFilter } : {};

    const [settings, registrations] = await Promise.all([
      CampaignSettingsRepository.get(),
      RegistrationRepository.findMany(filter),
    ]);

    // Group actual registrations by day (based on createdAt relative to cohort start)
    const sortedRegs = [...registrations].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let baseTime = sortedRegs.length > 0 ? new Date(sortedRegs[0].createdAt).getTime() : Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const actualsByDay: number[] = [0, 0, 0, 0, 0, 0, 0];
    for (const r of sortedRegs) {
      const diff = new Date(r.createdAt).getTime() - baseTime;
      const dayIdx = Math.min(6, Math.max(0, Math.floor(diff / dayMs)));
      actualsByDay[dayIdx]++;
    }

    let runningActual = 0;
    const enrichedPlans = settings.dailyPlans.map((plan, idx) => {
      const actualCount = actualsByDay[idx] || 0;
      runningActual += actualCount;
      const cumulativeTarget = plan.cumulativeTarget;
      const gap = runningActual - cumulativeTarget;
      const pacingRatio = cumulativeTarget > 0 ? (runningActual / cumulativeTarget) * 100 : 0;

      let correctiveAction = 'Pacing healthy. Maintain planned channel distribution.';
      if (pacingRatio < 70) {
        correctiveAction =
          'CRITICAL DECISION RULE TRIGGERED: Acquisition is < 70% of cumulative target. Shift marketing effort immediately toward top 2 highest-converting channels and onboard 5 more campus ambassadors before spending additional budget.';
      } else if (pacingRatio < 90) {
        correctiveAction =
          'Slight pacing lag. Increase WhatsApp group broadcast frequency and trigger peer referral incentive nudges.';
      }

      return {
        ...plan,
        actualRegistrations: actualCount,
        cumulativeActual: runningActual,
        gap,
        pacingRatio: Number(pacingRatio.toFixed(1)),
        isPacingAlert: pacingRatio < 70,
        correctiveAction,
      };
    });

    res.json({
      success: true,
      data: {
        campaignTitle: settings.campaignTitle,
        targetRegistrations: settings.targetRegistrations,
        totalActualRegistrations: registrations.length,
        channelTargets: [
          { channel: 'Campus Clubs & Ambassadors', target: 150, percentage: 30, color: '#6366F1' },
          { channel: 'WhatsApp Student Communities', target: 140, percentage: 28, color: '#10B981' },
          { channel: 'College Email & Newsletters', target: 70, percentage: 14, color: '#06B6D4' },
          { channel: 'Instagram & LinkedIn Organic', target: 60, percentage: 12, color: '#EC4899' },
          { channel: 'Referral-Led Acquisition', target: 80, percentage: 16, color: '#8B5CF6', note: 'Attribution Overlay' },
        ],
        dailyPlans: enrichedPlans,
      },
    });
  } catch (err) {
    next(err);
  }
});

const UpdatePlansSchema = z.object({
  dailyPlans: z.array(
    z.object({
      day: z.number().min(1).max(7),
      target: z.number(),
      cumulativeTarget: z.number(),
      objective: z.string(),
      primaryChannel: z.string(),
      activities: z.array(z.string()),
    })
  ),
});

// Admin: Update 7-Day Plans
router.put('/plan', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { dailyPlans } = UpdatePlansSchema.parse(req.body);
    const updatedSettings = await CampaignSettingsRepository.update({
      dailyPlans,
    });

    res.json({
      success: true,
      data: updatedSettings.dailyPlans,
    });
  } catch (err) {
    next(err);
  }
});

// Admin: 5-Slide Presentation Notes
router.get('/slides', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const slides = [
      {
        slideNumber: 1,
        title: 'Target Students, Student Pain Points & Workshop Proposition',
        subtitle: 'Why final-year engineering students will act now',
        content: {
          targetAudience: 'Final-year B.Tech students (CSE, IT, AI/DS, ECE) facing placement season and final-year project submissions.',
          corePainPoints: [
            '10-hour generic YouTube tutorials result in low completion and zero working projects to showcase on resumes.',
            'Placement interviews heavily interrogate AI literacy, but students lack practical full-stack AI deployment experience.',
            'Limited time and zero budget: students cannot afford paid APIs or complex cloud configurations.'
          ],
          valueProposition: '“Build Your First AI Project in 60 Minutes” — Free, practical, beginner-friendly live sprint delivering a deployable AI mini-project that students can test and link in their portfolio.'
        }
      },
      {
        slideNumber: 2,
        title: 'Priority Channels & Acquisition Model',
        subtitle: 'Path to 500 registrations with ₹2,000 budget',
        content: {
          channelModel: [
            { channel: 'Campus Clubs & Ambassadors', registrations: 150, share: '30%', cost: '₹500', tactic: 'Core engineering college student leads with digital asset kits & club poster distributions.' },
            { channel: 'WhatsApp Student Communities', registrations: 140, share: '28%', cost: '₹300', tactic: 'Direct peer distribution across class, lab, and departmental announcement hubs.' },
            { channel: 'College Email & Newsletters', registrations: 70, share: '14%', cost: '₹0', tactic: 'Placement coordinator outreach & student placement rep newsletters.' },
            { channel: 'Instagram & LinkedIn Organic', registrations: 60, share: '12%', cost: '₹0', tactic: 'Student project breakdown carousels & student testimonial clips.' },
            { channel: 'Referral-Led Acquisition', registrations: 80, share: '16%', cost: '₹0 (Organic Overlay)', tactic: 'Post-registration peer viral loop (Viral coefficient K >= 0.35).' },
          ],
          totalRegistrations: 500,
          totalBudget: '₹2,000',
          blendedCAC: '₹4.00 per registered final-year student'
        }
      },
      {
        slideNumber: 3,
        title: 'Seven-Day Execution Plan & Daily Milestones',
        subtitle: 'Systematic progression with continuous pacing monitoring',
        content: {
          timeline: [
            { day: 'Day 1', target: '30 (Cum: 30)', focus: 'Launch Ambassador program & early WhatsApp outreach' },
            { day: 'Day 2', target: '50 (Cum: 80)', focus: 'Scale WhatsApp student communities & engineering clubs' },
            { day: 'Day 3', target: '65 (Cum: 145)', focus: 'College email & department placement bulletin outreach' },
            { day: 'Day 4', target: '75 (Cum: 220)', focus: 'Mid-campaign momentum & LinkedIn project breakdown' },
            { day: 'Day 5', target: '85 (Cum: 305)', focus: 'High-intent experimentation & secondary college outreach' },
            { day: 'Day 6', target: '95 (Cum: 400)', focus: 'Referral cascade surge & final lab-group invites' },
            { day: 'Day 7', target: '100 (Cum: 500)', focus: '24-hour final sprint and registration closeout' },
          ]
        }
      },
      {
        slideNumber: 4,
        title: '₹2,000 Budget Allocation, Telemetry & Optimization',
        subtitle: 'Disciplined capital efficiency with automated growth rules',
        content: {
          budgetAllocation: [
            { category: 'Campus Ambassador & Club Outreach', planned: '₹500', share: '25%' },
            { category: 'Student-Community Creative Distribution', planned: '₹300', share: '15%' },
            { category: 'Optional High-Intent Promotional Experiment', planned: '₹800', share: '40%' },
            { category: 'Contingency & Pacing Reserve', planned: '₹400', share: '20%' },
          ],
          decisionRule: 'If registrations drop below 70% of cumulative trajectory at Day 4, freeze broad spend, shift 100% effort to the 2 highest-converting channels, and activate 5 additional campus reps before drawing from contingency.',
          growthIntelligence: 'Deterministic Bayesian rules engine evaluates channel conversion, referral velocity, and campus clusters without paid API costs.'
        }
      },
      {
        slideNumber: 5,
        title: 'Working Asset, Referral Mechanism, Assumptions & Risks',
        subtitle: 'LaunchLoop AI as an integrated acquisition platform',
        content: {
          workingAssetFeatures: [
            'Custom high-performance local NoSQL document database with atomic writes and corruption recovery.',
            'Collision-resistant referral engine with anti-self-referral validation and privacy-conscious public leaderboard.',
            'Deterministic UTM campaign link tracking and registration attribution.',
            'Command Center with real-time KPI telemetry, CAC calculation, and safe formula-injection-proof CSV exports.'
          ],
          keyAssumptions: [
            'Student ambassadors recruit an average of 10-15 peers across their respective campus sections.',
            'Free 60-minute practical project framing yields at least 10-12% visitor-to-registration conversion.'
          ],
          risksAndMitigations: [
            { risk: 'WhatsApp spam fatigue in class groups', mitigation: 'Limit broadcasts to 2 high-value messages; emphasize free project kit.' },
            { risk: 'High drop-off on registration form', mitigation: 'Keep personal fields minimal; optional phone collection with explicit consent.' },
            { risk: 'Low initial referral sharing', mitigation: 'Instant 1-click WhatsApp share with pre-composed peer invite on confirmation screen.' }
          ]
        }
      }
    ];

    res.json({
      success: true,
      data: slides,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
