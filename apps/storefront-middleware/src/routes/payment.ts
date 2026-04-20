import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

// POST /api/payment/charge
router.post('/charge', async (req, res, next) => {
  try {
    const { paymentMethod, amount } = req.body as { paymentMethod?: string; amount: number };

    // Google Pay (TEST env): token is not a real card — approve or decline based on demo flag
    if (paymentMethod === 'googlepay') {
      const { simulateFailure } = req.body as { simulateFailure?: boolean };
      if (simulateFailure) {
        return res.status(402).json({ success: false, reason: 'Payment declined by issuer' });
      }
      return res.json({ success: true, transactionId: `gp_${Date.now()}` });
    }

    const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv } = req.body as {
      cardNumber: string;
      cardHolder: string;
      expiryMonth: number;
      expiryYear: number;
      cvv: string;
    };

    const chargeAmount = Number(amount);
    const rawNumber = cardNumber.replace(/\s/g, '');

    const card = await prisma.debitCard.findUnique({ where: { cardNumber: rawNumber } });

    if (!card) {
      return res.status(402).json({ success: false, reason: 'Card not found' });
    }

    if (card.cvv !== cvv) {
      await prisma.paymentTransaction.create({
        data: { cardId: card.id, amount: chargeAmount, status: 'failed', reason: 'Invalid CVV' },
      });
      return res.status(402).json({ success: false, reason: 'Invalid CVV' });
    }

    if (card.expiryMonth !== Number(expiryMonth) || card.expiryYear !== Number(expiryYear)) {
      await prisma.paymentTransaction.create({
        data: { cardId: card.id, amount: chargeAmount, status: 'failed', reason: 'Expiry mismatch' },
      });
      return res.status(402).json({ success: false, reason: 'Card expired or expiry mismatch' });
    }

    if (card.cardHolder.toLowerCase() !== cardHolder.trim().toLowerCase()) {
      await prisma.paymentTransaction.create({
        data: { cardId: card.id, amount: chargeAmount, status: 'failed', reason: 'Cardholder name mismatch' },
      });
      return res.status(402).json({ success: false, reason: 'Cardholder name mismatch' });
    }

    if (Number(card.balance) < chargeAmount) {
      await prisma.paymentTransaction.create({
        data: { cardId: card.id, amount: chargeAmount, status: 'failed', reason: 'Insufficient funds' },
      });
      return res.status(402).json({ success: false, reason: 'Insufficient funds' });
    }

    // Atomic: deduct balance + record transaction
    const [updatedCard, transaction] = await prisma.$transaction([
      prisma.debitCard.update({
        where: { id: card.id },
        data: { balance: { decrement: chargeAmount } },
      }),
      prisma.paymentTransaction.create({
        data: { cardId: card.id, amount: chargeAmount, status: 'success' },
      }),
    ]);

    res.json({
      success: true,
      transactionId: transaction.id,
      remainingBalance: Number(updatedCard.balance),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
