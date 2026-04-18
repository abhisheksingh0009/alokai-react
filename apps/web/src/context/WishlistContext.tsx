import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type Product, fetchWishlist, toggleWishlistItem } from '../middleware/api/client';
import { useAuth } from './AuthContext';

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

// ── Local (guest) helpers ────────────────────────────────────────────────────

function loadLocalWishlist(): Product[] {
  try { return JSON.parse(localStorage.getItem('wishlist') ?? '[]'); } catch { return []; }
}

function saveLocalWishlist(wishlist: Product[]) {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // ── On auth change: load DB wishlist on login, restore localStorage on logout
  useEffect(() => {
    if (!user) {
      setWishlist(loadLocalWishlist());
      return;
    }

    (async () => {
      // DB is source of truth — discard guest localStorage wishlist on login
      localStorage.removeItem('wishlist');
      const items = await fetchWishlist();
      setWishlist(items);
    })();
  }, [user]);

  // ── Persist guest wishlist to localStorage when not logged in
  useEffect(() => {
    if (!user) saveLocalWishlist(wishlist);
  }, [wishlist, user]);

  // ── addToWishlist — toggles: adds if absent, removes if present
  const addToWishlist = useCallback(async (product: Product) => {
    if (isLoggedIn()) {
      const updated = await toggleWishlistItem(product.id);
      setWishlist(updated);
    } else {
      setWishlist(prev => {
        const exists = prev.find(i => i.id === product.id);
        return exists
          ? prev.filter(i => i.id !== product.id)
          : [{ ...product }, ...prev];
      });
    }
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
