import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { SfIconCheck } from '@storefront-ui/react';

type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

function detectCardType(num: string): CardType {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6(?:011|5)/.test(n)) return 'discover';
  return 'unknown';
}

function formatCardNumber(val: string, type: CardType) {
  const digits = val.replace(/\D/g, '');
  const maxLen = type === 'amex' ? 15 : 16;
  const trimmed = digits.slice(0, maxLen);
  if (type === 'amex') {
    return trimmed.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(' ')
    );
  }
  return trimmed.replace(/(\d{4})/g, '$1 ').trim();
}

function CardLogo({ type, size = 28 }: { type: CardType; size?: number }) {
  if (type === 'visa') return (
    <svg width={size * 1.6} height={size * 0.5} viewBox="0 0 80 26">
      <text x="0" y="22" fontFamily="Arial" fontWeight="900" fontSize="22" fill="#fff" fontStyle="italic">VISA</text>
    </svg>
  );
  if (type === 'mastercard') return (
    <svg width={size} height={size} viewBox="0 0 40 28">
      <circle cx="14" cy="14" r="13" fill="#EB001B"/>
      <circle cx="26" cy="14" r="13" fill="#F79E1B"/>
      <path d="M20 5.8a13 13 0 0 1 0 16.4A13 13 0 0 1 20 5.8z" fill="#FF5F00"/>
    </svg>
  );
  if (type === 'amex') return (
    <svg width={size * 1.4} height={size * 0.6} viewBox="0 0 56 28">
      <rect width="56" height="28" rx="4" fill="#fff" fillOpacity="0.2"/>
      <text x="4" y="20" fontFamily="Arial" fontWeight="900" fontSize="13" fill="#fff" letterSpacing="0.5">AMEX</text>
    </svg>
  );
  if (type === 'discover') return (
    <svg width={size * 1.6} height={size * 0.6} viewBox="0 0 64 24">
      <text x="0" y="18" fontFamily="Arial" fontWeight="900" fontSize="13" fill="#fff">DISC</text>
      <circle cx="48" cy="12" r="10" fill="#F76F20"/>
    </svg>
  );
  return null;
}

function LiveCard({ number, name, expiry, cvv, flipped, type }: {
  number: string; name: string; expiry: string; cvv: string; flipped: boolean; type: CardType;
}) {
  const displayNumber = number.padEnd(type === 'amex' ? 17 : 19, ' ');
  const chunks = type === 'amex'
    ? [displayNumber.slice(0, 4), displayNumber.slice(5, 11), displayNumber.slice(12, 17)]
    : [displayNumber.slice(0, 4), displayNumber.slice(5, 9), displayNumber.slice(10, 14), displayNumber.slice(15, 19)];

  const cardGradients: Record<CardType, string> = {
    visa:       'linear-gradient(135deg, #1A1F71 0%, #2563EB 100%)',
    mastercard: 'linear-gradient(135deg, #1C1C1C 0%, #4A0000 100%)',
    amex:       'linear-gradient(135deg, #007A5E 0%, #00B894 100%)',
    discover:   'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)',
    unknown:    'linear-gradient(135deg, #1E3A5F 0%, #374151 100%)',
  };

  return (
    <div style={{ perspective: '1000px', width: '100%', height: 200 }}>
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Front */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          borderRadius: 18, padding: '24px 28px',
          background: cardGradients[type],
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div style={{ width: 42, height: 32, borderRadius: 5, background: 'linear-gradient(135deg, #D4AF37, #F5D97E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 30, height: 22, border: '1.5px solid rgba(0,0,0,0.2)', borderRadius: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 3 }}>
                {[0,1,2,3].map(i => <div key={i} style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 1 }} />)}
              </div>
            </div>
            <CardLogo type={type} size={28} />
          </div>

          <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
            {chunks.map((chunk, i) => (
              <span key={i} style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, letterSpacing: 3, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                {chunk || (type === 'amex' && i === 1 ? '······' : '····')}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
            <div>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Card Holder</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: 1, textTransform: 'uppercase' }}>
                {name || 'FULL NAME'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Expires</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>
                {expiry || 'MM/YY'}
              </p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          borderRadius: 18,
          background: cardGradients[type],
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          transform: 'rotateY(180deg)',
          overflow: 'hidden',
        }}>
          <div style={{ height: 44, background: 'rgba(0,0,0,0.5)', marginTop: 28 }} />
          <div style={{ padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>CVV</p>
            <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 6, padding: '8px 14px', display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, letterSpacing: 4, color: '#111' }}>
                {cvv ? '*'.repeat(cvv.length) : '•••'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CardPaymentMock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, removeFromCart } = useCart()!;
  const total: number = (location.state as { total: number })?.total ?? 0;

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const savings = cart.reduce((s, i) => s + (i.discountPercentage ?? 0) / 100 * i.price * i.quantity, 0);

  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [flipped, setFlipped] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const cvvRef = useRef<HTMLInputElement>(null);
  const cardType = detectCardType(number);
  const cvvLen = cardType === 'amex' ? 4 : 3;
  const numLen = cardType === 'amex' ? 17 : 19;

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumber(formatCardNumber(e.target.value, cardType));
    setErrors(prev => ({ ...prev, number: '' }));
  };

  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setExpiry(val.length > 2 ? `${val.slice(0, 2)}/${val.slice(2)}` : val);
    setErrors(prev => ({ ...prev, expiry: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const rawNum = number.replace(/\s/g, '');
    const expectedLen = cardType === 'amex' ? 15 : 16;
    if (rawNum.length < expectedLen) errs.number = 'Enter a valid card number';
    if (!name.trim() || name.trim().split(' ').length < 2) errs.name = 'Enter your full name';
    const [mm, yy] = expiry.split('/');
    const now = new Date();
    const expDate = new Date(2000 + parseInt(yy ?? '0'), parseInt(mm ?? '0') - 1);
    if (!mm || !yy || parseInt(mm) > 12 || expDate < now) errs.expiry = 'Invalid or expired date';
    if (cvv.length < cvvLen) errs.cvv = `CVV must be ${cvvLen} digits`;
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    const [mm, yy] = expiry.split('/');
    try {
      const res = await fetch('http://localhost:4000/api/payment/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: number,
          cardHolder: name,
          expiryMonth: parseInt(mm),
          expiryYear: 2000 + parseInt(yy),
          cvv,
          amount: total,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        const reason: string = data.reason ?? 'Payment declined';
        const fieldMap: Record<string, string> = {
          'Card not found':            'number',
          'Insufficient funds':        'number',
          'Invalid CVV':               'cvv',
          'Cardholder name mismatch':  'name',
          'Card expired or expiry mismatch': 'expiry',
          'Expiry mismatch':           'expiry',
        };
        const field = fieldMap[reason] ?? 'number';
        setErrors({ [field]: reason });
        setLoading(false);
        return;
      }
      for (const item of [...cart]) await removeFromCart(item.id);
      navigate('/order-success', { replace: true, state: { total } });
    } catch {
      setErrors({ number: 'Network error, please try again' });
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-150";
  const inputStyle = (field: string) => ({
    background: '#F9FAFB',
    border: `1.5px solid ${errors[field] ? '#EF4444' : '#E5E7EB'}`,
    color: '#111827',
  });

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#F8FAFF' }}>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT: Payment form */}
          <div className="flex-1 flex flex-col gap-6">
            <LiveCard number={number} name={name} expiry={expiry} cvv={cvv} flipped={flipped} type={cardType} />

            <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366F1, #3B82F6, #06B6D4)' }} />
              <div className="px-6 py-4 flex items-center justify-between" style={{ background: '#0F172A' }}>
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="#60A5FA" strokeWidth="1.8"/>
                    <path d="M2 10h20" stroke="#60A5FA" strokeWidth="1.8"/>
                  </svg>
                  <span className="text-sm font-bold text-white">Secure Card Payment</span>
                </div>
                <span className="text-xl font-extrabold" style={{ color: '#34D399' }}>${total.toFixed(2)}</span>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>Card Number</label>
                  <div className="relative">
                    <input
                      className={inputClass}
                      style={{ ...inputStyle('number'), paddingRight: 48, fontFamily: 'monospace', letterSpacing: 2 }}
                      placeholder="0000 0000 0000 0000"
                      value={number}
                      onChange={handleNumber}
                      inputMode="numeric"
                      maxLength={numLen}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {cardType !== 'unknown' ? <CardLogo type={cardType} size={20} /> : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="5" width="20" height="14" rx="2" stroke="#D1D5DB" strokeWidth="1.5"/>
                          <path d="M2 10h20" stroke="#D1D5DB" strokeWidth="1.5"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  {errors.number && <p className="text-xs" style={{ color: '#EF4444' }}>{errors.number}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>Cardholder Name</label>
                  <input
                    className={inputClass}
                    style={inputStyle('name')}
                    placeholder="John Smith"
                    value={name}
                    onChange={e => { setName(e.target.value.toUpperCase()); setErrors(p => ({ ...p, name: '' })); }}
                    maxLength={26}
                  />
                  {errors.name && <p className="text-xs" style={{ color: '#EF4444' }}>{errors.name}</p>}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>Expiry</label>
                    <input
                      className={inputClass}
                      style={{ ...inputStyle('expiry'), fontFamily: 'monospace', letterSpacing: 2 }}
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiry}
                      inputMode="numeric"
                      maxLength={5}
                    />
                    {errors.expiry && <p className="text-xs" style={{ color: '#EF4444' }}>{errors.expiry}</p>}
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>CVV</label>
                    <input
                      ref={cvvRef}
                      className={inputClass}
                      style={{ ...inputStyle('cvv'), fontFamily: 'monospace', letterSpacing: 4 }}
                      placeholder={'•'.repeat(cvvLen)}
                      value={cvv}
                      onChange={e => { setCvv(e.target.value.replace(/\D/g, '').slice(0, cvvLen)); setErrors(p => ({ ...p, cvv: '' })); }}
                      onFocus={() => setFlipped(true)}
                      onBlur={() => setFlipped(false)}
                      inputMode="numeric"
                      maxLength={cvvLen}
                    />
                    {errors.cvv && <p className="text-xs" style={{ color: '#EF4444' }}>{errors.cvv}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-extrabold text-sm mt-1 transition-all duration-200 hover:brightness-95 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #1B3A6B, #2563EB)', color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Processing…
                    </>
                  ) : (
                    <>🔒 Pay ${total.toFixed(2)}</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB' }}
                >
                  ← Back to Checkout
                </button>

                <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
                  🔒 Demo only — no real charges. PCI-compliant form simulation.
                </p>
              </form>
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
