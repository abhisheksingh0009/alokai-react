import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { SfButton } from "@storefront-ui/react";
import { useCart } from "../context/CartContext";
import { fetchProduct, type Product } from "../lib/api/client";

export default function PDP() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart()!;

  useEffect(() => {
    if (id) {
      fetchProduct(id)
        .then(setProduct)
        .then(() => setLoading(false))
        .catch(err => {
          console.error('Failed to fetch product:', err);
          setError('Failed to load product. Please try again.');
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="p-6">Loading product...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!product) return <div className="p-6 text-center"><h1 className="text-2xl font-bold">Product Not Found</h1></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <img
        src={product.thumbnail}
        alt={product.title}
        className="w-full max-w-md mx-auto rounded-lg shadow"
      />

      <h1 className="text-4xl font-bold mt-6">{product.title}</h1>

      <p className="text-2xl text-indigo-600 mt-2 font-semibold">
        ${product.price}
      </p>

      <p className="mt-4 text-gray-700 leading-relaxed">
        {product.description}
      </p>

      <SfButton
        size="lg"
        variant="primary"
        className="mt-6"
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </SfButton>
    </div>
  );
}