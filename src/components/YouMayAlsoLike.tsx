import { SfButton } from '@storefront-ui/react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { fetchProducts, type Product } from '../middleware/api/client';

export default function YouMayAlsoLike() {
  const { cart, addToCart } = useCart()!;
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts(8).then(products => {
      const cartIds = new Set(cart.map(i => i.id));
      setSuggestions(products.filter(p => !cartIds.has(p.id)).slice(0, 4));
    });
  }, [cart]);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-neutral-900 mb-4">You may also like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {suggestions.map(product => (
          <div key={product.id} className="rounded-2xl border border-neutral-100 bg-white hover:shadow-md transition-shadow flex flex-col overflow-hidden">
            <Link to={`/product/${product.id}`}>
              <img src={product.thumbnail} alt={product.title} className="w-full h-36 object-cover" />
            </Link>
            <div className="p-3 flex flex-col gap-2 flex-1">
              <Link to={`/product/${product.id}`} className="text-sm font-medium text-neutral-800 leading-snug hover:underline line-clamp-2 no-underline">
                {product.title}
              </Link>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-bold text-neutral-900">${product.price}</span>
                <SfButton size="sm" variant="secondary" onClick={() => addToCart(product)}>+ Add</SfButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
