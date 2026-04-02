import { SfButton, SfRating, SfCounter, SfLink, SfIconShoppingCart, SfIconFavorite } from '@storefront-ui/react';
import type { Product } from '../../middleware/api/client';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()!;
  return (
    <div className="border border-neutral-200 rounded-xl hover:shadow-lg max-w-[300px]">
      <div className="relative">
        <SfLink href={`/product/${product.id}`} className="block">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="object-cover h-auto rounded-xl aspect-square"
            width="300"
            height="300"
          />
        </SfLink>
        <SfButton
          variant="tertiary"
          size="sm"
          square
          className="absolute bottom-0 right-0 mr-2 mb-2 bg-white ring-1 ring-inset ring-neutral-200 !rounded-full"
          aria-label="Add to wishlist"
        >
          <SfIconFavorite size="sm" />
        </SfButton>
      </div>
      <div className="p-4 border-t border-neutral-200">
        <SfLink href={`/product/${product.id}`} variant="secondary" className="no-underline">
          {product.title}
        </SfLink>
        <div className="flex items-center pt-1">
          <SfRating size="xs" value={5} max={5} />
          <SfLink href={`/product/${product.id}`} variant="secondary" className="pl-1 no-underline">
            <SfCounter size="xs">0</SfCounter>
          </SfLink>
        </div>
        <p className="block py-2 font-normal typography-text-sm text-neutral-700">
          {product.description}
        </p>
        <span className="block pb-2 font-bold typography-text-lg">${product.price}</span>
        <SfButton size="sm" slotPrefix={<SfIconShoppingCart size="sm" />} onClick={() => addToCart(product)}>
          Add to cart
        </SfButton>
      </div>
    </div>
  );
}
