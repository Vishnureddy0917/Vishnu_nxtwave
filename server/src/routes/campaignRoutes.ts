import { Router } from 'express';
import { z } from 'zod';
import {
  CampaignLinkRepository,
  CampaignEventRepository,
  CampaignSettingsRepository,
} from '../db/repository.js';
import { AcquisitionChannelEnum, CampaignLink } from '../db/schemas.js';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Public: Track page visits and campaign events
router.post('/track', async (req, res, next) => {
  try {
    const { eventType, path, referralCode, utmSource, utmMedium, utmCampaign, utmContent, campusIdentifier } = req.body;

    const event = await CampaignEventRepository.create({
      eventType: eventType || 'page_visit',
      path: path || '/',
      referralCode: referralCode || null,
      utmSource: utmSource || null,
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
      utmContent: utmContent || null,
      campusIdentifier: campusIdentifier || null,
      userAgent: req.headers['user-agent'] || null,
      isDemo: false,
    });

    // If utmSource or path matches a campaign link, increment clicksCount
    if (utmSource) {
      const links = await CampaignLinkRepository.findMany({ utmSource });
      for (const link of links) {
        await CampaignLinkRepository.update(link.id, {
          clicksCount: (link.clicksCount || 0) + 1,
        });
      }
    }

    res.json({ success: true, eventId: event.id });
  } catch (err) {
    next(err);
  }
});

// Admin: List campaign links
router.get('/links', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const isDemoFilter = req.query.isDemo !== undefined ? req.query.isDemo === 'true' : undefined;
    const filter = isDemoFilter !== undefined ? { isDemo: isDemoFilter } : {};

    const links = await CampaignLinkRepository.findMany(filter, { sort: { createdAt: -1 } });

    const enriched = links.map((l) => ({
      ...l,
      conversionRate: l.clicksCount > 0 ? Number(((l.registrationsCount / l.clicksCount) * 100).toFixed(1)) : 0,
    }));

    res.json({
      success: true,
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
});

const CreateCampaignLinkSchema = z.object({
  name: z.string().min(2, 'Campaign link name is required'),
  channel: AcquisitionChannelEnum,
  utmSource: z.string().min(1, 'UTM Source is required'),
  utmMedium: z.string().min(1, 'UTM Medium is required'),
  utmCampaign: z.string().min(1, 'UTM Campaign is required'),
  utmContent: z.string().default('v1'),
  campusIdentifier: z.string().optional().nullable(),
  ambassadorIdentifier: z.string().optional().nullable(),
});

// Admin: Create new tracked campaign link
router.post('/links', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = CreateCampaignLinkSchema.parse(req.body);
    const settings = await CampaignSettingsRepository.get();

    const params = new URLSearchParams({
      utm_source: input.utmSource.toLowerCase().trim(),
      utm_medium: input.utmMedium.toLowerCase().trim(),
      utm_campaign: input.utmCampaign.toLowerCase().trim(),
      utm_content: (input.utmContent || 'v1').toLowerCase().trim(),
    });

    if (input.campusIdentifier) {
      params.append('campus', input.campusIdentifier.trim());
    }
    if (input.ambassadorIdentifier) {
      params.append('ambassador', input.ambassadorIdentifier.trim());
    }

    const generatedUrl = `${settings.publicBaseUrl}/?${params.toString()}`;

    const newLink = await CampaignLinkRepository.create({
      name: input.name.trim(),
      channel: input.channel,
      utmSource: input.utmSource.toLowerCase().trim(),
      utmMedium: input.utmMedium.toLowerCase().trim(),
      utmCampaign: input.utmCampaign.toLowerCase().trim(),
      utmContent: (input.utmContent || 'v1').toLowerCase().trim(),
      campusIdentifier: input.campusIdentifier || null,
      ambassadorIdentifier: input.ambassadorIdentifier || null,
      generatedUrl,
      clicksCount: 0,
      registrationsCount: 0,
      isActive: true,
      isDemo: false,
    });

    res.status(201).json({
      success: true,
      data: newLink,
    });
  } catch (err) {
    next(err);
  }
});

// Admin: Toggle active state of campaign link
router.patch('/links/:id', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = String(req.params.id);
    const { isActive } = req.body;

    const updated = await CampaignLinkRepository.update(id, {
      isActive: Boolean(isActive),
    });

    if (!updated) {
      res.status(404).json({ success: false, error: 'Campaign link not found' });
      return;
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
