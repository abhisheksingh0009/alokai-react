import { Link } from 'react-router-dom';
import { useId, useState } from 'react';
import { useCart } from '../../context/CartContext';
import YouMayAlsoLike from '../YouMayAlsoLike';
import CartSummary from './CartSummary';
import CartRow from './CartRow';

export default function Cart() {
  const { cart, removeFromCart } = useCart()!;
  const inputId = useId();
  const min = 1;
  const max = 10;
  const [discountRate, setDiscountRate] = useState(0);


  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = cart.reduce((sum, item) => sum + (item.discountPercentage ?? 0) / 100 * item.price * item.quantity, 0);
  const discount = subtotal * discountRate;
  const grandTotal = subtotal - discount;

  return (
    <div className="min-h-[60vh] flex flex-col" style={{ background: '#F9FAFB' }}>
      <div className="px-4 sm:px-8 py-10 max-w-7xl mx-auto w-full flex-1">

        {/* Title row */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#111827' }}>
            Your Cart {cart.length > 0 && <span className="text-xl font-semibold" style={{ color: '#6B7280' }}>({cart.length})</span>}
          </h1>
          {cart.length > 0 && (
            <Link
              to="/products"
              className="group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 hover:shadow-md"
              style={{ color: '#1B3A6B', borderColor: '#1B3A6B', background: 'transparent' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#1B3A6B';
                (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                (e.currentTarget as HTMLAnchorElement).style.color = '#1B3A6B';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:-translate-x-0.5">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Continue Shopping
            </Link>
          )}
        </div>

        {/* Empty state */}
        {cart.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <span className="text-7xl">🛒</span>
            <p className="text-2xl font-bold" style={{ color: '#111827' }}>Your cart is empty</p>
            <p style={{ color: '#6B7280' }}>Looks like you haven't added anything yet.</p>
            <Link to="/products">
              <button
                className="mt-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                style={{ border: '1.5px solid #1B3A6B', color: '#1B3A6B', background: 'transparent' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#1B3A6B';
                  (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#1B3A6B';
                }}
              >
                Start Shopping
              </button>
            </Link>
          </div>
        )}
        {cart.length === 0 && <YouMayAlsoLike />}

        {/* Cart content */}
        {cart.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Left: Cart products + You May Also Like */}
            <div className="flex-1 min-w-0 overflow-hidden flex flex-col gap-6">
              <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>

                {/* Table header — desktop only */}
                <div
                  className="hidden sm:grid px-6 py-4 text-xs font-bold uppercase tracking-widest"
                  style={{
                    gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto',
                    borderBottom: '1px solid #E5E7EB',
                    color: '#6B7280',
                    background: '#F9FAFB',
                  }}
                >
                  <span className="flex items-center gap-4"><span className="w-20 shrink-0" />Product</span>
                  <span>Price</span>
                  <span>Quantity</span>
                  <span>Total</span>
                  <span className="w-8" />
                </div>

                {cart.map((item, index) => (
                  <CartRow
                    key={`${item.id}-${index}`}
                    item={item}
                    index={index}
                    inputId={`${inputId}-${index}`}
                    min={min}
                    max={max}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              {/* You May Also Like — inside left column */}
              <YouMayAlsoLike />
            </div>

            {/* Right: Order Summary */}
            <CartSummary
              cartLength={cart.length}
              subtotal={subtotal}
              savings={savings}
              discount={discount}
              grandTotal={grandTotal}
              onApplyPromo={(rate) => setDiscountRate(rate)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
