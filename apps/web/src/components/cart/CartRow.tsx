import { SfIconDelete } from '@storefront-ui/react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import QuantitySelector from '../common/QuantitySelector';
import type { Product } from '../../middleware/api/client';

type Props = {
  item: Product & { quantity: number };
  index: number;
  min: number;
  max: number;
  onRemove: (productId: number) => void;
};

export default function CartRow({ item, index, min, max, onRemove }: Props) {
  const { cart, addToCart } = useCart()!;
  const currentItem = cart[index];
  const quantity = currentItem?.quantity ?? item.quantity;

  function handleQuantityChange(next: number) {
    const diff = next - quantity;
    if (diff !== 0) addToCart(item, diff);
  }

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
          <QuantitySelector
            value={quantity}
            onChange={handleQuantityChange}
            min={min}
            max={max}
          />
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
            onClick={() => onRemove(item.id)}
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
