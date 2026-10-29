import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { UniqueConstraintError, DocumentNotFoundError } from '../db/types.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: 'Validation failed for one or more fields',
      errors: formattedErrors,
    });
    return;
  }

  // 2. Database Unique Constraint Violations
  if (err instanceof UniqueConstraintError) {
    let friendlyMessage = err.message;
    if (err.field === 'email') {
      friendlyMessage = 'This email address is already registered for the workshop.';
    } else if (err.field === 'referralCode') {
      friendlyMessage = 'Referral code collision detected. Please try submitting again.';
    }

    res.status(409).json({
      success: false,
      error: friendlyMessage,
      field: err.field,
    });
    return;
  }

  // 3. Document Not Found
  if (err instanceof DocumentNotFoundError) {
    res.status(404).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // 4. Default Internal Server Error
  console.error('[Unhandled Server Error]:', err);
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(500).json({
    success: false,
    error: isProduction
      ? 'An unexpected error occurred while processing your request. Please try again.'
      : err.message || 'Internal Server Error',
  });
}
