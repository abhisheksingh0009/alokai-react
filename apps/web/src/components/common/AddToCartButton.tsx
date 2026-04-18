import { useState } from "react";
import type { Product } from "../../middleware/api/client";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import Loader from "./Loader";
import { SfIconShoppingCartCheckout, SfIconAdd, SfIconRemove } from "@storefront-ui/react";

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
  const { cart, addToCart, removeFromCart } = useCart()!;
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const MAX_QTY = 10;
  const cartItem = cart.find(i => i.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  async function handleAddClick() {
    if (loading) return;
    setLoading(true);
    await addToCart(product, 1);
    setLoading(false);
    showToast();
  }

  async function handleIncrease() {
    if (quantity >= MAX_QTY) return;
    await addToCart(product, 1);
  }

  async function handleDecrease() {
    if (quantity <= 1) {
      await removeFromCart(product.id);
    } else {
      await addToCart(product, -1);
    }
  }

  // ── Quantity stepper (shown when product is already in cart) ──────────────
  if (quantity > 0) {
    const atMax = quantity >= MAX_QTY;
    const color = atMax ? '#F59E0B' : '#1B3A6B';
    return (
      <div className={`relative ${className}`}>
        <div
          className="flex items-center rounded-xl"
          style={{ border: `1.5px solid ${color}`, color, background: "transparent", padding: "0.5rem 0" }}
        >
          <button
            onClick={handleDecrease}
            className="flex-1 flex items-center justify-center hover:opacity-60 transition-opacity"
            aria-label="Decrease quantity"
          >
            <SfIconRemove size="sm" />
          </button>

          <span
            className="text-sm font-bold select-none"
            style={{ borderLeft: `1px solid ${color}`, borderRight: `1px solid ${color}`, padding: "0 0.75rem" }}
          >
            {String(quantity).padStart(2, "0")}
          </span>

          <button
            onClick={handleIncrease}
            disabled={atMax}
            className="flex-1 flex items-center justify-center transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-60"
            aria-label="Increase quantity"
          >
            <SfIconAdd size="sm" />
          </button>
        </div>

        {atMax && (
          <p className="absolute left-0 right-0 text-center text-xs font-medium mt-0.5" style={{ color: '#F59E0B' }}>
            Max qty reached
          </p>
        )}
      </div>
    );
  }

  // ── Add to cart button (shown when product is not in cart) ────────────────
  if (variant === "filled") {
    return (
      <button
        onClick={handleAddClick}
        disabled={loading}
        className={`py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
        style={{ background: "#1B3A6B" }}
      >
        {loading ? <Loader size="sm" className="text-white" /> : (
          <>
            {showIcon && <SfIconShoppingCartCheckout size="sm" />}
            {label}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAddClick}
      disabled={loading}
      className={`rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      style={{ border: "1.5px solid #1B3A6B", color: "#1B3A6B", background: "transparent", padding: "0.5rem 0" }}
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
          {showIcon && <SfIconShoppingCartCheckout size="sm" />}
          {label}
        </>
      )}
    </button>
  );
}
