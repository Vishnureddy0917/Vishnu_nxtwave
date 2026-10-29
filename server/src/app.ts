import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import insightsRoutes from './routes/insightsRoutes.js';
import strategyRoutes from './routes/strategyRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

export function createApp() {
  const app = express();

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // allow local React dev
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: (origin, callback) => {
      // allow localhost or no origin (like mobile/postman)
      callback(null, true);
    },
    credentials: true,
  }));

  // Body Parsing
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // General Rate Limiter
  app.use(generalLimiter);

  // Healthcheck
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'LaunchLoop AI Backend API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Modules
  app.use('/api/auth', authRoutes);
  app.use('/api/registrations', registrationRoutes);
  app.use('/api/referrals', referralRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/budget', budgetRoutes);
  app.use('/api/insights', insightsRoutes);
  app.use('/api/strategy', strategyRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // 404 for unmatched API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.baseUrl}`,
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
