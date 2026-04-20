import React, { useState } from "react";
import { SfRating, SfLink} from "@storefront-ui/react";
import type { Product } from "../../middleware/api/client";
import AddToCartButton from "../common/AddToCartButton";
import WishlistButton from "../common/WishlistButton";
import NotifyMeModal from "../common/NotifyMeModal";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { cart } = useCart()!;
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const cartQty = cart.find(i => i.id === product.id)?.quantity ?? 0;
  const atMax = cartQty >= 10;
  const reviewCount = product.reviewCount ?? 0;
  const avgRating = product.avgReviewRating ?? 0;
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
            style={product.stock === 0 ? { opacity: 0.45 } : undefined}
            loading="lazy"
          />
        </SfLink>

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Diagonal strike line */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom right, transparent calc(50% - 1px), #DC2626 calc(50% - 1px), #DC2626 calc(50% + 1px), transparent calc(50% + 1px))',
              }}
            />
            <span
              className="relative z-10 text-base font-extrabold px-3 py-1 rounded-lg tracking-wide"
              style={{
                color: '#DC2626',
                background: 'rgba(255,255,255,0.85)',
                border: '1.5px solid #DC2626',
              }}
            >
              Out of Stock
            </span>
          </div>
        )}

        {isSale && product.stock !== 0 && (
          <div
            className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full text-white tracking-wide"
            style={{ background: '#EA580C' }}
          >
            {Math.round(discount)}% Off
          </div>
        )}

        <WishlistButton product={product}/>

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

        {/* Review count */}
        <div className="flex items-center gap-1.5 mb-3">
          {reviewCount > 0 ? (
            <>
              <SfRating size="xs" value={avgRating} max={5} />
              <span className="text-xs" style={{ color: '#6B7280' }}>
                {avgRating.toFixed(1)} ({reviewCount})
              </span>
            </>
          ) : (
            <span className="text-xs" style={{ color: '#9CA3AF' }}>No reviews yet</span>
          )}
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

        {/* CTA — label row always reserves space so buttons stay aligned */}
        <p className="text-xs font-bold mb-1.5" style={{
          minHeight: '1rem',
          color: product.stock === 0 ? '#DC2626' : '#F59E0B',
          visibility: (product.stock === 0 || atMax) ? 'visible' : 'hidden',
        }}>
          {product.stock === 0 ? 'Out of Stock' : 'Max qty reached'}
        </p>
        {product.stock === 0 ? (
          <button
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90"
            style={{ background: user ? '#1B3A6B' : '#6B7280' }}
            onClick={() => user ? setShowNotifyModal(true) : alert('Please log in to get notified')}
          >
            Notify Me
          </button>
        ) : (
          <AddToCartButton product={product} className="w-full py-2.5" />
        )}
      </div>

      {showNotifyModal && (
        <NotifyMeModal
          productId={product.id}
          productName={product.title}
          onClose={() => setShowNotifyModal(false)}
        />
      )}
    </div>
  );
}
