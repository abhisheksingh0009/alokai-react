import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword, signToken } from '../integrations/auth/index.js';
import { authGuard, type AuthRequest } from '../middleware/authGuard.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { username, name, email, password, phone } = req.body as {
      username: string; name: string; email: string; password: string; phone: string;
    };

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      return res.status(409).json({ error: `${field} already in use` });
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({ data: { username, name, email, password: hashed, phone } });
    const token = signToken({ userId: user.id, email: user.email });

    res.status(201).json({ user: { id: user.id, username: user.username, name: user.name, email: user.email, phone: user.phone }, token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ userId: user.id, email: user.email });
    res.json({ user: { id: user.id, username: user.username, name: user.name, email: user.email, phone: user.phone }, token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => res.json({ message: 'Logged out' }));

// GET /api/auth/me
router.get('/me', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, username: true, name: true, email: true, phone: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
