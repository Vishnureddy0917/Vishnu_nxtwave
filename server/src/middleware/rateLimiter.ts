import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: {
  windowMs: number; // e.g. 60 * 1000 = 1 minute
  maxRequests: number;
  message?: string;
}) {
  const ipStore = new Map<string, RateLimitRecord>();

  // Cleanup old records periodically
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      if (now > record.resetTime) {
        ipStore.delete(ip);
      }
    }
  }, options.windowMs * 2);

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = ipStore.get(ip);
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      ipStore.set(ip, record);
      next();
      return;
    }

    record.count++;
    if (record.count > options.maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      res.status(429).json({
        success: false,
        error: options.message || 'Too many requests. Please slow down and try again shortly.',
        retryAfter: retryAfterSec,
      });
      return;
    }

    next();
  };
}

export const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 180,
  message: 'Too many requests from this IP address. Please try again in a minute.',
});

export const registrationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 25,
  message: 'Registration rate limit reached for this IP. Please try again later.',
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 15,
  message: 'Too many login attempts. Please wait 15 minutes before trying again.',
});
