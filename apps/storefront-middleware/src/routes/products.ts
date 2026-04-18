import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET /api/products?limit=20&skip=0
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const skip  = parseInt(req.query.skip  as string) || 0;

    const [products, total] = await Promise.all([
      prisma.productDetails.findMany({ take: limit, skip }),
      prisma.productDetails.count(),
    ]);

    res.json({ products, total, limit, skip });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/categories
router.get('/categories', async (_req, res, next) => {
  try {
    const rows = await prisma.productDetails.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: null } },
      orderBy: { category: 'asc' },
    });
    res.json(rows.map(r => r.category).filter(Boolean));
  } catch (err) {
    next(err);
  }
});

// GET /api/products/search?q=query
router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q as string) ?? '';
    const products = await prisma.productDetails.findMany({
      where: {
        OR: [
          { title:       { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { category:    { contains: q, mode: 'insensitive' } },
          { brand:       { contains: q, mode: 'insensitive' } },
        ],
      },
    });
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/category/:category
router.get('/category/:category', async (req, res, next) => {
  try {
    const products = await prisma.productDetails.findMany({
      where: { category: { equals: req.params.category, mode: 'insensitive' } },
    });
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });

    const product = await prisma.productDetails.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (err) {
    next(err);
  }
});

export default router;
