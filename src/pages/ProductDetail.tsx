import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAsync } from "react-use";
import { SfRating, SfIconFavorite, SfIconPackage, SfIconSafetyCheck, SfIconShoppingCartCheckout } from "@storefront-ui/react";
import AddToCartButton from "../components/common/AddToCartButton";
import Breadcrumb from "../components/common/Breadcrumb";
import { fetchProduct } from "../middleware/api/client";

export default function PDP() {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);

  const { loading, error, value: product } = useAsync(
    () => fetchProduct(id!),
    [id]
  );

  // ── Skeleton
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#F4F6F9' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-10 animate-pulse">
            <div className="w-full lg:w-1/2">
              <div className="rounded-2xl aspect-square" style={{ background: '#E2E8F0' }} />
              <div className="flex gap-3 mt-4">
                {[1,2,3,4].map(i => <div key={i} className="w-16 h-16 rounded-xl" style={{ background: '#E2E8F0' }} />)}
              </div>
            </div>
            <div className="flex-1 space-y-4 pt-4">
              <div className="h-4 w-24 rounded" style={{ background: '#E2E8F0' }} />
              <div className="h-9 w-3/4 rounded-lg" style={{ background: '#E2E8F0' }} />
              <div className="h-6 w-32 rounded" style={{ background: '#E2E8F0' }} />
              <div className="h-4 w-full rounded" style={{ background: '#E2E8F0' }} />
              <div className="h-4 w-5/6 rounded" style={{ background: '#E2E8F0' }} />
              <div className="h-12 w-full rounded-xl mt-6" style={{ background: '#E2E8F0' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F6F9' }}>
        <div className="text-center">
          <p className="text-lg font-medium mb-3" style={{ color: '#374151' }}>Failed to load product.</p>
          <Link to="/products" className="text-sm font-semibold underline" style={{ color: '#1B3A6B' }}>
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discount = product.discountPercentage ?? 0;
  const originalPrice = discount >= 1 ? product.price / (1 - discount / 100) : null;
  const isSale = discount >= 5;
  const rating = product.rating ?? 0;
  const reviewCount = product.stock ?? 0;
  const images = product.images?.length ? product.images : [product.thumbnail];

  return (
    <div className="min-h-screen" style={{ background: '#F4F6F9' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="mb-10">
          <Breadcrumb
            items={[
              { name: 'Home', link: '/' },
              { name: 'Products', link: '/products' },
              ...(product.category
                ? [{ name: product.category.replace(/-/g, ' ') }]
                : []),
              { name: product.title },
            ]}
          />
        </div>

        {/* ── Main layout ── */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Left: Image gallery ── */}
          <div className="w-full lg:w-[48%] shrink-0">
            {/* Main image */}
            <div
              className="rounded-2xl overflow-hidden flex items-center justify-center"
              style={{ background: '#fff', border: '1px solid #E2E8F0', aspectRatio: '1/1' }}
            >
              <img
                src={images[activeImage]}
                alt={product.title}
                className="object-contain w-full h-full p-6 transition-opacity duration-300"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 flex-wrap">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-150 shrink-0"
                    style={{
                      background: '#fff',
                      border: activeImage === idx ? '2px solid #1B3A6B' : '1.5px solid #E2E8F0',
                      padding: '4px',
                    }}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="object-contain w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product info ── */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Category + brand + sale pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.category && (
                <span
                  className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: '#EFF6FF', color: '#2563EB' }}
                >
                  {product.category.replace(/-/g, ' ')}
                </span>
              )}
              {product.brand && (
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: '#F1F5F9', color: '#475569' }}
                >
                  {product.brand}
                </span>
              )}
              {isSale && (
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{ background: '#EA580C' }}
                >
                  {Math.round(discount)}% Off
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold leading-tight" style={{ color: '#111827' }}>
              {product.title}
            </h1>

            {/* Description */}
            <p className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>
              {product.description}
            </p>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {product.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full capitalize"
                    style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div style={{ borderTop: '1px solid #E2E8F0' }} />

            {/* Rating */}
            <div className="flex items-center gap-2">
              <SfRating size="sm" value={rating} max={5} />
              <span className="text-sm font-medium" style={{ color: '#374151' }}>
                {rating > 0 ? rating.toFixed(1) : '—'}
              </span>
              {reviewCount > 0 && (
                <span className="text-sm" style={{ color: '#6B7280' }}>
                  ({reviewCount} reviews)
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-bold" style={{ color: '#111827' }}>
                ${product.price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-xl line-through" style={{ color: '#9CA3AF' }}>
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              {isSale && (
                <span
                  className="text-sm font-bold px-2.5 py-1 rounded-lg"
                  style={{ background: '#DCFCE7', color: '#16A34A' }}
                >
                  You save ${(originalPrice! - product.price).toFixed(2)}
                </span>
              )}
              {product.stock && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: product.stock < 10 ? '#FFF7ED' : '#F0FDF4',
                    color: product.stock < 10 ? '#EA580C' : '#16A34A',
                    border: `1px solid ${product.stock < 10 ? '#FDBA74' : '#86EFAC'}`,
                  }}
                >
                  {product.stock < 10 ? `Only ${product.stock} left` : '✓ In stock'}
                </span>
              )}
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0' }} />

            {/* CTA buttons */}
            <div className="flex gap-3">
              <AddToCartButton product={product} variant="filled" label="Add to Cart" className="flex-1" />
              <button
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 shrink-0"
                style={{ border: '1.5px solid #E2E8F0', background: '#fff', color: '#1B3A6B' }}
                aria-label="Add to wishlist"
              >
                <SfIconFavorite size="sm" />
              </button>
            </div>

            {/* Trust badges */}
            <div
              className="grid grid-cols-3 gap-3 rounded-2xl p-4 mt-1"
              style={{ background: '#fff', border: '1px solid #E2E8F0' }}
            >
              {[
                { icon: <SfIconPackage size="sm" />, label: product.shippingInformation ?? 'Free Shipping' },
                { icon: <SfIconSafetyCheck size="sm" />, label: product.returnPolicy ?? 'Easy Returns' },
                { icon: <SfIconShoppingCartCheckout size="sm" />, label: product.warrantyInformation ?? 'Secure Payment' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <span style={{ color: '#1B3A6B' }}>{icon}</span>
                  <span className="text-xs leading-tight" style={{ color: '#475569' }}>{label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
