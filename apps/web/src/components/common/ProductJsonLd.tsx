import type { Product } from "../../middleware/api/client";

type Props = {
  product: Product;
  reviewCount?: number;
  avgRating?: number;
};

export default function ProductJsonLd({ product, reviewCount, avgRating }: Props) {
  const availability =
    product.stock === 0
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images?.length ? product.images : [product.thumbnail],
    sku: String(product.id),
    ...(product.brand && {
      brand: { "@type": "Brand", name: product.brand },
    }),
    ...(product.category && {
      category: product.category.replace(/-/g, " "),
    }),
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "USD",
      availability,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(reviewCount && reviewCount > 0 && avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
