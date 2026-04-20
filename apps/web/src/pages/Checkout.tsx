import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

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
        <Link to="/products" className="text-sm font-semibold underline" style={{ color: '#1B3A6B' }}>Browse products</Link>
      </div>
    );
  }

  const handleContinue = () => {
    if (selected === 'paypal') navigate('/paypal-mock', { state: { total: grandTotal } });
    else if (selected === 'googlepay') navigate('/google-pay', { state: { total: grandTotal } });
    else navigate('/card-payment', { state: { total: grandTotal } });
  };

  return (
    <div
      className="min-h-[60vh] flex flex-col items-center py-14 px-4"
      style={{
        background: 'linear-gradient(135deg, #0f1f3d 0%, #1B3A6B 40%, #2d5fa6 100%)',
      }}
    >
      <div className="w-full max-w-lg flex flex-col gap-6">

        {/* Header */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" fill="white" />
              <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" fill="white" />
              <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: '#fff' }}>Checkout</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Review your order and complete payment</p>
        </div>

        {/* Order summary */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.97)', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
        >
          {/* Card header accent */}
          <div className="px-6 pt-5 pb-4" style={{ background: 'linear-gradient(90deg, #1B3A6B 0%, #2d5fa6 100%)' }}>
            <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>Order Summary</h2>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img src={item.thumbnail} alt={item.title}
                    className="w-16 h-16 rounded-2xl object-cover"
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }} />
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                    style={{ background: '#1B3A6B', color: '#fff' }}
                  >{item.quantity}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: '#111827' }}>{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
                <span className="text-sm font-black" style={{ color: '#1B3A6B' }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <div className="rounded-2xl p-4 flex flex-col gap-2 mt-1" style={{ background: '#F8FAFF', border: '1px solid #E0E7FF' }}>
              {savings > 0 && (
                <div className="flex justify-between text-sm font-semibold" style={{ color: '#16A34A' }}>
                  <span className="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#16A34A" strokeWidth="2"/>
                      <path d="M8 14L10 16L16 10" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Savings
                  </span>
                  <span>-${savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-base font-black" style={{ color: '#111827' }}>Total</span>
                <span
                  className="text-xl font-black px-3 py-1 rounded-xl"
                  style={{ background: 'linear-gradient(90deg, #1B3A6B, #2d5fa6)', color: '#fff', letterSpacing: '-0.5px' }}
                >
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Address */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.97)', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
        >
          <div className="px-6 pt-5 pb-4 flex items-center gap-3"
            style={{ background: step === 'address' ? 'linear-gradient(90deg, #1B3A6B 0%, #2d5fa6 100%)' : 'linear-gradient(90deg, #16A34A, #15803d)' }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              {step === 'address' ? '1' : '✓'}
            </div>
            <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.85)' }}>Delivery Address</h2>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: '#F8FAFF', border: '1.5px dashed #C7D7F5' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EEF2FF' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#1B3A6B" strokeWidth="1.8"/>
                  <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="#1B3A6B" strokeWidth="1.8"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#111827' }}>Choose Address</p>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Select your delivery location</p>
              </div>
            </div>

            {step === 'address' && (
              <button
                onClick={() => setStep('payment')}
                className="w-full py-4 rounded-2xl font-black text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(90deg, #1B3A6B 0%, #2d5fa6 100%)',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(27,58,107,0.35)',
                }}
              >
                <span>Proceed to Payment</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M13 6L19 12L13 18" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Step 2: Payment */}
        {step === 'payment' && (
          <>
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.97)', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
            >
              <div className="px-6 pt-5 pb-4 flex items-center justify-between"
                style={{ background: 'linear-gradient(90deg, #1B3A6B 0%, #2d5fa6 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>2</div>
                  <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.85)' }}>Payment Method</h2>
                </div>
                <button
                  onClick={() => setStep('address')}
                  className="text-xs font-bold flex items-center gap-1"
                  style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ← Back
                </button>
              </div>

              <div className="px-6 py-5 flex flex-col gap-3">

                {/* Credit / Debit card */}
                <button
                  onClick={() => setSelected('card')}
                  className="w-full flex items-center gap-4 rounded-2xl px-4 py-4 text-left transition-all duration-150"
                  style={{
                    background: selected === 'card' ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' : '#F9FAFB',
                    border: selected === 'card' ? '2px solid #2563EB' : '2px solid transparent',
                    boxShadow: selected === 'card' ? '0 4px 16px rgba(37,99,235,0.15)' : 'none',
                  }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: selected === 'card' ? '#2563EB' : '#E5E7EB' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="1.8"/>
                      <path d="M2 10h20" stroke="white" strokeWidth="1.8"/>
                      <rect x="5" y="14" width="4" height="2" rx="0.5" fill="white"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{ color: selected === 'card' ? '#1E3A8A' : '#374151' }}>Credit / Debit Card</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Visa, Mastercard, Amex</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: '#1A1F71', color: '#fff', fontStyle: 'italic' }}>VISA</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: '#252525', color: '#fff' }}>MC</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-1"
                    style={{ borderColor: selected === 'card' ? '#2563EB' : '#D1D5DB' }}>
                    {selected === 'card' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#2563EB' }} />}
                  </div>
                </button>

                {/* PayPal */}
                <button
                  onClick={() => setSelected('paypal')}
                  className="w-full flex items-center gap-4 rounded-2xl px-4 py-4 text-left transition-all duration-150"
                  style={{
                    background: selected === 'paypal' ? 'linear-gradient(135deg, #FFF9EC, #FFF3CD)' : '#F9FAFB',
                    border: selected === 'paypal' ? '2px solid #FFC439' : '2px solid transparent',
                    boxShadow: selected === 'paypal' ? '0 4px 16px rgba(255,196,57,0.2)' : 'none',
                  }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: selected === 'paypal' ? '#003087' : '#E5E7EB' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill={selected === 'paypal' ? '#003087' : '#9CA3AF'}/>
                      <text x="12" y="16.5" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="9" fill="#fff">PP</text>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{ color: selected === 'paypal' ? '#003087' : '#374151' }}>PayPal</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Fast &amp; secure PayPal checkout</p>
                  </div>
                  <svg width="70" height="18" viewBox="0 0 70 18" className="shrink-0">
                    <text x="0" y="14" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#003087">Pay</text>
                    <text x="25" y="14" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="#009cde">Pal</text>
                  </svg>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-1"
                    style={{ borderColor: selected === 'paypal' ? '#FFC439' : '#D1D5DB' }}>
                    {selected === 'paypal' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFC439' }} />}
                  </div>
                </button>

                {/* Google Pay */}
                <button
                  onClick={() => setSelected('googlepay')}
                  className="w-full flex items-center gap-4 rounded-2xl px-4 py-4 text-left transition-all duration-150"
                  style={{
                    background: selected === 'googlepay' ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' : '#F9FAFB',
                    border: selected === 'googlepay' ? '2px solid #34A853' : '2px solid transparent',
                    boxShadow: selected === 'googlepay' ? '0 4px 16px rgba(52,168,83,0.15)' : 'none',
                  }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: selected === 'googlepay' ? '#202124' : '#E5E7EB' }}>
                    <svg width="22" height="14" viewBox="0 0 44 28">
                      <text x="0" y="20" fontFamily="Arial" fontWeight="700" fontSize="18" fill={selected === 'googlepay' ? '#4285F4' : '#9CA3AF'}>G</text>
                      <text x="16" y="20" fontFamily="Arial" fontWeight="700" fontSize="14" fill={selected === 'googlepay' ? '#fff' : '#9CA3AF'}>Pay</text>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{ color: '#374151' }}>Google Pay</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Fast checkout with Google</p>
                  </div>
                  <svg width="44" height="16" viewBox="0 0 44 16" className="shrink-0">
                    <text x="0" y="13" fontFamily="Arial" fontWeight="500" fontSize="11" fill="#4285F4">G</text>
                    <text x="9" y="13" fontFamily="Arial" fontWeight="500" fontSize="11" fill="#EA4335">o</text>
                    <text x="17" y="13" fontFamily="Arial" fontWeight="500" fontSize="11" fill="#FBBC05">o</text>
                    <text x="25" y="13" fontFamily="Arial" fontWeight="500" fontSize="11" fill="#4285F4">g</text>
                    <text x="32" y="13" fontFamily="Arial" fontWeight="500" fontSize="11" fill="#34A853">l</text>
                    <text x="36" y="13" fontFamily="Arial" fontWeight="500" fontSize="11" fill="#EA4335">e</text>
                  </svg>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-1"
                    style={{ borderColor: selected === 'googlepay' ? '#34A853' : '#D1D5DB' }}>
                    {selected === 'googlepay' && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#34A853' }} />}
                  </div>
                </button>
              </div>
            </div>

            {/* Continue button */}
            <button
              onClick={handleContinue}
              className="w-full py-4 rounded-2xl font-black text-base transition-all duration-200 hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
              style={
                selected === 'paypal'
                  ? { background: 'linear-gradient(90deg, #FFC439, #f0a800)', color: '#003087', border: 'none', boxShadow: '0 8px 24px rgba(255,196,57,0.4)' }
                  : selected === 'googlepay'
                  ? { background: 'linear-gradient(90deg, #202124, #3c4043)', color: '#fff', border: 'none', boxShadow: '0 8px 24px rgba(32,33,36,0.35)' }
                  : { background: 'linear-gradient(90deg, #1B3A6B, #2d5fa6)', color: '#fff', border: 'none', boxShadow: '0 8px 24px rgba(27,58,107,0.4)' }
              }
            >
              <span>
                {selected === 'paypal' ? 'Continue to PayPal' : selected === 'googlepay' ? 'Continue to Google Pay' : 'Complete Payment'}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8"/>
                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                All transactions are 256-bit SSL encrypted
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
