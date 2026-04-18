import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authGuard, type AuthRequest } from '../middleware/authGuard.js';

const router = Router();

router.use(authGuard);

// ── Helper ────────────────────────────────────────────────────────────────────

async function getWishlistWithProducts(userEmail: string) {
  const rows = await prisma.wishlist.findMany({ where: { userEmail } });
  if (rows.length === 0) return [];

  const productIds = rows.map(r => r.productId);
  const products = await prisma.productDetails.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map(p => [p.id, p]));

  return rows
    .map(r => {
      const p = productMap.get(r.productId);
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
        addedAt:             r.addedAt,
      };
    })
    .filter(Boolean);
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/wishlist — get current user's wishlist
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const items = await getWishlistWithProducts(req.user!.email);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist — toggle: add if not present, remove if already there
// body: { productId: number }
router.post('/toggle', async (req: AuthRequest, res, next) => {
  try {
    const { productId } = req.body as { productId: number };
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const existing = await prisma.wishlist.findUnique({
      where: { userEmail_productId: { userEmail: req.user!.email, productId } },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
    } else {
      await prisma.wishlist.create({
        data: { userEmail: req.user!.email, productId },
      });
    }

    const items = await getWishlistWithProducts(req.user!.email);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wishlist/:productId — remove a specific item
router.delete('/:productId', async (req: AuthRequest, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) return res.status(400).json({ error: 'Invalid productId' });

    await prisma.wishlist.deleteMany({
      where: { userEmail: req.user!.email, productId },
    });

    const items = await getWishlistWithProducts(req.user!.email);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wishlist — clear entire wishlist
router.delete('/', async (req: AuthRequest, res, next) => {
  try {
    await prisma.wishlist.deleteMany({ where: { userEmail: req.user!.email } });
    res.json({ items: [] });
  } catch (err) {
    next(err);
  }
});

export default router;
