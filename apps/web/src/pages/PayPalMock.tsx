import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PayPalMock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, removeFromCart } = useCart()!;
  const total: number = (location.state as { total: number })?.total ?? 0;

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
          for (const item of [...cart]) removeFromCart(item.id);
          navigate('/order-success', { replace: true, state: { total } });
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F5F7FA' }}>
      <div className="w-full max-w-sm rounded-2xl shadow-xl overflow-hidden" style={{ background: '#fff' }}>

        {/* Header */}
        <div className="px-6 py-5 flex flex-col items-center gap-1" style={{ background: '#003087' }}>
          <svg width="110" height="28" viewBox="0 0 110 28">
            <text x="0" y="24" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#fff">Pay</text>
            <text x="40" y="24" fontFamily="Arial" fontWeight="bold" fontSize="24" fill="#009cde">Pal</text>
          </svg>
          <p className="text-xs mt-1" style={{ color: '#93C5FD' }}>Sandbox — Test Environment</p>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">
          {/* Merchant */}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B7280' }}>Paying to</p>
            <p className="text-base font-bold" style={{ color: '#111827' }}>Alokai Store</p>
          </div>

          {/* Amount */}
          <div className="rounded-xl px-4 py-3 flex justify-between items-center" style={{ background: '#F3F4F6' }}>
            <span className="text-sm font-medium" style={{ color: '#374151' }}>Amount</span>
            <span className="text-xl font-extrabold" style={{ color: '#003087' }}>${total.toFixed(2)}</span>
          </div>

          {/* Failure simulation toggle */}
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

          {/* PayPal button area */}
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
  );
}
