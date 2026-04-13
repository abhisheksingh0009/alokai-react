import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { fetchProductsByCategory, type Product } from '../middleware/api/client';
import ProductCard from './ProductCard/ProductCard';

interface Props {
  category?: string;
  excludeId?: number;
}

export default function YouMayAlsoLike({ category, excludeId }: Props = {}) {
  const { cart } = useCart()!;
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    if (category) {
      fetchProductsByCategory(category).then(products => {
        const others = products.filter(p => p.id !== excludeId);
        const shuffled = others.sort(() => Math.random() - 0.5);
        setSuggestions(shuffled.slice(0, 10));
      });
      return;
    }

    const cartIds = new Set(cart.map(i => i.id));
    const categories = [...new Set(cart.map(i => i.category).filter(Boolean))] as string[];

    if (categories.length === 0) {
      setSuggestions([]);
      return;
    }

    Promise.all(categories.map(cat => fetchProductsByCategory(cat)))
      .then(results => {
        const picked = results.flatMap(products =>
          products.filter(p => !cartIds.has(p.id)).slice(0, 5)
        );
        setSuggestions(picked);
      });
  }, [category, excludeId, cart]);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-neutral-900 whitespace-nowrap">
          {category ? `More from ${category.replace(/-/g, ' ')}` : 'You may also like'}
        </h2>
        <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {suggestions.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
