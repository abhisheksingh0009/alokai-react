import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SfButton } from '@storefront-ui/react';
import ProductCard from '../components/ProductCard/ProductCard';
import { fetchProducts, type Product } from '../middleware/api/client';
import heroImg from '../assets/hero.png';

const categories = [
  { label: 'Women', emoji: '👗' },
  { label: 'Men', emoji: '👔' },
  { label: 'Kids', emoji: '🧸' },
  { label: 'Electronics', emoji: '📱' },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(data => setFeatured(data.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[420px] flex items-center justify-center overflow-hidden bg-green-800">
        <img src={heroImg} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to My Store</h1>
          <p className="text-lg mb-6 text-green-100">Discover the latest trends at unbeatable prices</p>
          <Link to="/products">
            <SfButton size="lg" className="bg-white !text-green-700 hover:bg-green-50 font-semibold">
              Shop Now
            </SfButton>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.label}
              to="/products"
              className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-neutral-200 rounded-xl hover:border-green-600 hover:shadow-md transition-all"
            >
              <span className="text-4xl">{cat.emoji}</span>
              <span className="font-semibold text-neutral-800">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-green-700 font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
