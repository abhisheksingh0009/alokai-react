import { SfIconRemove, SfIconAdd, SfIconDelete } from '@storefront-ui/react';
import { Link } from 'react-router-dom';
import { useId, useState, type ChangeEvent } from 'react';
import YouMayAlsoLike from '../components/YouMayAlsoLike';
import CartSummary from '../components/CartSummary';
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
        {/* Title row */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#111827' }}>
            Your Cart {cart.length > 0 && <span className="text-xl font-semibold" style={{ color: '#6B7280' }}>({cart.length})</span>}
          </h1>
          {cart.length > 0 && (
            <Link to="/products" className="text-sm font-medium hover:underline flex items-center gap-1" style={{ color: '#1B3A6B' }}>
              ← Continue Shopping
            </Link>
          )}
        </div>

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

            </div>

            {/* Right: Order Summary */}
            <CartSummary
              cartLength={cart.length}
              subtotal={subtotal}
              savings={savings}
              discount={discount}
              grandTotal={grandTotal}
              onApplyPromo={handleApplyPromo}
            />
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

        {/* Total + max qty warning */}
        <div className="flex flex-col items-center gap-1">
          <div className="font-extrabold text-sm sm:text-center" style={{ color: '#111827' }}>
            ${lineTotal}
          </div>
          {quantity >= max && (
            <span className="text-xs font-medium" style={{ color: '#F59E0B' }}>Max qty reached</span>
          )}
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
