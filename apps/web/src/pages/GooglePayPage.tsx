import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { SfIconCheck } from '@storefront-ui/react';

/* eslint-disable @typescript-eslint/no-explicit-any */

const ALLOWED_PAYMENT_METHODS = [
  {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
      allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA'],
    },
    tokenizationSpecification: {
      type: 'PAYMENT_GATEWAY',
      parameters: {
        gateway: 'example',
        gatewayMerchantId: 'exampleGatewayMerchantId',
      },
    },
  },
];

const BASE_REQUEST = { apiVersion: 2, apiVersionMinor: 0 };

function getClient() {
  return new (window as any).google.payments.api.PaymentsClient({
    environment: 'TEST',
  });
}

export default function GooglePayPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, removeFromCart } = useCart()!;
  const total: number = (location.state as { total: number })?.total ?? 0;

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const savings = cart.reduce((s, i) => s + (i.discountPercentage ?? 0) / 100 * i.price * i.quantity, 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const gpButtonRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [notAvailable, setNotAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready && containerRef.current && gpButtonRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(gpButtonRef.current);
    }
  }, [ready]);

  useEffect(() => {
    if ((window as any).google?.payments) {
      initGooglePay();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;
    script.onload = initGooglePay;
    script.onerror = () => setNotAvailable(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  async function initGooglePay() {
    try {
      const client = getClient();
      const res = await client.isReadyToPay({
        ...BASE_REQUEST,
        allowedPaymentMethods: ALLOWED_PAYMENT_METHODS,
      });
      if (!res.result) { setNotAvailable(true); return; }
      gpButtonRef.current = client.createButton({
        onClick: handlePayment,
        buttonType: 'pay',
        buttonColor: 'black',
        buttonSizeMode: 'fill',
      });
      setReady(true);
    } catch {
      setNotAvailable(true);
    }
  }

  async function handlePayment() {
    setLoading(true);
    setError('');
    try {
      const client = getClient();
      const paymentData = await client.loadPaymentData({
        ...BASE_REQUEST,
        allowedPaymentMethods: ALLOWED_PAYMENT_METHODS,
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: total.toFixed(2),
          currencyCode: 'USD',
          countryCode: 'US',
        },
        merchantInfo: { merchantName: 'Alokai Store' },
      });

      const cardNetwork = paymentData.paymentMethodData.info?.cardNetwork;
      const authMethod = paymentData.paymentMethodData.info?.cardDetails; // TEST env puts authMethod here

      const res = await fetch('http://localhost:4000/api/payment/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'googlepay',
          token: paymentData.paymentMethodData.tokenizationData.token,
          amount: total,
          cardNetwork,
          authMethod,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.reason ?? 'Payment failed');
        setLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      const snapshot = cart.map(i => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity, thumbnail: i.thumbnail }));
      const orderRes = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.id, title: i.title, price: i.price, quantity: i.quantity, thumbnail: i.thumbnail })),
          totalAmount: total,
          paymentMethod: 'googlepay',
        }),
      });
      const orderData = await orderRes.json();
      for (const item of [...cart]) await removeFromCart(item.id);
      navigate('/order-success', { replace: true, state: { total, orderId: orderData.order?.id, paymentMethod: 'Google Pay', items: snapshot } });
    } catch (e: unknown) {
      const statusCode = (e as any)?.statusCode ?? '';
      const msg = e instanceof Error ? e.message : '';
      const isCancelled = statusCode === 'CANCELED' || msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('closed');
      if (!isCancelled) {
        setError('Payment failed. Please try again.');
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#F8FAFF' }}>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT: Google Pay form */}
          <div className="flex-1">
            <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366F1, #3B82F6, #06B6D4)' }} />

              <div className="px-6 py-5 flex flex-col items-center gap-1" style={{ background: '#202124' }}>
                <svg height="30" viewBox="0 0 90 30" xmlns="http://www.w3.org/2000/svg">
                  <text x="0" y="24" fontFamily="'Product Sans',Arial,sans-serif" fontWeight="500" fontSize="20" fill="#4285F4">G</text>
                  <text x="15" y="24" fontFamily="'Product Sans',Arial,sans-serif" fontWeight="500" fontSize="20" fill="#EA4335">o</text>
                  <text x="27" y="24" fontFamily="'Product Sans',Arial,sans-serif" fontWeight="500" fontSize="20" fill="#FBBC05">o</text>
                  <text x="39" y="24" fontFamily="'Product Sans',Arial,sans-serif" fontWeight="500" fontSize="20" fill="#4285F4">g</text>
                  <text x="51" y="24" fontFamily="'Product Sans',Arial,sans-serif" fontWeight="500" fontSize="20" fill="#34A853">l</text>
                  <text x="57" y="24" fontFamily="'Product Sans',Arial,sans-serif" fontWeight="500" fontSize="20" fill="#EA4335">e </text>
                  <text x="72" y="24" fontFamily="'Product Sans',Arial,sans-serif" fontWeight="700" fontSize="20" fill="#fff">Pay</text>
                </svg>
                <p className="text-xs" style={{ color: '#9AA0A6' }}>TEST Environment</p>
              </div>

              <div className="px-6 py-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg,#4285F4,#1B3A6B)' }}>
                    A
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#111827' }}>Alokai Store</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Secure checkout</p>
                  </div>
                </div>

                <div className="rounded-xl px-4 py-3 flex justify-between items-center" style={{ background: '#F3F4F6' }}>
                  <span className="text-sm font-medium" style={{ color: '#374151' }}>Total</span>
                  <span className="text-xl font-extrabold" style={{ color: '#111827' }}>${total.toFixed(2)}</span>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-4 gap-2">
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#4285F4" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Processing payment…</span>
                  </div>
                ) : notAvailable ? (
                  <div className="rounded-xl px-4 py-4 text-center" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                    <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>Google Pay Not Available</p>
                    <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                      Open this page in <strong>Chrome</strong> and make sure you're signed in to a Google account with a saved card.
                    </p>
                  </div>
                ) : !ready ? (
                  <div className="flex items-center justify-center py-4 gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#4285F4" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>Loading Google Pay…</span>
                  </div>
                ) : (
                  <div ref={containerRef} style={{ width: '100%', minHeight: 48 }} />
                )}

                {error && (
                  <p className="text-xs text-center font-medium" style={{ color: '#DC2626' }}>{error}</p>
                )}

                <button
                  onClick={() => navigate('/checkout')}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB' }}
                >
                  ← Back to Checkout
                </button>

                <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
                  🔒 TEST mode — no real charges. Requires Chrome + Google account.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Order summary */}
          <div className="w-full lg:w-96 shrink-0 flex flex-col gap-4 lg:sticky lg:top-6">
            <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366F1, #3B82F6, #06B6D4)' }} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-black" style={{ color: '#0F172A' }}>Order Summary</h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#F1F5F9', color: '#475569' }}>
                    {cart.length} item{cart.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {cart.map((item, idx) => (
                    <div key={item.id}>
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img src={item.thumbnail} alt={item.title} className="w-16 h-16 rounded-2xl object-cover" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)', color: '#fff' }}>
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>{item.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>${item.price.toFixed(2)} × {item.quantity}</p>
                          {(item.discountPercentage ?? 0) > 0 && (
                            <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                              {item.discountPercentage?.toFixed(0)}% off
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-black shrink-0" style={{ color: '#1B3A6B' }}>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      {idx < cart.length - 1 && <div className="mt-4" style={{ borderBottom: '1px dashed #E2E8F0' }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
              <div className="p-6 flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#64748B' }}>Subtotal</span>
                  <span className="font-semibold" style={{ color: '#0F172A' }}>${subtotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1" style={{ color: '#16A34A' }}>
                      <SfIconCheck style={{ width: 12, height: 12 }} />
                      Discount savings
                    </span>
                    <span className="font-semibold" style={{ color: '#16A34A' }}>-${savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#64748B' }}>Shipping</span>
                  <span className="font-semibold" style={{ color: '#16A34A' }}>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#64748B' }}>Estimated delivery</span>
                  <span className="font-medium" style={{ color: '#374151' }}>3–5 business days</span>
                </div>
                <div className="mt-2 pt-4 flex justify-between items-center" style={{ borderTop: '2px dashed #E2E8F0' }}>
                  <span className="text-base font-black" style={{ color: '#0F172A' }}>Total</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>USD</span>
                    <span className="text-2xl font-black" style={{
                      background: 'linear-gradient(135deg,#6366F1,#3B82F6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
