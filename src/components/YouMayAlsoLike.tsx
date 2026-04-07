import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SfRating } from '@storefront-ui/react';
import { useCart } from '../context/CartContext';
import { fetchProductsByCategory, type Product } from '../middleware/api/client';
import AddToCartButton from './AddToCartButton';

export default function YouMayAlsoLike() {
  const { cart } = useCart()!;
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    const cartIds = new Set(cart.map(i => i.id));
    const categories = [...new Set(cart.map(i => i.category).filter(Boolean))] as string[];

    if (categories.length === 0) {
      setSuggestions([]);
      return;
    }

    Promise.all(categories.map(cat => fetchProductsByCategory(cat)))
      .then(results => {
        const perCategory = 2;
        const picked = results.flatMap(products =>
          products.filter(p => !cartIds.has(p.id)).slice(0, perCategory)
        );
        setSuggestions(picked);
      });
  }, [cart]);

  if (suggestions.length === 0) return null;


  return (
    <div className="mt-14">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-bold text-neutral-900">You may also like</h2>
        <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {suggestions.map(product => {
          const discount = product.discountPercentage ?? 0;
          const isSale = discount >= 5;
          const originalPrice = isSale ? product.price / (1 - discount / 100) : null;
          const rating = product.rating ?? 0;

          return (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              style={{ border: '1px solid #E2E8F0' }}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ background: '#F8F9FB' }}>
                <Link to={`/product/${product.id}`} className="block">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="object-cover w-full aspect-square transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </Link>
                {isSale && (
                  <div
                    className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full text-white tracking-wide"
                    style={{ background: '#EA580C' }}
                  >
                    {Math.round(discount)}% Off
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-4">
                {product.category && (
                  <span
                    className="text-xs font-bold uppercase tracking-widest mb-1.5"
                    style={{ color: '#2563EB' }}
                  >
                    {product.category.replace(/-/g, ' ')}
                  </span>
                )}

                <Link
                  to={`/product/${product.id}`}
                  className="no-underline font-semibold text-sm leading-snug mb-2 line-clamp-2"
                  style={{ color: '#111827' }}
                >
                  {product.title}
                </Link>

                <div className="flex items-center gap-1.5 mb-3">
                  <SfRating size="xs" value={rating} max={5} />
                  <span className="text-xs" style={{ color: '#6B7280' }}>
                    {rating > 0 ? rating.toFixed(1) : 'No reviews'}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-auto mb-3">
                  <span className="text-base font-bold" style={{ color: '#111827' }}>
                    ${product.price.toFixed(2)}
                  </span>
                  {originalPrice && (
                    <>
                      <span className="text-xs line-through" style={{ color: '#9CA3AF' }}>
                        ${originalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: '#16A34A' }}>
                        {Math.round(discount)}% off
                      </span>
                    </>
                  )}
                </div>

                <AddToCartButton product={product} className="w-full py-2" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
