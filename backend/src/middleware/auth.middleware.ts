import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/environment.js';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const DEMO_USER_ID = '64b8f0f1c2a4d5e6f7a8b9c0';
  const DEMO_USER_EMAIL = 'gokul@moneyos.local';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Graceful fallback to default seeded demo user Gokul
    req.userId = DEMO_USER_ID;
    req.userEmail = DEMO_USER_EMAIL;
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string; email?: string };
    req.userId = decoded.userId || DEMO_USER_ID;
    req.userEmail = decoded.email || DEMO_USER_EMAIL;
    next();
  } catch (error) {
    // If token is invalid or expired, fallback to demo user
    req.userId = DEMO_USER_ID;
    req.userEmail = DEMO_USER_EMAIL;
    next();
  }
}
