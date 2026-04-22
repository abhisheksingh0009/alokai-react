import { Router } from 'express';

const router = Router();

const BASE_URL =
  process.env.PAYPAL_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json() as { access_token: string };
  if (!data.access_token) throw new Error('Failed to obtain PayPal access token');
  return data.access_token;
}

// GET /api/paypal/client-id — safe to expose, only the public client ID
router.get('/client-id', (_req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// POST /api/paypal/create-order
router.post('/create-order', async (req, res, next) => {
  try {
    const { amount } = req.body as { amount: number };
    const token = await getAccessToken();

    const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'USD', value: Number(amount).toFixed(2) },
          description: 'Alokai Store Purchase',
        }],
      }),
    });

    const order = await response.json() as { id: string };
    res.json({ orderId: order.id });
  } catch (err) {
    next(err);
  }
});

// POST /api/paypal/capture-order/:orderId
router.post('/capture-order/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { simulateFailure } = req.body as { simulateFailure?: boolean };

    if (simulateFailure) {
      return res.status(402).json({ success: false, reason: 'Payment declined by issuer' });
    }

    const token = await getAccessToken();

    const response = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const capture = await response.json() as { status: string; id: string };

    if (capture.status === 'COMPLETED') {
      res.json({ success: true, transactionId: capture.id });
    } else {
      res.status(402).json({ success: false, reason: `Payment not completed (status: ${capture.status})` });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
