import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authGuard, type AuthRequest } from '../middleware/authGuard.js';

const router = Router();

// All notification routes require a logged-in user
router.use(authGuard);

// POST /api/notifications/stock  — subscribe to back-in-stock alert
router.post('/stock', async (req: AuthRequest, res) => {
  const userEmail = req.user!.email;
  const { productId } = req.body as { productId?: number };

  if (!productId || typeof productId !== 'number') {
    res.status(400).json({ error: 'productId is required' });
    return;
  }

  // Verify product exists and is actually out of stock
  const product = await prisma.productDetails.findUnique({ where: { id: productId } });
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  if (product.stock !== 0) {
    res.status(409).json({ error: 'Product is currently in stock' });
    return;
  }

  // Upsert — safe to call multiple times
  await prisma.stockNotification.upsert({
    where: { email_productId: { email: userEmail, productId } },
    update: { notified: false }, // re-subscribe if previously notified
    create: { email: userEmail, productId },
  });

  res.json({
    success: true,
    message: `You will be notified at ${userEmail} when this product is back in stock.`,
  });
});

// DELETE /api/notifications/stock/:productId  — unsubscribe
router.delete('/stock/:productId', async (req: AuthRequest, res) => {
  const userEmail = req.user!.email;
  const productId = parseInt(req.params.productId, 10);

  if (isNaN(productId)) {
    res.status(400).json({ error: 'Invalid productId' });
    return;
  }

  await prisma.stockNotification.deleteMany({
    where: { email: userEmail, productId },
  });

  res.json({ success: true });
});

// GET /api/notifications/stock/:productId  — check if user is already subscribed
router.get('/stock/:productId', async (req: AuthRequest, res) => {
  const userEmail = req.user!.email;
  const productId = parseInt(req.params.productId, 10);

  if (isNaN(productId)) {
    res.status(400).json({ error: 'Invalid productId' });
    return;
  }

  const existing = await prisma.stockNotification.findUnique({
    where: { email_productId: { email: userEmail, productId } },
  });

  res.json({ subscribed: !!existing && !existing.notified });
});

export default router;
