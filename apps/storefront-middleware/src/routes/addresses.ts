import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authGuard, type AuthRequest } from '../middleware/authGuard.js';

const router = Router();

router.use(authGuard);

// GET /api/addresses — list all addresses for the logged-in user
router.get('/', async (req: AuthRequest, res) => {
  const addresses = await prisma.address.findMany({
    where: { userEmail: req.user!.email },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  return res.json({ addresses });
});

// POST /api/addresses — save a new address
router.post('/', async (req: AuthRequest, res) => {
  const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, label, isDefault } = req.body as {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    label?: string;
    isDefault?: boolean;
  };

  if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
    return res.status(400).json({ error: 'fullName, phone, addressLine1, city, state, postalCode are required' });
  }

  const email = req.user!.email;

  // If this is the first address or isDefault is true, unset existing default first
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userEmail: email, isDefault: true },
      data: { isDefault: false },
    });
  }

  // Auto-set default if this is the user's first address
  const count = await prisma.address.count({ where: { userEmail: email } });

  const address = await prisma.address.create({
    data: {
      userEmail: email,
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 ?? null,
      city,
      state,
      postalCode,
      country: country ?? 'US',
      label: label ?? null,
      isDefault: isDefault ?? count === 0,
    },
  });

  return res.status(201).json({ success: true, address });
});

// PUT /api/addresses/:id — update an existing address
router.put('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const email = req.user!.email;

  const existing = await prisma.address.findFirst({ where: { id, userEmail: email } });
  if (!existing) return res.status(404).json({ error: 'Address not found' });

  const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, label, isDefault } = req.body as {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    label?: string;
    isDefault?: boolean;
  };

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userEmail: email, isDefault: true, NOT: { id } },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id },
    data: {
      ...(fullName     !== undefined ? { fullName }     : {}),
      ...(phone        !== undefined ? { phone }        : {}),
      ...(addressLine1 !== undefined ? { addressLine1 } : {}),
      ...(addressLine2 !== undefined ? { addressLine2 } : {}),
      ...(city         !== undefined ? { city }         : {}),
      ...(state        !== undefined ? { state }        : {}),
      ...(postalCode   !== undefined ? { postalCode }   : {}),
      ...(country      !== undefined ? { country }      : {}),
      ...(label        !== undefined ? { label }        : {}),
      ...(isDefault    !== undefined ? { isDefault }    : {}),
    },
  });

  return res.json({ success: true, address: updated });
});

// PATCH /api/addresses/:id/default — set address as default
router.patch('/:id/default', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const email = req.user!.email;

  const existing = await prisma.address.findFirst({ where: { id, userEmail: email } });
  if (!existing) return res.status(404).json({ error: 'Address not found' });

  await prisma.address.updateMany({
    where: { userEmail: email, isDefault: true },
    data: { isDefault: false },
  });

  const address = await prisma.address.update({
    where: { id },
    data: { isDefault: true },
  });

  return res.json({ success: true, address });
});

// DELETE /api/addresses/:id — delete an address
router.delete('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const email = req.user!.email;

  const existing = await prisma.address.findFirst({ where: { id, userEmail: email } });
  if (!existing) return res.status(404).json({ error: 'Address not found' });

  await prisma.address.delete({ where: { id } });

  // If deleted address was default, promote the most recent remaining one
  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userEmail: email },
      orderBy: { createdAt: 'desc' },
    });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }

  return res.json({ success: true });
});

export default router;
