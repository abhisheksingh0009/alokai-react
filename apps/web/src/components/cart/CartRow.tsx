import { SfIconRemove, SfIconAdd, SfIconDelete } from '@storefront-ui/react';
import { Link } from 'react-router-dom';
import { type ChangeEvent } from 'react';
import { clamp } from '@storefront-ui/shared';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../middleware/api/client';

type Props = {
  item: Product & { quantity: number };
  index: number;
  inputId: string;
  min: number;
  max: number;
  onRemove: (index: number) => void;
};

export default function CartRow({ item, index, inputId, min, max, onRemove }: Props) {
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
      style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto', borderBottom: '1px solid #F3F4F6' }}
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

      {/* Price + Quantity + Total + Delete */}
      <div className="flex items-center justify-center sm:contents gap-6">
        <div className="text-sm font-semibold sm:text-center" style={{ color: '#374151' }}>
          ${currentItem.price.toFixed(2)}
        </div>

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

        <div className="flex flex-col items-center gap-1">
          <div className="font-extrabold text-sm sm:text-center" style={{ color: '#111827' }}>
            ${lineTotal}
          </div>
          {quantity >= max && (
            <span className="text-xs font-medium" style={{ color: '#F59E0B' }}>Max qty reached</span>
          )}
        </div>

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
