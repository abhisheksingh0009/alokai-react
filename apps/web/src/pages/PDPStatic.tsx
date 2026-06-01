import type { Product } from "../middleware/api/client";
import ProductJsonLd from "../components/common/ProductJsonLd";

type Props = { product: Product };

export default function PDPStatic({ product }: Props) {
  const discount = product.discountPercentage ?? 0;
  const originalPrice = discount >= 1 ? product.price / (1 - discount / 100) : null;
  const isSale = discount >= 5;
  const images = product.images?.length ? product.images : [product.thumbnail];

  return (
    <div className="min-h-screen" style={{ background: '#F4F6F9' }}>
      <ProductJsonLd product={product} />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-[48%] shrink-0">
            <div
              className="relative rounded-2xl overflow-hidden flex items-center justify-center"
              style={{ background: '#fff', border: '1px solid #E2E8F0', aspectRatio: '1/1' }}
            >
              <img
                src={images[0]}
                alt={product.title}
                className="object-contain w-full h-full p-6"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
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
            </div>

            <h1 className="text-3xl font-bold leading-tight" style={{ color: '#111827' }}>
              {product.title}
            </h1>

            <p className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>
              {product.description}
            </p>

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
                  Sale {Math.round(discount)}% Off
                </span>
              )}
            </div>

            <p className="text-sm" style={{ color: product.stock === 0 ? '#DC2626' : '#16A34A' }}>
              {product.stock === 0 ? 'Out of Stock' : `In Stock${product.stock ? ` (${product.stock})` : ''}`}
            </p>

            <noscript>
              <p className="text-xs italic mt-4" style={{ color: '#6B7280' }}>
                Enable JavaScript for the full interactive experience.
              </p>
            </noscript>
          </div>
        </div>
      </div>
    </div>
  );
}
