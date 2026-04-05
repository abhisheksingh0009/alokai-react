import { SfButton, SfIconRemove, SfLink, SfIconAdd, SfIconDelete } from '@storefront-ui/react';
import { Link } from 'react-router-dom';
import { useId, useState, type ChangeEvent } from 'react';
import PromoCode from '../components/PromoCode';
import YouMayAlsoLike from '../components/YouMayAlsoLike';
import { clamp } from '@storefront-ui/shared';
import { useCart } from '../context/CartContext';
import { type Product } from '../middleware/api/client';

export default function Cart() {
  const { cart, removeFromCart, addToCart } = useCart()!;
  const inputId = useId();
  const min = 1;
  const max = 10;
  const [discountRate, setDiscountRate] = useState(0);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = cart.reduce((sum, item) => sum + (item.discountPercentage ?? 0) / 100 * item.price * item.quantity, 0);
  const discount = total * discountRate;

  return (
    <div className="min-h-[60vh] flex flex-col">
      <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto text-left w-full flex-1">
        <h1 className="text-4xl mb-8 font-extrabold tracking-tight text-neutral-900">Your Cart</h1>

        {cart.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-7xl">🛒</span>
            <p className="text-2xl font-bold text-neutral-800">Your cart is empty</p>
            <p className="text-neutral-400">Looks like you haven't added anything yet.</p>
            <SfButton size="lg" className="mt-2" onClick={() => window.location.href = '/products'}>Start Shopping</SfButton>
          </div>
        )}

        {cart.length > 0 && (
          <div className="flex flex-col md:flex-row gap-8 md:items-start">
            {/* Left: Cart Items */}
            <div className="flex-1 min-w-0">
              {cart.map((item, index) => (
                <CartItem
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

            {/* Right: Order Summary */}
            <div className="w-full md:w-72 shrink-0 md:sticky md:top-6 flex flex-col gap-3">
              <div className="border border-neutral-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                <h2 className="text-xl font-bold text-neutral-900">Order Summary</h2>
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Subtotal ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>You save</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <PromoCode onApply={(rate) => setDiscountRate(rate)} />
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Promo discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-lg border-t border-neutral-200 pt-4 text-neutral-900">
                  <span>Grand Total</span>
                  <span>${(total - discount).toFixed(2)}</span>
                </div>
                <SfButton size="lg" className="w-full">Go to Checkout</SfButton>
              </div>
              {/* Trust badges */}
              <div className="flex justify-around text-xs text-neutral-400 py-3">
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

function CartItem({
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

  const quantity = item.quantity;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = clamp(parseFloat(e.target.value), min, max);
    const diff = next - quantity;
    if (diff !== 0) addToCart(item, diff);
  }

  function inc() {
    if (quantity < max) addToCart(item, 1);
  }

  function dec() {
    if (quantity > min) addToCart(item, -1);
  }

  // keep cart in sync — find current quantity from cart
  const currentItem = cart[index];

  return (
    <div className="group flex gap-4 p-4 mb-3 rounded-2xl bg-gradient-to-r from-white to-neutral-50 border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all duration-200">
      {/* Image */}
      <Link to={`/product/${currentItem.id}`} className="shrink-0">
        <img
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-200"
          src={currentItem.thumbnail}
          alt={currentItem.title}
          width="128"
          height="128"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        {/* Top row: title + remove */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <Link to={`/product/${currentItem.id}`} className="no-underline font-bold text-sm sm:text-base text-neutral-900 leading-snug hover:text-primary-700 transition-colors">
              {currentItem.title}
            </Link>
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">In Stock</span>
          </div>
          <button
            aria-label="Remove"
            type="button"
            className="shrink-0 text-neutral-300 hover:text-red-500 transition-colors p-1.5 rounded-xl hover:bg-red-50"
            onClick={() => onRemove(index)}
          >
            <SfIconDelete />
          </button>
        </div>

        {/* Bottom row: stepper + price */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center bg-white border border-neutral-200 rounded-full shadow-sm">
            <SfButton
              variant="tertiary"
              square
              className="rounded-r-none !text-neutral-500 hover:!text-neutral-900"
              disabled={currentItem.quantity <= min}
              aria-controls={inputId}
              aria-label="Decrease value"
              onClick={dec}
            >
              <SfIconRemove />
            </SfButton>
            <input
              id={inputId}
              type="number"
              className="appearance-none w-8 text-center bg-transparent font-bold text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] focus-visible:outline-none"
              min={min}
              max={max}
              value={currentItem.quantity}
              onChange={handleChange}
            />
            <SfButton
              variant="tertiary"
              square
              className="rounded-l-none !text-neutral-500 hover:!text-neutral-900"
              disabled={currentItem.quantity >= max}
              aria-controls={inputId}
              aria-label="Increase value"
              onClick={inc}
            >
              <SfIconAdd />
            </SfButton>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-extrabold text-base sm:text-lg text-neutral-900">
              ${(currentItem.price * currentItem.quantity).toFixed(2)}
            </span>
            {currentItem.quantity > 1 && (
              <span className="text-xs text-neutral-400">${currentItem.price.toFixed(2)} each</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
