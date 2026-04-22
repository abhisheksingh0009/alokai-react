import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword, signToken } from '../integrations/auth/index.js';
import { authGuard, type AuthRequest } from '../middleware/authGuard.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { title, firstName, lastName, email, password, phone, dateOfBirth, marketingConsent } = req.body as {
      title?: string; firstName: string; lastName: string; email: string;
      password: string; phone?: string; dateOfBirth?: string; marketingConsent?: boolean;
    };

    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const hashed = await hashPassword(password);
    const name = `${firstName.trim()} ${lastName.trim()}`;
    const user = await prisma.user.create({
      data: {
        title:           title?.trim() || null,
        firstName:       firstName.trim(),
        lastName:        lastName.trim(),
        name,
        email,
        password:        hashed,
        phone:           phone?.trim() || null,
        dateOfBirth:     dateOfBirth ? new Date(dateOfBirth) : null,
        marketingConsent: marketingConsent ?? false,
      },
    });
    const token = signToken({ userId: user.id, email: user.email });

    res.status(201).json({
      user: { id: user.id, title: user.title, firstName: user.firstName, lastName: user.lastName, name: user.name, email: user.email, phone: user.phone },
      token,
    });
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
    res.json({ user: { id: user.id, title: user.title, firstName: user.firstName, lastName: user.lastName, name: user.name, email: user.email, phone: user.phone }, token });
  } catch (err) {
    next(err);
  }
});
// PUT /api/auth/profile
router.put('/profile', authGuard, async (req: AuthRequest, res, next) => {
  try {
    const { title, firstName, lastName, email } = req.body as {
      title?: string; firstName: string; lastName: string; email: string;
    };

    if (!firstName?.trim() || !lastName?.trim())
      return res.status(400).json({ error: 'First name and last name are required' });
    if (!email?.trim())
      return res.status(400).json({ error: 'Email is required' });

    const conflict = await prisma.user.findFirst({
      where: { email: email.trim(), NOT: { id: req.user!.userId } },
    });
    if (conflict) return res.status(409).json({ error: 'Email already in use' });

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        title:     title?.trim() || null,
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        name:      `${firstName.trim()} ${lastName.trim()}`,
        email:     email.trim(),
      },
      select: { id: true, title: true, firstName: true, lastName: true, name: true, email: true, phone: true },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, newPassword } = req.body as { email: string; newPassword: string };
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'No account found with this email address' });

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { email }, data: { password: hashed } });
    res.json({ message: 'Password updated successfully' });
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
      select: { id: true, title: true, firstName: true, lastName: true, name: true, email: true, phone: true, marketingConsent: true, dateOfBirth: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;