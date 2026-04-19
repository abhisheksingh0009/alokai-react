import { Router } from 'express';
import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authGuard } from '../middleware/authGuard.js';
import type { AuthRequest } from '../middleware/authGuard.js';

const router = Router();

// GET /api/reviews/:productId — fetch all reviews for a product
router.get('/:productId', async (req, res) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });

  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ reviews });
});

// POST /api/reviews/:productId — submit a review (auth required)
router.post('/:productId', authGuard, async (req: AuthRequest, res: Response) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });

  const { comment, rating } = req.body as { comment?: string; rating?: number };
  if (!comment?.trim()) return res.status(400).json({ error: 'Review comment is required' });
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

  const userEmail = req.user!.email;
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const providerName =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    user.username ||
    userEmail;

  const review = await prisma.review.create({
    data: {
      comment: comment.trim(),
      rating: Math.round(rating),
      providerName,
      productId,
      userEmail,
    },
  });

  res.status(201).json({ review });
});

export default router;
