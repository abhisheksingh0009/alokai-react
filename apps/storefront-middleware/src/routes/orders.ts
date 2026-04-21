import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authGuard, type AuthRequest } from '../middleware/authGuard.js';

const router = Router();

router.use(authGuard);

// POST /api/orders — create an order after successful payment
router.post('/', async (req: AuthRequest, res) => {
  const { items, totalAmount, paymentMethod } = req.body as {
    items: { productId: number; title: string; price: number; quantity: number; thumbnail?: string }[];
    totalAmount: number;
    paymentMethod: string;
  };

  if (!items?.length || !totalAmount || !paymentMethod) {
    return res.status(400).json({ error: 'items, totalAmount and paymentMethod are required' });
  }

  const order = await prisma.order.create({
    data: {
      userEmail: req.user!.email,
      totalAmount,
      paymentMethod,
      status: 'placed',
      items: {
        create: items.map(i => ({
          productId: i.productId,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          thumbnail: i.thumbnail ?? null,
        })),
      },
    },
    include: { items: true },
  });

  return res.status(201).json({ success: true, order });
});

// GET /api/orders — fetch order history for the logged-in user
router.get('/', async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { userEmail: req.user!.email },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ orders });
});

export default router;
