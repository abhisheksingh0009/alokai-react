import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type Product, type CartItem, fetchCart, upsertCartItem, patchCartItem, removeCartItem } from '../middleware/api/client';
import { useAuth } from './AuthContext';

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
}

const CartContext = createContext<CartContextType | null>(null);

// ── Local (guest) helpers ────────────────────────────────────────────────────

function loadLocalCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem('cart') ?? '[]'); } catch { return []; }
}

function saveLocalCart(cart: CartItem[]) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  // ── On auth change: load DB cart on login, restore localStorage on logout
  useEffect(() => {
    if (!user) {
      // Logged out — restore guest cart from localStorage
      setCart(loadLocalCart());
      return;
    }

    (async () => {
      // DB cart is the source of truth — discard any guest localStorage items
      localStorage.removeItem('cart');
      const dbCart = await fetchCart();
      setCart(dbCart);
    })();
  }, [user]);

  // ── Persist guest cart to localStorage whenever it changes (not logged in)
  useEffect(() => {
    if (!user) saveLocalCart(cart);
  }, [cart, user]);

  // ── addToCart ────────────────────────────────────────────────────────────

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    if (isLoggedIn()) {
      const existing = cart.find(i => i.id === product.id);

      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty <= 0) {
          const updated = await removeCartItem(product.id);
          setCart(updated);
        } else {
          const updated = await patchCartItem(product.id, newQty);
          setCart(updated);
        }
      } else {
        const updated = await upsertCartItem(product.id, Math.max(1, quantity));
        setCart(updated);
      }
    } else {
      // Guest mode — update local state only
      setCart(prev => {
        const existing = prev.find(i => i.id === product.id);
        if (existing) {
          return prev.map(i =>
            i.id === product.id
              ? { ...i, quantity: Math.max(1, i.quantity + quantity) }
              : i
          );
        }
        return [...prev, { ...product, quantity: Math.max(1, quantity) }];
      });
    }
  }, [cart]);

  // ── removeFromCart ───────────────────────────────────────────────────────

  const removeFromCart = useCallback(async (productId: number) => {
    if (isLoggedIn()) {
      const updated = await removeCartItem(productId);
      setCart(updated);
    } else {
      setCart(prev => prev.filter(i => i.id !== productId));
    }
  }, []);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
