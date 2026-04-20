import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import { fetchProductsFromDB, type Product } from '../middleware/api/client';
import Carousel from '../components/Carousel/Carousel';
import BannerOverlay from '../components/Carousel/BannerOverlay';
import Banner2Col from '../components/Carousel/Banner2col';
import Loader from '../components/common/Loader';
// import heroImg from '../assets/hero.png';

const categories = [
  { label: 'Women', emoji: '👗' },
  { label: 'Men', emoji: '👔' },
  { label: 'Kids', emoji: '🧸' },
  { label: 'Electronics', emoji: '📱' },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductsFromDB()
      .then(({ products }) => setFeatured(products.slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5" style={{ background: '#F4F6F9' }}>
        <Loader size="3xl" className="text-primary-700" />
        <p className="text-base font-semibold tracking-wide" style={{ color: '#1B3A6B' }}>Loading…</p>
      </div>
    );
  }

  return (
    <div>
      {/*Carousel*/}
      <section className="relative  flex items-center justify-center max-w-6xl mx-auto px-4 pb-12">
        <Carousel />
      </section>
      {/* Hero */}
      {/* <section className="relative h-[420px] flex items-center justify-center overflow-hidden bg-slate-900">
        <img src={heroImg} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to My Store</h1>
          <p className="text-lg mb-6 text-slate-300">Discover the latest trends at unbeatable prices</p>
          <Link to="/products">
            <SfButton size="lg" className="bg-emerald-500 !text-white hover:bg-emerald-600 font-semibold">
              Shop Now
            </SfButton>
          </Link>
        </div>
      </section> */}

      {/* Categories */}
      {/* <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.label}
              to="/products"
              className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-neutral-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all"
            >
              <span className="text-4xl">{cat.emoji}</span>
              <span className="font-semibold text-neutral-800">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section> */}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-emerald-600 text-emerald-600 text-sm font-semibold hover:bg-emerald-600 hover:text-white transition-all duration-200"
            >
              Explore All Products
              <span className="text-base leading-none">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((product, index) => (
              <div key={product.id} className={index >= 2 ? 'hidden md:block' : ''}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/*single banner*/}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <BannerOverlay />
      </section>
      {/*single banner*/}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <Banner2Col />
      </section>
    </div>
  );
}