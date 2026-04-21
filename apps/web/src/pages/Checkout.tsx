import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import MyAddress from '../components/user-form/MyAddress';
import { SfIconArrowBack, SfIconArrowForward, SfIconLock, SfIconCheck, SfIconLocationOn, SfIconCreditCard } from '@storefront-ui/react';

type PaymentMethod = 'card' | 'paypal' | 'googlepay';

export default function Checkout() {
  const { cart } = useCart()!;
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PaymentMethod>('card');
  const [step, setStep] = useState<'address' | 'payment'>('address');

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const savings = cart.reduce((s, i) => s + (i.discountPercentage ?? 0) / 100 * i.price * i.quantity, 0);
  const grandTotal = subtotal - savings;

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold" style={{ color: '#111827' }}>No items to checkout</p>
        <Link to="/products" className="text-sm font-semibold underline" style={{ color: '#6366F1' }}>Browse products</Link>
      </div>
    );
  }

  const handleContinue = () => {
    if (selected === 'paypal') navigate('/paypal-mock', { state: { total: grandTotal } });
    else if (selected === 'googlepay') navigate('/google-pay', { state: { total: grandTotal } });
    else navigate('/card-payment', { state: { total: grandTotal } });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#F8FAFF' }}>

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Link to="/products" className="text-sm font-medium flex items-center gap-1" style={{ color: '#94A3B8' }}>
              <SfIconArrowBack style={{ width: 14, height: 14 }} />
              Continue Shopping
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight" style={{ color: '#0F172A' }}>Checkout</h1>
              <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Complete your purchase securely</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: '#EEF2FF', border: '1px solid #C7D7F5' }}>
              <SfIconLock style={{ width: 14, height: 14, color: '#6366F1' }} />
              <span className="text-xs font-bold" style={{ color: '#6366F1' }}>256-bit SSL Encrypted</span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center gap-0">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-md"
                  style={{ background: step === 'payment' ? 'linear-gradient(135deg,#16A34A,#22C55E)' : 'linear-gradient(135deg,#6366F1,#3B82F6)', color: '#fff', boxShadow: step === 'payment' ? '0 4px 12px rgba(22,163,74,0.35)' : '0 4px 12px rgba(99,102,241,0.35)' }}>
                  {step === 'payment' ? <SfIconCheck style={{ width: 16, height: 16 }} /> : '1'}
                </div>
                <span className="text-xs font-bold" style={{ color: step === 'address' ? '#0F172A' : '#16A34A' }}>Delivery</span>
              </div>
              {/* Connector */}
              <div className="w-20 h-0.5 mb-5 mx-1" style={{ background: step === 'payment' ? 'linear-gradient(90deg,#22C55E,#6366F1)' : '#E2E8F0' }} />
              {/* Step 2 */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                  style={{ background: step === 'payment' ? 'linear-gradient(135deg,#6366F1,#3B82F6)' : '#E2E8F0', color: step === 'payment' ? '#fff' : '#94A3B8', boxShadow: step === 'payment' ? '0 4px 12px rgba(99,102,241,0.35)' : 'none' }}>2</div>
                <span className="text-xs font-bold" style={{ color: step === 'payment' ? '#0F172A' : '#94A3B8' }}>Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT: Checkout steps */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Delivery Address card */}
            <div className="rounded-3xl overflow-hidden"
              style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366F1, #3B82F6, #06B6D4)' }} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: step === 'payment' ? 'linear-gradient(135deg,#16A34A,#22C55E)' : 'linear-gradient(135deg,#6366F1,#3B82F6)', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
                    {step === 'payment'
                      ? <SfIconCheck className="text-white" />
                      : <SfIconLocationOn className="text-white" />
                    }
                  </div>
                  <div>
                    <h2 className="text-base font-black" style={{ color: '#0F172A' }}>Delivery Address</h2>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Where should we deliver your order?</p>
                  </div>
                </div>

                <MyAddress />

                {step === 'address' && (
                  <button
                    className="mt-6 w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(90deg, #6366F1, #3B82F6)',
                      color: '#fff', border: 'none',
                      boxShadow: '0 8px 20px rgba(99,102,241,0.35)',
                    }}
                  >
                    <span>Continue to Payment</span>
                    <SfIconArrowForward />
                  </button>
                )}
              </div>
            </div>

            {/* Payment Method card */}
            {step === 'payment' && (
              <div className="rounded-3xl overflow-hidden"
                style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366F1, #3B82F6, #06B6D4)' }} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
                        <SfIconCreditCard className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-black" style={{ color: '#0F172A' }}>Payment Method</h2>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>Choose how you'd like to pay</p>
                      </div>
                    </div>
                    <button onClick={() => setStep('address')} className="text-xs font-bold flex items-center gap-1"
                      style={{ color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer' }}>
                      ← Back
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Credit card */}
                    <button onClick={() => setSelected('card')}
                      className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-150"
                      style={{
                        background: selected === 'card' ? '#EEF2FF' : '#F8FAFC',
                        border: selected === 'card' ? '2px solid #6366F1' : '2px solid #E2E8F0',
                        boxShadow: selected === 'card' ? '0 4px 16px rgba(99,102,241,0.15)' : 'none',
                      }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: selected === 'card' ? 'linear-gradient(135deg,#6366F1,#3B82F6)' : '#E2E8F0' }}>
                        <SfIconCreditCard className={selected === 'card' ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{ color: selected === 'card' ? '#4338CA' : '#374151' }}>Credit / Debit Card</p>
                        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Visa, Mastercard, Amex, Discover</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: '#1A1F71', color: '#fff', fontStyle: 'italic' }}>VISA</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: '#252525', color: '#fff' }}>MC</span>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2"
                        style={{ borderColor: selected === 'card' ? '#6366F1' : '#CBD5E1' }}>
                        {selected === 'card' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#6366F1' }} />}
                      </div>
                    </button>

                    {/* PayPal */}
                    <button onClick={() => setSelected('paypal')}
                      className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-150"
                      style={{
                        background: selected === 'paypal' ? '#FFF9EC' : '#F8FAFC',
                        border: selected === 'paypal' ? '2px solid #FFC439' : '2px solid #E2E8F0',
                        boxShadow: selected === 'paypal' ? '0 4px 16px rgba(255,196,57,0.2)' : 'none',
                      }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: selected === 'paypal' ? '#003087' : '#E2E8F0' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill={selected === 'paypal' ? '#003087' : '#9CA3AF'}/>
                          <text x="12" y="16.5" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="9" fill="#fff">PP</text>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{ color: selected === 'paypal' ? '#003087' : '#374151' }}>PayPal</p>
                        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Fast &amp; secure PayPal checkout</p>
                      </div>
                      <svg width="70" height="18" viewBox="0 0 70 18" className="shrink-0">
                        <text x="0" y="14" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#003087">Pay</text>
                        <text x="25" y="14" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#009cde">Pal</text>
                      </svg>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2"
                        style={{ borderColor: selected === 'paypal' ? '#FFC439' : '#CBD5E1' }}>
                        {selected === 'paypal' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFC439' }} />}
                      </div>
                    </button>

                    {/* Google Pay */}
                    <button onClick={() => setSelected('googlepay')}
                      className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-150"
                      style={{
                        background: selected === 'googlepay' ? '#F0FDF4' : '#F8FAFC',
                        border: selected === 'googlepay' ? '2px solid #34A853' : '2px solid #E2E8F0',
                        boxShadow: selected === 'googlepay' ? '0 4px 16px rgba(52,168,83,0.15)' : 'none',
                      }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: selected === 'googlepay' ? '#202124' : '#E2E8F0' }}>
                        <svg width="22" height="14" viewBox="0 0 44 28">
                          <text x="0" y="20" fontFamily="Arial" fontWeight="700" fontSize="18" fill={selected === 'googlepay' ? '#4285F4' : '#9CA3AF'}>G</text>
                          <text x="16" y="20" fontFamily="Arial" fontWeight="700" fontSize="14" fill={selected === 'googlepay' ? '#fff' : '#9CA3AF'}>Pay</text>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{ color: '#374151' }}>Google Pay</p>
                        <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Fast checkout with Google</p>
                      </div>
                      <svg width="44" height="16" viewBox="0 0 44 16" className="shrink-0">
                        <text x="0" y="13" fontFamily="Arial" fontWeight="500" fontSize="11" fill="#4285F4">G</text>
                        <text x="9" y="13" fontFamily="Arial" fontWeight="500" fontSize="11" fill="#EA4335">o</text>
                        <text x="17" y="13" fontFamily="Arial" fontWeight="500" fontSize="11" fill="#FBBC05">o</text>
                        <text x="25" y="13" fontFamily="Arial" fontWeight="500" fontSize="11" fill="#4285F4">g</text>
                        <text x="32" y="13" fontFamily="Arial" fontWeight="500" fontSize="11" fill="#34A853">l</text>
                        <text x="36" y="13" fontFamily="Arial" fontWeight="500" fontSize="11" fill="#EA4335">e</text>
                      </svg>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2"
                        style={{ borderColor: selected === 'googlepay' ? '#34A853' : '#CBD5E1' }}>
                        {selected === 'googlepay' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#34A853' }} />}
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={handleContinue}
                    className="mt-6 w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                    style={
                      selected === 'paypal'
                        ? { background: 'linear-gradient(90deg,#FFC439,#f0a800)', color: '#003087', border: 'none', boxShadow: '0 8px 20px rgba(255,196,57,0.35)' }
                        : selected === 'googlepay'
                        ? { background: 'linear-gradient(90deg,#202124,#3c4043)', color: '#fff', border: 'none', boxShadow: '0 8px 20px rgba(32,33,36,0.25)' }
                        : { background: 'linear-gradient(90deg,#6366F1,#3B82F6)', color: '#fff', border: 'none', boxShadow: '0 8px 20px rgba(99,102,241,0.35)' }
                    }
                  >
                    <span>{selected === 'paypal' ? 'Continue to PayPal' : selected === 'googlepay' ? 'Continue to Google Pay' : 'Complete Payment'}</span>
                    <SfIconArrowForward />
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-4">
                    <SfIconLock style={{ width: 12, height: 12, color: '#CBD5E1' }} />
                    <p className="text-xs" style={{ color: '#CBD5E1' }}>All transactions are 256-bit SSL encrypted · PCI DSS compliant</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Order Summary sidebar */}
          <div className="w-full lg:w-96 shrink-0 flex flex-col gap-4 lg:sticky lg:top-6">

            {/* Items card */}
            <div className="rounded-3xl overflow-hidden"
              style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366F1, #3B82F6, #06B6D4)' }} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-black" style={{ color: '#0F172A' }}>Order Summary</h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: '#F1F5F9', color: '#475569' }}>
                    {cart.length} item{cart.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {cart.map((item, idx) => (
                    <div key={item.id}>
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img src={item.thumbnail} alt={item.title}
                            className="w-16 h-16 rounded-2xl object-cover"
                            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)', color: '#fff' }}>
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: '#0F172A' }}>{item.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>${item.price.toFixed(2)} × {item.quantity}</p>
                          {(item.discountPercentage ?? 0) > 0 && (
                            <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1"
                              style={{ background: '#F0FDF4', color: '#16A34A' }}>
                              {item.discountPercentage?.toFixed(0)}% off
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-black shrink-0" style={{ color: '#1B3A6B' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      {idx < cart.length - 1 && <div className="mt-4" style={{ borderBottom: '1px dashed #E2E8F0' }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price breakdown card */}
            <div className="rounded-3xl overflow-hidden"
              style={{ background: '#fff', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
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
                    }}>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#F8FAFF', border: '1.5px solid #E2E8F0' }}>
              {[
                { icon: '🔒', label: 'SSL Encrypted', sub: 'Your data is fully protected' },
                { icon: '↩️', label: 'Easy Returns', sub: '30-day hassle-free returns' },
                { icon: '🚚', label: 'Free Shipping', sub: 'On all orders over $10' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="text-lg">{b.icon}</span>
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#374151' }}>{b.label}</p>
                    <p className="text-[11px]" style={{ color: '#94A3B8' }}>{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
