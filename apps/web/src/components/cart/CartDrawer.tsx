import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  SfDrawer,
  SfButton,
  SfIconClose,
  SfIconShoppingCart,
  SfIconAdd,
  SfIconRemove,
  SfIconDelete,
} from "@storefront-ui/react";
import { useCart } from "../../context/CartContext";
import { useUI } from "../../context/UIContext";
import { useCurrency } from "../../hooks/useCurrency";

const MAX_QTY = 10;

export default function CartDrawer() {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const { cart, addToCart, removeFromCart } = useCart()!;
  const { isCartDrawerOpen, closeCartDrawer } = useUI();
  const navigate = useNavigate();

  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  function goTo(path: string) {
    closeCartDrawer();
    navigate(path);
  }

  return (
    <SfDrawer
      open={isCartDrawerOpen}
      onClose={closeCartDrawer}
      placement="right"
      className="w-full sm:w-[420px] max-w-full bg-white flex flex-col h-full !z-[9999] backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ background: "#1B3A6B", color: "#fff" }}
      >
        <div className="flex items-center gap-2">
          <SfIconShoppingCart className="text-white" />
          <span className="font-bold text-base tracking-wide">
            {t('cart_drawer.title')} {itemCount > 0 && <span className="opacity-80 font-medium">({itemCount})</span>}
          </span>
        </div>
        <SfButton
          variant="tertiary"
          square
          onClick={closeCartDrawer}
          aria-label="Close cart"
          className="!text-white hover:!bg-white/10"
        >
          <SfIconClose />
        </SfButton>
      </div>

      {/* Body */}
      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "#EFF6FF" }}
          >
            <SfIconShoppingCart size="lg" style={{ color: "#1B3A6B" }} />
          </div>
          <p className="text-base font-semibold" style={{ color: "#111827" }}>
            {t('cart_drawer.empty_title')}
          </p>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            {t('cart_drawer.empty_subtitle')}
          </p>
          <button
            className="mt-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "#1B3A6B" }}
            onClick={() => goTo("/products")}
          >
            {t('cart_drawer.continue_shopping')}
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="flex flex-col">
            {cart.map((item) => {
              const lineTotal = format(item.price * item.quantity);
              const atMax = item.quantity >= MAX_QTY;
              return (
                <li
                  key={item.id}
                  className="flex gap-3 py-3"
                  style={{ borderBottom: "1px solid #F3F4F6" }}
                >
                  <Link
                    to={`/product/${item.id}`}
                    onClick={closeCartDrawer}
                    className="shrink-0"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      width="72"
                      height="72"
                      className="w-[72px] h-[72px] rounded-xl object-cover"
                      style={{ border: "1px solid #E5E7EB" }}
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
                    <Link
                      to={`/product/${item.id}`}
                      onClick={closeCartDrawer}
                      className="text-sm font-semibold leading-snug hover:underline line-clamp-2"
                      style={{ color: "#111827" }}
                    >
                      {item.title}
                    </Link>

                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="flex items-center rounded-full"
                        style={{ border: "1.5px solid #E5E7EB", background: "#F9FAFB" }}
                      >
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-l-full transition-colors hover:bg-gray-100 disabled:opacity-40"
                          aria-label="Decrease"
                          onClick={() =>
                            item.quantity <= 1
                              ? removeFromCart(item.id)
                              : addToCart(item, -1)
                          }
                        >
                          <SfIconRemove size="sm" />
                        </button>
                        <span
                          className="w-7 text-center font-bold text-xs"
                          style={{ color: "#111827" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-r-full transition-colors hover:bg-gray-100 disabled:opacity-40"
                          aria-label="Increase"
                          disabled={atMax}
                          onClick={() => addToCart(item, 1)}
                        >
                          <SfIconAdd size="sm" />
                        </button>
                      </div>

                      <div className="text-sm font-extrabold" style={{ color: "#111827" }}>
                        {lineTotal}
                      </div>

                      <button
                        aria-label="Remove"
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: "#D1D5DB" }}
                        onClick={() => removeFromCart(item.id)}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#D1D5DB")}
                      >
                        <SfIconDelete size="sm" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Footer */}
      {cart.length > 0 && (
        <div
          className="px-5 py-4 flex flex-col gap-3"
          style={{ borderTop: "1px solid #E5E7EB", background: "#F9FAFB" }}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium" style={{ color: "#6B7280" }}>
              {t('cart_drawer.subtotal')}
            </span>
            <span className="text-xl font-extrabold" style={{ color: "#111827" }}>
              {format(subtotal)}
            </span>
          </div>
          <p className="text-xs" style={{ color: "#6B7280" }}>
            {t('cart_drawer.shipping_note')}
          </p>
          <div className="flex flex-col gap-2">
            <button
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#1B3A6B" }}
              onClick={() => goTo("/checkout")}
            >
              {t('cart_drawer.checkout')}
            </button>
            <button
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-gray-100"
              style={{ border: "1.5px solid #1B3A6B", color: "#1B3A6B", background: "#fff" }}
              onClick={() => goTo("/cart")}
            >
              {t('cart_drawer.view_cart')}
            </button>
          </div>
        </div>
      )}
    </SfDrawer>
  );
}
