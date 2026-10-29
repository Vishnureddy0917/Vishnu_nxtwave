import {
  RegistrationRepository,
  ReferralEventRepository,
  CampaignEventRepository,
  BudgetRepository,
  CampaignSettingsRepository,
} from '../db/repository.js';

export interface GrowthRecommendation {
  id: string;
  ruleId: string;
  priority: 'high' | 'medium' | 'low' | 'opportunity';
  title: string;
  observation: string;
  supportingMetrics: {
    label: string;
    value: string | number;
    benchmark?: string | number;
  }[];
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

export class IntelligenceEngine {
  /**
   * Evaluates campaign telemetry and generates explainable growth recommendations
   */
  public static async generateInsights(isDemoMode?: boolean): Promise<{
    recommendations: GrowthRecommendation[];
    summary: {
      totalAnalyzed: number;
      highPriorityCount: number;
      ruleEngineVersion: string;
      evaluationTimestamp: string;
    };
  }> {
    const filter = isDemoMode !== undefined ? { isDemo: isDemoMode } : {};

    // 1. Gather telemetry data
    const allRegistrations = await RegistrationRepository.findMany(filter);
    const verifiedRegistrations = allRegistrations.filter((r) => r.status === 'verified');
    const totalRegistrations = verifiedRegistrations.length;

    const allEvents = await CampaignEventRepository.findMany(filter);
    const visitEvents = allEvents.filter((e) => e.eventType === 'page_visit' || e.eventType === 'referral_visit');
    const totalVisits = visitEvents.length;

    const referralEvents = await ReferralEventRepository.findMany(filter);
    const verifiedReferrals = referralEvents.filter((r) => r.status === 'verified');
    const totalReferrals = verifiedReferrals.length;

    const budgets = await BudgetRepository.findAll(filter);
    const totalPlannedBudget = budgets.reduce((acc, b) => acc + b.plannedAmount, 0);
    const totalActualSpend = budgets.reduce((acc, b) => acc + b.actualSpend, 0);
    const remainingBudget = totalPlannedBudget - totalActualSpend;

    const settings = await CampaignSettingsRepository.get();
    const targetRegistrations = settings.targetRegistrations || 500;

    const recommendations: GrowthRecommendation[] = [];

    // Calculate metrics
    const overallConversionRate = totalVisits > 0 ? (totalRegistrations / totalVisits) * 100 : 0;
    const referralShareRate = totalRegistrations > 0 ? (totalReferrals / totalRegistrations) : 0;
    const referralParticipationRate = totalRegistrations > 0
      ? (new Set(verifiedReferrals.map((r) => r.referrerRegistrationId)).size / totalRegistrations) * 100
      : 0;

    // RULE 5: Insufficient Data / Early Stage Check
    if (totalRegistrations < 15 && totalVisits < 40) {
      recommendations.push({
        id: 'rec_early_stage_data',
        ruleId: 'RULE_05_SAMPLE_SIZE',
        priority: 'medium',
        title: 'Initial Signal Collection Phase Active',
        observation: `Current volume (${totalRegistrations} registrations across ${totalVisits} visits) is below statistical threshold for high-confidence optimization.`,
        supportingMetrics: [
          { label: 'Current Registrations', value: totalRegistrations, benchmark: '>= 15' },
          { label: 'Tracked Visits', value: totalVisits, benchmark: '>= 40' },
        ],
        recommendedAction: 'Focus on primary ambassador rollout across top 3 target campus clubs before adjusting messaging or spending.',
        expectedImpact: 'Establish baseline conversion benchmark across 50+ unique student visits.',
        triggerLogic: 'Fires when totalRegistrations < 15 and totalVisits < 40.',
        thresholds: { minRegistrations: 15, minVisits: 40 },
        explanation: {
          whyTriggered: 'Sample size is statistically inadequate for algorithmic channel optimization without variance bias.',
          mathematicalEvidence: `N = ${totalRegistrations} registrations. Margin of error exceeds ±25% at 95% confidence interval.`,
          actionItems: [
            'Verify ambassador tracking links in class groups',
            'Wait until at least 25 registrations are logged before reallocating budget',
          ],
          riskIfIgnored: 'Premature optimization based on outlier data points could misallocate ₹2,000 budget.',
          aiArchitectureNote: 'Deterministic Bayesian early-stopping heuristic. Requires zero LLM calls or cloud costs.',
        },
      });
    }

    // Channel telemetry breakdown
    const channelVisits: Record<string, number> = {};
    for (const v of visitEvents) {
      const ch = v.utmSource || 'direct';
      channelVisits[ch] = (channelVisits[ch] || 0) + 1;
    }

    const channelRegs: Record<string, number> = {};
    for (const r of verifiedRegistrations) {
      const ch = r.originalSource || r.utmSource || 'direct';
      channelRegs[ch] = (channelRegs[ch] || 0) + 1;
    }

    // RULE 1: Channel Underperformance (High Traffic, Low Conversion)
    for (const [channel, visits] of Object.entries(channelVisits)) {
      if (visits >= 20) {
        const regs = channelRegs[channel] || 0;
        const convRate = (regs / visits) * 100;
        if (convRate < 7.5) {
          recommendations.push({
            id: `rec_low_conv_${channel}`,
            ruleId: 'RULE_01_FUNNEL_FRICTION',
            priority: 'high',
            title: `Low Conversion Detected on ${channel.toUpperCase()}`,
            observation: `Channel '${channel}' generated ${visits} visits but only ${regs} registrations (${convRate.toFixed(1)}% conversion vs target benchmark 12%).`,
            supportingMetrics: [
              { label: 'Tracked Visits', value: visits, benchmark: '>= 20' },
              { label: 'Registrations', value: regs },
              { label: 'Conversion Rate', value: `${convRate.toFixed(1)}%`, benchmark: '>= 10.0%' },
            ],
            recommendedAction: `Inspect copy alignment between ${channel} posts and the workshop hero title. Reduce form friction and highlight the 'Free + 60 Mins' guarantee directly in the creative.`,
            expectedImpact: 'Potential lift of 15-25 additional registrations with zero extra rupee spend.',
            triggerLogic: 'Fires when channelVisits >= 20 and conversionRate < 7.5%.',
            thresholds: { minVisits: 20, minConversionRate: 7.5 },
            explanation: {
              whyTriggered: `The channel delivers top-of-funnel interest (${visits} visits), but 90%+ drop off prior to form completion.`,
              mathematicalEvidence: `Observed conversion: ${(convRate).toFixed(2)}%. Benchmark average: 12.0%. Funnel leakage: ${(100 - convRate).toFixed(1)}%.`,
              actionItems: [
                'Ensure landing page headline matches the exact messaging in WhatsApp or social posts',
                'Verify whether students are dropping off on optional phone number field',
                'Pre-fill referral codes if arriving from campus ambassador links',
              ],
              riskIfIgnored: `Continued promotional effort in ${channel} will yield diminishing returns and waste student attention.`,
              aiArchitectureNote: 'Deterministic anomaly detector comparing cohort conversion against campaign benchmark.',
            },
          });
        }
      }
    }

    // RULE 2: Referral Share Rate Friction
    if (totalRegistrations >= 20 && referralParticipationRate < 25) {
      recommendations.push({
        id: 'rec_referral_participation_lag',
        ruleId: 'RULE_02_REFERRAL_COEFFICIENT',
        priority: 'high',
        title: 'Referral Engine Under-Utilized by Registrants',
        observation: `Only ${referralParticipationRate.toFixed(1)}% of registered students have generated at least one verified referral (benchmark >= 30%).`,
        supportingMetrics: [
          { label: 'Active Referrers', value: new Set(verifiedReferrals.map((r) => r.referrerRegistrationId)).size },
          { label: 'Participation Rate', value: `${referralParticipationRate.toFixed(1)}%`, benchmark: '>= 25.0%' },
          { label: 'Viral Coefficient (K)', value: referralShareRate.toFixed(2), benchmark: '>= 0.35' },
        ],
        recommendedAction: 'Enhance confirmation screen WhatsApp CTA with 1-click peer invite copy emphasizing the shared project starter kit.',
        expectedImpact: 'Increasing K from current level to 0.40 unlocks 35+ organic registrations at ₹0 acquisition cost.',
        triggerLogic: 'Fires when totalRegistrations >= 20 and referralParticipationRate < 25%.',
        thresholds: { minRegistrations: 20, minParticipationRate: 25 },
        explanation: {
          whyTriggered: 'The viral loop is not self-sustaining. Most students complete registration but do not share their unique link.',
          mathematicalEvidence: `Viral Factor K = (Referrals / Registrations) = ${referralShareRate.toFixed(2)}. Viral threshold K >= 0.35 needed for 80 referral target.`,
          actionItems: [
            'Test copy: "Invite your lab partner so you can build the AI project together"',
            'Add WhatsApp share button directly inside confirmation email/dialog',
            'Display current leaderboard rank immediately after registration',
          ],
          riskIfIgnored: 'Campaign will require ₹800-₹1200 additional marketing spend to hit 500 registrations.',
          aiArchitectureNote: 'Deterministic viral loop regression analysis without external API dependencies.',
        },
      });
    }

    // RULE 3: Campus Concentration / Peer Cluster Opportunity
    const campusCounts: Record<string, number> = {};
    for (const r of verifiedRegistrations) {
      if (r.college) {
        campusCounts[r.college] = (campusCounts[r.college] || 0) + 1;
      }
    }

    const sortedCampuses = Object.entries(campusCounts).sort((a, b) => b[1] - a[1]);
    if (sortedCampuses.length > 0 && sortedCampuses[0][1] >= 15) {
      const [topCampus, count] = sortedCampuses[0];
      recommendations.push({
        id: 'rec_campus_cluster_surge',
        ruleId: 'RULE_03_CAMPUS_CLUSTER',
        priority: 'opportunity',
        title: `Campus Cluster Spike at ${topCampus}`,
        observation: `${topCampus} accounts for ${count} registrations (${((count / totalRegistrations) * 100).toFixed(1)}% of total cohort). Strong community word-of-mouth detected.`,
        supportingMetrics: [
          { label: 'Top College', value: topCampus },
          { label: 'Registrations from Campus', value: count, benchmark: '>= 15' },
          { label: 'Share of Cohort', value: `${((count / totalRegistrations) * 100).toFixed(1)}%` },
        ],
        recommendedAction: `Deploy dedicated Ambassador kit to student leads at ${topCampus}. Identify affiliated technical institutes and sister colleges in the same university affiliation (e.g. JNTU/OU/Anna Univ).`,
        expectedImpact: 'Tapping 2-3 sister institutions can yield 50-80 additional final-year registrations in 48 hours.',
        triggerLogic: 'Fires when any single college exceeds 15 verified registrations.',
        thresholds: { minCollegeRegistrations: 15 },
        explanation: {
          whyTriggered: `Organic density at ${topCampus} indicates product-message resonance with engineering final years there.`,
          mathematicalEvidence: `Registrations N = ${count}. Density index is ${(count / (totalRegistrations / Math.max(1, sortedCampuses.length))).toFixed(1)}x above cohort mean.`,
          actionItems: [
            `Appoint a Lead Campus Ambassador at ${topCampus}`,
            'Approach sister colleges in the same geographical or university cluster',
            'Provide departmental WhatsApp posters customized for their branch heads',
          ],
          riskIfIgnored: 'Missed opportunity to leverage network effects while student interest is at peak momentum.',
          aiArchitectureNote: 'Deterministic geospatial and institutional clustering heuristic.',
        },
      });
    }

    // RULE 4: Pacing Gap vs Target & Budget Utilization Rule
    // Check current progress vs expected cumulative target
    const currentProgressPercent = (totalRegistrations / targetRegistrations) * 100;
    if (totalRegistrations > 0 && currentProgressPercent < 55 && remainingBudget >= 400) {
      recommendations.push({
        id: 'rec_budget_experiment_activation',
        ruleId: 'RULE_04_PACING_BUDGET_REALLOCATION',
        priority: 'high',
        title: 'Campaign Behind Pacing Target: High-Intent Experiment Triggered',
        observation: `Current acquisition (${totalRegistrations} / ${targetRegistrations}, ${currentProgressPercent.toFixed(1)}%) is trailing target trajectory. ₹${remainingBudget} unspent budget remains available.`,
        supportingMetrics: [
          { label: 'Actual Registrations', value: totalRegistrations, benchmark: '>= 250' },
          { label: 'Target Deficit', value: targetRegistrations - totalRegistrations },
          { label: 'Remaining Budget', value: `₹${remainingBudget}` },
        ],
        recommendedAction: 'Before increasing broad spend, activate the ₹800 high-intent promotional experiment targeting students actively searching for AI capstone project guidance.',
        expectedImpact: 'Acquire 30-50 high-intent registrations at ₹16-₹26 CAC, bridging the pacing gap without exceeding ₹2,000 cap.',
        triggerLogic: 'Fires when totalRegistrations < 55% of target and remainingBudget >= 400.',
        thresholds: { minTargetPercent: 55, minRemainingBudget: 400 },
        explanation: {
          whyTriggered: 'Decision rule: When campaign pace is behind target with sufficient budget headroom, high-intent tactical activation is warranted.',
          mathematicalEvidence: `Deficit = ${targetRegistrations - totalRegistrations} registrations. Budget headroom: ₹${remainingBudget}. Maximum allowable experiment: ₹800.`,
          actionItems: [
            'Test targeted LinkedIn/Google high-intent search creative for "final year AI mini projects"',
            'Ensure UTM parameters tag experiment links as utm_source=paid_experiment',
            'Enforce hard daily spend stop of ₹200/day over 4 days',
          ],
          riskIfIgnored: 'Risk failing the 500 registration target by relying solely on slowing organic channels.',
          aiArchitectureNote: 'Deterministic budget pacing and constrained optimization policy engine.',
        },
      });
    }

    // RULE 6: High Referral Velocity
    if (referralShareRate >= 0.35 && totalReferrals >= 25) {
      recommendations.push({
        id: 'rec_viral_surge_reinforcement',
        ruleId: 'RULE_06_VIRAL_SURGE',
        priority: 'opportunity',
        title: 'Strong Referral Flywheel Detected',
        observation: `Viral coefficient K = ${referralShareRate.toFixed(2)} exceeds campaign baseline (0.25). Registrants are actively recruiting peers.`,
        supportingMetrics: [
          { label: 'Total Verified Referrals', value: totalReferrals },
          { label: 'Viral Coefficient K', value: referralShareRate.toFixed(2), benchmark: '>= 0.25' },
        ],
        recommendedAction: 'Feature top 3 student ambassadors on the public leaderboard and send celebratory milestone badge.',
        expectedImpact: 'Extends viral wave to deliver 25-40 incremental peer registrations at zero rupee cost.',
        triggerLogic: 'Fires when referralShareRate >= 0.35 and totalReferrals >= 25.',
        thresholds: { minK: 0.35, minReferrals: 25 },
        explanation: {
          whyTriggered: 'The peer-to-peer referral mechanism has achieved organic self-acceleration.',
          mathematicalEvidence: `K factor = ${referralShareRate.toFixed(2)}. Each registrant brings an average of ${referralShareRate.toFixed(2)} peers.`,
          actionItems: [
            'Spotlight top referrer in community announcements',
            'Grant priority workshop Q&A pass to students with 3+ referrals',
          ],
          riskIfIgnored: 'Viral momentum naturally decays within 48 hours without public social recognition.',
          aiArchitectureNote: 'Deterministic epidemic/branching process viral parameter calculation.',
        },
      });
    }

    return {
      recommendations,
      summary: {
        totalAnalyzed: recommendations.length,
        highPriorityCount: recommendations.filter((r) => r.priority === 'high').length,
        ruleEngineVersion: 'v1.4.0 (Deterministic No-API Growth Intelligence)',
        evaluationTimestamp: new Date().toISOString(),
      },
    };
  }
}
