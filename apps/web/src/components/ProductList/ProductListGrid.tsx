import ProductCard from '../ProductCard/ProductCard';
import { type Product } from '../../middleware/api/client';

interface Props {
  products: Product[];
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function ProductListGrid({ products, hasFilters, onClearFilters }: Props) {
  if (products.length === 0) {
    return (
      <div
        className="text-center py-24 rounded-2xl bg-white"
        style={{ color: '#6B7280', border: '1px solid #E2E8F0' }}
      >
        <p className="text-lg font-medium mb-2" style={{ color: '#374151' }}>No products found</p>
        <p className="text-sm">Try adjusting or clearing your filters.</p>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#1B3A6B' }}
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
