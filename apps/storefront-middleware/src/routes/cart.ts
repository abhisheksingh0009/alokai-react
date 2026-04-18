import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authGuard, type AuthRequest } from '../middleware/authGuard.js';

const router = Router();

// All cart routes require a logged-in user
router.use(authGuard);

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Fetch all cart rows for a user and enrich them with product details. */
async function getCartWithProducts(userEmail: string) {
  const cartItems = await prisma.cart.findMany({ where: { userEmail } });
  if (cartItems.length === 0) return [];

  const productIds = cartItems.map(c => c.productId);
  const products = await prisma.productDetails.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map(p => [p.id, p]));

  return cartItems
    .map(c => {
      const p = productMap.get(c.productId);
      if (!p) return null;
      return {
        id:                  p.id,
        title:               p.title,
        description:         p.description ?? '',
        category:            p.category,
        price:               parseFloat(String(p.price ?? 0)),
        discountPercentage:  p.discountPercentage ? parseFloat(String(p.discountPercentage)) : null,
        rating:              p.rating ? parseFloat(String(p.rating)) : null,
        stock:               p.stock,
        brand:               p.brand,
        thumbnail:           p.thumbnail ?? '',
        images:              p.thumbnail ? [p.thumbnail] : [],
        warrantyInformation: p.warrantyInformation,
        shippingInformation: p.shippingInformation,
        returnPolicy:        p.returnPolicy,
        quantity:            c.quantity,
        addedAt:             c.addedAt,
        updatedAt:           c.updatedAt,
      };
    })
    .filter(Boolean);
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/cart  — fetch current user's cart with product details
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const items = await getCartWithProducts(req.user!.email);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart  — add a product (or increment if already exists)
// body: { productId: number, quantity?: number }
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body as { productId: number; quantity?: number };

    if (!productId) return res.status(400).json({ error: 'productId is required' });

    // Upsert: if row exists increment quantity, else create
    await prisma.cart.upsert({
      where: { userEmail_productId: { userEmail: req.user!.email, productId } },
      update: { quantity: { increment: quantity }, updatedAt: new Date() },
      create: { userEmail: req.user!.email, productId, quantity },
    });

    const items = await getCartWithProducts(req.user!.email);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/cart/:productId  — set an exact quantity
// body: { quantity: number }
router.patch('/:productId', async (req: AuthRequest, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body as { quantity: number };

    if (isNaN(productId)) return res.status(400).json({ error: 'Invalid productId' });
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'quantity must be >= 1' });

    await prisma.cart.update({
      where: { userEmail_productId: { userEmail: req.user!.email, productId } },
      data: { quantity, updatedAt: new Date() },
    });

    const items = await getCartWithProducts(req.user!.email);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/:productId  — remove one product from cart
router.delete('/:productId', async (req: AuthRequest, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) return res.status(400).json({ error: 'Invalid productId' });

    await prisma.cart.deleteMany({
      where: { userEmail: req.user!.email, productId },
    });

    const items = await getCartWithProducts(req.user!.email);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart  — clear entire cart
router.delete('/', async (req: AuthRequest, res, next) => {
  try {
    await prisma.cart.deleteMany({ where: { userEmail: req.user!.email } });
    res.json({ items: [] });
  } catch (err) {
    next(err);
  }
});

export default router;
