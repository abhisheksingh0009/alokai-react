import React from "react";
import { SfRating, SfLink, SfIconFavorite } from "@storefront-ui/react";
import type { Product } from "../../middleware/api/client";
import AddToCartButton from "../common/AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  const rating = product.rating ?? 0;
  const reviewCount = product.stock ?? 0;
  const discount = product.discountPercentage ?? 0;
  const originalPrice = discount >= 1 ? product.price / (1 - discount / 100) : null;
  const isSale = discount >= 5;

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
      style={{ border: '1px solid #E2E8F0' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ background: '#F8F9FB' }}>
        <SfLink href={`/product/${product.id}`} className="block">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="object-cover w-full aspect-square transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </SfLink>

        {isSale && (
          <div
            className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full text-white tracking-wide"
            style={{ background: '#EA580C' }}
          >
            {Math.round(discount)}% Off
          </div>
        )}

        <button
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          style={{ border: '1px solid #E2E8F0' }}
          aria-label="Add to wishlist"
        >
          <SfIconFavorite size="sm" className="text-[#1B3A6B]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category label */}
        {product.category && (
          <span
            className="text-xs font-bold uppercase tracking-widest mb-1.5"
            style={{ color: '#2563EB' }}
          >
            {product.category.replace(/-/g, ' ')}
          </span>
        )}

        {/* Title */}
        <SfLink
          href={`/product/${product.id}`}
          variant="secondary"
          className="no-underline font-semibold text-sm leading-snug mb-2"
          style={{
            color: '#111827',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          } as React.CSSProperties}
        >
          {product.title}
        </SfLink>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <SfRating size="xs" value={rating} max={5} />
          <span className="text-xs" style={{ color: '#6B7280' }}>
            {rating > 0 ? `${rating.toFixed(1)} (${reviewCount})` : 'No reviews'}
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-center gap-2 flex-wrap mt-auto mb-3">
          <span className="text-xl font-bold" style={{ color: '#111827' }}>
            ${product.price.toFixed(2)}
          </span>
          {originalPrice && (
            <>
              <span className="text-sm line-through" style={{ color: '#9CA3AF' }}>
                ${originalPrice.toFixed(2)}
              </span>
              <span className="text-xs font-semibold" style={{ color: '#16A34A' }}>
                {Math.round(discount)}% off
              </span>
            </>
          )}
        </div>

        {/* CTA */}
        <AddToCartButton product={product} className="w-full py-2.5" />
      </div>
    </div>
  );
}
