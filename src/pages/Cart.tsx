import { SfIconRemove, SfIconAdd, SfIconDelete } from '@storefront-ui/react';
import { Link } from 'react-router-dom';
import { useId, useState, type ChangeEvent } from 'react';
import YouMayAlsoLike from '../components/YouMayAlsoLike';
import PromoCode from '../components/PromoCode';
import { clamp } from '@storefront-ui/shared';
import { useCart } from '../context/CartContext';
import { type Product } from '../middleware/api/client';

export default function Cart() {
  const { cart, removeFromCart, addToCart } = useCart()!;
  const inputId = useId();
  const min = 1;
  const max = 10;
  const [discountRate, setDiscountRate] = useState(0);

  function handleApplyPromo(rate: number, code: string) {
    setDiscountRate(rate);
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = cart.reduce((sum, item) => sum + (item.discountPercentage ?? 0) / 100 * item.price * item.quantity, 0);
  const discount = subtotal * discountRate;
  const grandTotal = subtotal - discount;

  return (
    <div className="min-h-[60vh] flex flex-col" style={{ background: '#F9FAFB' }}>
      <div className="px-4 sm:px-8 py-10 max-w-7xl mx-auto w-full flex-1">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8" style={{ color: '#111827' }}>Your Cart</h1>

        {cart.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
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

        {cart.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8 items-stretch lg:items-start">

            {/* Left: Cart Table */}
            <div className="flex-1 min-w-0">
              <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>

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

                {/* Cart rows */}
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

              {/* Promo code — below the cart table */}
              <div
                className="mt-4 rounded-2xl px-6 py-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
                style={{ background: '#fff', border: '1px solid #E5E7EB' }}
              >
                <PromoCode onApply={handleApplyPromo} />
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6 flex flex-col gap-3">
              <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
                <h2 className="text-lg font-extrabold" style={{ color: '#111827' }}>Order Summary</h2>

                <div className="flex justify-between text-sm" style={{ color: '#6B7280' }}>
                  <span>Subtotal ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                  <span style={{ color: '#111827', fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-sm font-medium" style={{ color: '#16A34A' }}>
                    <span>Product savings</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm" style={{ color: '#6B7280' }}>
                  <span>Shipping</span>
                  <span className="font-semibold" style={{ color: '#16A34A' }}>Free</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm font-medium" style={{ color: '#16A34A' }}>
                    <span>Promo discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div
                  className="flex justify-between font-extrabold text-lg pt-4"
                  style={{ borderTop: '1px solid #E5E7EB', color: '#111827' }}
                >
                  <span>Grand Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>

                <button
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
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
                  Go to Checkout
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex justify-around text-xs py-3" style={{ color: '#9CA3AF' }}>
                <span className="flex flex-col items-center gap-1"><span className="text-xl">🔒</span>Secure</span>
                <span className="flex flex-col items-center gap-1"><span className="text-xl">🚚</span>Free shipping</span>
                <span className="flex flex-col items-center gap-1"><span className="text-xl">↩️</span>Easy returns</span>
              </div>
            </div>
          </div>
        )}

        {cart.length > 0 && <YouMayAlsoLike />}
      </div>
    </div>
  );
}

function CartRow({
  item,
  index,
  inputId,
  min,
  max,
  onRemove,
}: {
  item: Product & { quantity: number };
  index: number;
  inputId: string;
  min: number;
  max: number;
  onRemove: (index: number) => void;
}) {
  const { cart, addToCart } = useCart()!;
  const currentItem = cart[index];
  const quantity = currentItem?.quantity ?? item.quantity;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = clamp(parseFloat(e.target.value), min, max);
    const diff = next - quantity;
    if (diff !== 0) addToCart(item, diff);
  }

  function inc() { if (quantity < max) addToCart(item, 1); }
  function dec() { if (quantity > min) addToCart(item, -1); }

  if (!currentItem) return null;

  const lineTotal = (currentItem.price * quantity).toFixed(2);

  return (
    <div
      className="sm:grid px-4 sm:px-6 py-5 sm:items-center gap-4 flex flex-col"
      style={{
        gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto',
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      {/* Product */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Link to={`/product/${currentItem.id}`} className="shrink-0">
          <img
            className="w-20 h-20 rounded-xl object-cover"
            src={currentItem.thumbnail}
            alt={currentItem.title}
            width="80"
            height="80"
            style={{ border: '1px solid #E5E7EB' }}
          />
        </Link>
        <div className="flex flex-col gap-1 min-w-0 items-start">
          <Link
            to={`/product/${currentItem.id}`}
            className="font-semibold text-sm leading-snug hover:underline text-left w-full"
            style={{ color: '#111827' }}
          >
            {currentItem.title}
          </Link>
          {currentItem.discountPercentage && currentItem.discountPercentage > 0 && (
            <span className="text-xs font-semibold" style={{ color: '#16A34A' }}>
              {Math.round(currentItem.discountPercentage)}% off
            </span>
          )}
        </div>
      </div>

      {/* Price + Quantity + Total + Delete — row on mobile, grid cells on desktop */}
      <div className="flex items-center justify-center sm:contents gap-6">
        {/* Price */}
        <div className="text-sm font-semibold sm:text-center" style={{ color: '#374151' }}>
          ${currentItem.price.toFixed(2)}
        </div>

        {/* Quantity stepper */}
        <div className="flex items-center justify-center">
          <div className="flex items-center rounded-full" style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB' }}>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-l-full transition-colors hover:bg-gray-100 disabled:opacity-40"
              disabled={quantity <= min}
              aria-label="Decrease"
              onClick={dec}
            >
              <SfIconRemove className="text-xs" />
            </button>
            <input
              id={inputId}
              type="number"
              className="w-9 text-center bg-transparent font-bold text-sm focus-visible:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
              min={min}
              max={max}
              value={quantity}
              onChange={handleChange}
              style={{ color: '#111827' }}
            />
            <button
              className="w-8 h-8 flex items-center justify-center rounded-r-full transition-colors hover:bg-gray-100 disabled:opacity-40"
              disabled={quantity >= max}
              aria-label="Increase"
              onClick={inc}
            >
              <SfIconAdd className="text-xs" />
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="font-extrabold text-sm sm:text-center" style={{ color: '#111827' }}>
          ${lineTotal}
        </div>

        {/* Delete */}
        <div className="flex justify-center">
          <button
            aria-label="Remove"
            className="p-2 rounded-lg transition-colors hover:bg-red-50"
            style={{ color: '#D1D5DB' }}
            onClick={() => onRemove(index)}
            onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
            onMouseLeave={e => (e.currentTarget.style.color = '#D1D5DB')}
          >
            <SfIconDelete />
          </button>
        </div>
      </div>
    </div>
  );
}
