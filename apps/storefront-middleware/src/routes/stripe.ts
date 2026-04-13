// TODO: Stripe routes — mounted at /api/stripe
//
// POST /api/stripe/create-payment-intent
//   - Receives: { amount, currency, cartItems }
//   - Calls Stripe SDK (secret key server-side only)
//   - Returns: { clientSecret }
//   - Frontend uses clientSecret to mount <PaymentElement />
//
// POST /api/stripe/webhook
//   - Receives raw Stripe webhook events
//   - Verifies signature using STRIPE_WEBHOOK_SECRET
//   - Handles: payment_intent.succeeded, payment_intent.payment_failed
