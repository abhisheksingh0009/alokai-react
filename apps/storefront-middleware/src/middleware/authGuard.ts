import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../integrations/auth/index.js';

export interface AuthRequest extends Request {
  user?: { userId: number; email: string };
}

export function authGuard(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid or expired token' });

  req.user = decoded;
  next();
}
