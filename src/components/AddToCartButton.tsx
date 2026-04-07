import { useState } from "react";
import type { Product } from "../middleware/api/client";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Loader from "./Loader";

const BagIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

type Props = {
  product: Product;
  label?: string;
  variant?: "filled" | "outline";
  showIcon?: boolean;
  className?: string;
};

export default function AddToCartButton({
  product,
  label = "Add to cart",
  variant = "outline",
  showIcon = true,
  className = "",
}: Props) {
  const { addToCart } = useCart()!;
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  function handleClick() {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      addToCart(product);
      setLoading(false);
      showToast();
    }, 2000);
  }

  if (variant === "filled") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={`py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
        style={{ background: "#1B3A6B" }}
      >
        {loading ? <Loader size="sm" className="text-white" /> : (
          <>
            {showIcon && <BagIcon />}
            {label}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      style={{ border: "1.5px solid #1B3A6B", color: "#1B3A6B", background: "transparent" }}
      onMouseEnter={e => {
        if (loading) return;
        (e.currentTarget as HTMLButtonElement).style.background = "#1B3A6B";
        (e.currentTarget as HTMLButtonElement).style.color = "#fff";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "#1B3A6B";
      }}
    >
      {loading ? <Loader size="sm" /> : (
        <>
          {showIcon && <BagIcon />}
          {label}
        </>
      )}
    </button>
  );
}
