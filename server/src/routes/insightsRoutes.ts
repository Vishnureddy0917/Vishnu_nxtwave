import { Router } from 'express';
import { IntelligenceEngine } from '../services/intelligenceEngine.js';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Admin: Get explainable growth recommendations
router.get('/', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const isDemoFilter = req.query.isDemo !== undefined ? req.query.isDemo === 'true' : undefined;
    const insights = await IntelligenceEngine.generateInsights(isDemoFilter);

    res.json({
      success: true,
      data: insights.recommendations,
      summary: insights.summary,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
