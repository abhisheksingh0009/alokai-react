import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { fetchProductsByCategory, type Product } from '../middleware/api/client';
import ProductCard from './ProductCard/ProductCard';

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
        const picked = results.flatMap(products =>
          products.filter(p => !cartIds.has(p.id)).slice(0, 2)
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
        {suggestions.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
