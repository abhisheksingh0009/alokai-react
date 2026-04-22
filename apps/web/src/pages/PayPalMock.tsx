import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { SfIconCheck } from '@storefront-ui/react';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PayPalMock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, removeFromCart } = useCart()!;
  const total: number = (location.state as { total: number })?.total ?? 0;

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const savings = cart.reduce((s, i) => s + (i.discountPercentage ?? 0) / 100 * i.price * i.quantity, 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const simulateFailureRef = useRef(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [initError, setInitError] = useState('');

  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    async function init() {
      try {
        const res = await fetch('http://localhost:4000/api/paypal/client-id');
        const { clientId } = await res.json();

        if (!clientId || clientId === 'your-paypal-client-id') {
          setInitError('PayPal client ID not configured. Add PAYPAL_CLIENT_ID to the middleware .env and restart the server.');
          return;
        }

        script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.onload = renderButtons;
        script.onerror = () => setInitError('Failed to load PayPal SDK. Check your network or client ID.');
        document.body.appendChild(script);
      } catch {
        setInitError('Cannot reach backend. Make sure the middleware server is running on port 4000.');
      }
    }

    init();
    return () => { if (script) document.body.removeChild(script); };
  }, []);

  function renderButtons() {
    const paypal = (window as any).paypal;
    if (!paypal || !containerRef.current) return;

    paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 48 },

      createOrder: async () => {
        const res = await fetch('http://localhost:4000/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total }),
        });
        const data = await res.json();
        if (!data.orderId) throw new Error('Failed to create PayPal order');
        return data.orderId;
      },

      onApprove: async (data: any) => {
        setProcessing(true);
        setError('');
        try {
          const res = await fetch(`http://localhost:4000/api/paypal/capture-order/${data.orderID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ simulateFailure: simulateFailureRef.current }),
          });
          const result = await res.json();
          if (!result.success) {
            setError(result.reason ?? 'Payment failed');
            setProcessing(false);
            return;
          }
          const token = localStorage.getItem('token');
          const snapshot = cart.map(i => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity, thumbnail: i.thumbnail }));
          await fetch('http://localhost:4000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({
              items: cart.map(i => ({ productId: i.id, title: i.title, price: i.price, quantity: i.quantity, thumbnail: i.thumbnail })),
              totalAmount: total,
              paymentMethod: 'paypal',
            }),
          }).then(r => r.json()).then(orderData => {
            for (const item of [...cart]) removeFromCart(item.id);
            navigate('/order-success', { replace: true, state: { total, orderId: orderData.order?.id, paymentMethod: 'PayPal', items: snapshot } });
          });
        } catch {
          setError('Network error. Please try again.');
          setProcessing(false);
        }
      },

      onError: () => {
        setError('PayPal encountered an error. Please try again.');
      },

      onCancel: () => { /* user closed window — do nothing */ },
    }).render(containerRef.current);

    setReady(true);
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#F8FAFF' }}>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT: PayPal form */}
          <div className="flex-1">
            <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366F1, #3B82F6, #06B6D4)' }} />

              <div className="px-6 py-5 flex flex-col items-center gap-1" style={{ background: '#003087' }}>
                <svg width="110" height="28" viewBox="0 0 110 28">
                  <text x="0" y="24" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#fff">Pay</text>
                  <text x="40" y="24" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#009cde">Pal</text>
                </svg>
                <p className="text-xs mt-1" style={{ color: '#93C5FD' }}>Sandbox — Test Environment</p>
              </div>

              <div className="px-6 py-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B7280' }}>Paying to</p>
                  <p className="text-base font-bold" style={{ color: '#111827' }}>Alokai Store</p>
                </div>

                <div className="rounded-xl px-4 py-3 flex justify-between items-center" style={{ background: '#F3F4F6' }}>
                  <span className="text-sm font-medium" style={{ color: '#374151' }}>Amount</span>
                  <span className="text-xl font-extrabold" style={{ color: '#003087' }}>${total.toFixed(2)}</span>
                </div>

                <label className="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer select-none"
                  style={{ background: simulateFailure ? '#FEF2F2' : '#F3F4F6', border: `1.5px solid ${simulateFailure ? '#FCA5A5' : '#E5E7EB'}`, transition: 'all 0.15s' }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: simulateFailure ? '#DC2626' : '#374151' }}>
                      Simulate payment failure
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Demo toggle — forces a declined response</p>
                  </div>
                  <div className="relative shrink-0 ml-3" style={{ width: 40, height: 22 }}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={simulateFailure}
                      onChange={e => { setSimulateFailure(e.target.checked); simulateFailureRef.current = e.target.checked; }}
                    />
                    <div style={{ width: 40, height: 22, borderRadius: 11, background: simulateFailure ? '#EF4444' : '#D1D5DB', transition: 'background 0.2s' }} />
                    <div style={{ position: 'absolute', top: 3, left: simulateFailure ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                  </div>
                </label>

                {processing ? (
                  <div className="flex items-center justify-center py-4 gap-2">
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#003087" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Processing payment…</span>
                  </div>
                ) : initError ? (
                  <div className="rounded-xl px-4 py-4 text-center" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                    <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>Setup Required</p>
                    <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{initError}</p>
                  </div>
                ) : (
                  <>
                    {!ready && (
                      <div className="flex items-center justify-center py-3 gap-2">
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3"/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="#FFC439" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>Loading PayPal…</span>
                      </div>
                    )}
                    <div ref={containerRef} style={{ minHeight: ready ? 'auto' : 0 }} />
                  </>
                )}

                {error && (
                  <p className="text-xs text-center font-medium" style={{ color: '#DC2626' }}>{error}</p>
                )}

                <button
                  onClick={() => navigate('/checkout')}
                  disabled={processing}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB' }}
                >
                  Cancel &amp; Return to Store
                </button>

                <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
                  🔒 Sandbox mode — no real charges.
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
