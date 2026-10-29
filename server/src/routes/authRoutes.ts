import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AdminUserRepository } from '../db/repository.js';
import { generateToken, requireAdminAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Admin login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await AdminUserRepository.findByEmail(email);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
      return;
    }

    // Update last login
    await AdminUserRepository.update(user.id, {
      lastLoginAt: new Date().toISOString(),
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Current user profile
router.get('/me', requireAdminAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await AdminUserRepository.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
