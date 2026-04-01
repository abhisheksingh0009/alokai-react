import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard/ProductCard";
import { fetchProducts, type Product } from "../lib/api/client";

// Fallback mock products
const mockProducts: Product[] = [
  {
    id: 1,
    title: "Classic Sneakers",
    price: 89.99,
    images: ["https://via.placeholder.com/300?text=Sneakers"],
    thumbnail: "https://via.placeholder.com/300?text=Sneakers",
    description: "Comfortable everyday sneakers.",
  },
  {
    id: 2,
    title: "Leather Bag",
    price: 129.99,
    images: ["https://via.placeholder.com/300?text=Bag"],
    thumbnail: "https://via.placeholder.com/300?text=Bag",
    description: "Premium handcrafted leather bag.",
  },
];

export default function PLP() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setItems(mockProducts);
        setError(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6">Loading products...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}