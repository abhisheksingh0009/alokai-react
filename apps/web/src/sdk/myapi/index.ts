/**
 * `myapi` integration module — the custom Alokai SDK module backed by the
 * project's Express/Prisma middleware. Exposes its methods on `connector`,
 * so consumers call `sdk.myapi.getProducts()`, `sdk.myapi.getCart()`, etc.
 *
 * Written to match the official Alokai custom-module shape:
 *   const myApiModule = (config) => ({ connector: { ...methods } })
 */
import { middlewareEndpoints } from '../../middleware/api/config';
import type {
  Address,
  AddressPayload,
  CartItem,
  Comment,
  DBProduct,
  Product,
  Review,
} from './types';

export interface MyApiConfig {
  apiUrl: string;
}

const TIMEOUT_MS = 10_000;

function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

function dbProductToProduct(p: DBProduct): Product {
  return {
    id:                  p.id,
    title:               p.title,
    description:         p.description ?? '',
    category:            p.category ?? undefined,
    price:               parseFloat(p.price ?? '0'),
    discountPercentage:  p.discountPercentage ? parseFloat(p.discountPercentage) : undefined,
    rating:              p.rating ? parseFloat(p.rating) : undefined,
    stock:               p.stock ?? undefined,
    reviewCount:         p._count?.reviews ?? 0,
    avgReviewRating:     p.avgReviewRating ?? null,
    brand:               p.brand ?? undefined,
    warrantyInformation: p.warrantyInformation ?? undefined,
    shippingInformation: p.shippingInformation ?? undefined,
    returnPolicy:        p.returnPolicy ?? undefined,
    thumbnail:           p.thumbnail ?? '',
    images:              p.thumbnail ? [p.thumbnail] : [],
  };
}

type DBProductsResponse = { products: DBProduct[]; total: number };
type CartResponse = { items: CartItem[] };
type WishlistResponse = { items: Product[] };

export const myApiModule = (config: MyApiConfig) => {
  const { apiUrl } = config;

  const cartUrl = (key: keyof typeof middlewareEndpoints, productId?: number): string => {
    const path = productId !== undefined
      ? middlewareEndpoints[key].replace('${productId}', String(productId))
      : middlewareEndpoints[key];
    return `${apiUrl}${path}`;
  };

  const addressUrl = (id?: number, suffix?: string): string => {
    if (id !== undefined) {
      const base = `${apiUrl}${middlewareEndpoints.addressItem}`.replace('${id}', String(id));
      return suffix ? `${base}/${suffix}` : base;
    }
    return `${apiUrl}${middlewareEndpoints.addresses}`;
  };

  const connector = {
    // ── Products ──────────────────────────────────────────────────────────
    async fetchComments(limit = 6): Promise<Comment[]> {
      const res = await apiFetch(`https://dummyjson.com/comments?limit=${limit}`);
      if (!res.ok) throw new Error(`Comments API error: ${res.status}`);
      const data: { comments: Comment[] } = await res.json();
      return data.comments ?? [];
    },

    async getProducts(limit = 20, skip = 0): Promise<{ products: Product[]; total: number }> {
      const res = await apiFetch(`${apiUrl}/api/products?limit=${limit}&skip=${skip}`);
      if (!res.ok) throw new Error(`DB API error: ${res.status}`);
      const data: DBProductsResponse = await res.json();
      return { products: (data.products ?? []).map(dbProductToProduct), total: data.total };
    },

    async getProduct(id: string | number): Promise<Product> {
      const res = await apiFetch(`${apiUrl}/api/products/${id}`);
      if (!res.ok) throw new Error(`DB API error: ${res.status}`);
      const data: DBProduct = await res.json();
      return dbProductToProduct(data);
    },

    async getProductsByCategory(category: string): Promise<Product[]> {
      const res = await apiFetch(`${apiUrl}/api/products/category/${encodeURIComponent(category)}`);
      if (!res.ok) throw new Error(`DB API error: ${res.status}`);
      const data: DBProductsResponse = await res.json();
      return (data.products ?? []).map(dbProductToProduct);
    },

    async searchProducts(query: string): Promise<Product[]> {
      const res = await apiFetch(`${apiUrl}/api/products/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`DB API error: ${res.status}`);
      const data: DBProductsResponse = await res.json();
      return (data.products ?? []).map(dbProductToProduct);
    },

    async getCategories(): Promise<string[]> {
      const res = await apiFetch(`${apiUrl}/api/products/categories`);
      if (!res.ok) throw new Error(`DB API error: ${res.status}`);
      return res.json();
    },

    // ── Cart ──────────────────────────────────────────────────────────────
    async getCart(): Promise<CartItem[]> {
      const res = await apiFetch(cartUrl('cart'), { headers: authHeaders() });
      if (!res.ok) return [];
      const data: CartResponse = await res.json();
      return data.items ?? [];
    },

    async upsertCartItem(productId: number, quantity: number): Promise<CartItem[]> {
      const res = await apiFetch(cartUrl('cart'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) return [];
      const data: CartResponse = await res.json();
      return data.items ?? [];
    },

    async patchCartItem(productId: number, quantity: number): Promise<CartItem[]> {
      const res = await apiFetch(cartUrl('cartItem', productId), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) return [];
      const data: CartResponse = await res.json();
      return data.items ?? [];
    },

    async removeCartItem(productId: number): Promise<CartItem[]> {
      const res = await apiFetch(cartUrl('cartItem', productId), {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) return [];
      const data: CartResponse = await res.json();
      return data.items ?? [];
    },

    // ── Reviews ───────────────────────────────────────────────────────────
    async getReviews(productId: number): Promise<Review[]> {
      const res = await apiFetch(`${apiUrl}/api/reviews/${productId}`);
      if (!res.ok) return [];
      const data: { reviews: Review[] } = await res.json();
      return data.reviews ?? [];
    },

    async submitReview(productId: number, payload: { comment: string; rating: number }): Promise<Review> {
      const res = await apiFetch(`${apiUrl}/api/reviews/${productId}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? 'Failed to submit review');
      }
      const data: { review: Review } = await res.json();
      return data.review;
    },

    // ── Stock notifications ───────────────────────────────────────────────
    async subscribeStockNotification(productId: number): Promise<{ success: boolean; message: string }> {
      const res = await apiFetch(`${apiUrl}/api/notifications/stock`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? 'Failed to subscribe');
      }
      return res.json();
    },

    async checkStockSubscription(productId: number): Promise<boolean> {
      const res = await apiFetch(`${apiUrl}/api/notifications/stock/${productId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) return false;
      const data: { subscribed: boolean } = await res.json();
      return data.subscribed;
    },

    // ── Wishlist ──────────────────────────────────────────────────────────
    async getWishlist(): Promise<Product[]> {
      const res = await apiFetch(`${apiUrl}${middlewareEndpoints.wishlist}`, { headers: authHeaders() });
      if (!res.ok) return [];
      const data: WishlistResponse = await res.json();
      return data.items ?? [];
    },

    async toggleWishlistItem(productId: number): Promise<Product[]> {
      const res = await apiFetch(`${apiUrl}${middlewareEndpoints.wishlistToggle}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) return [];
      const data: WishlistResponse = await res.json();
      return data.items ?? [];
    },

    async removeWishlistItem(productId: number): Promise<Product[]> {
      const url = `${apiUrl}${middlewareEndpoints.wishlistItem}`.replace('${productId}', String(productId));
      const res = await apiFetch(url, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) return [];
      const data: WishlistResponse = await res.json();
      return data.items ?? [];
    },

    // ── Addresses ─────────────────────────────────────────────────────────
    async getAddresses(): Promise<Address[]> {
      const res = await apiFetch(addressUrl(), { headers: authHeaders() });
      if (!res.ok) return [];
      const data: { addresses: Address[] } = await res.json();
      return data.addresses ?? [];
    },

    async saveAddress(payload: AddressPayload): Promise<Address> {
      const res = await apiFetch(addressUrl(), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? 'Failed to save address');
      }
      const data: { address: Address } = await res.json();
      return data.address;
    },

    async updateAddress(id: number, payload: Partial<AddressPayload>): Promise<Address> {
      const res = await apiFetch(addressUrl(id), {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? 'Failed to update address');
      }
      const data: { address: Address } = await res.json();
      return data.address;
    },

    async setDefaultAddress(id: number): Promise<Address> {
      const res = await apiFetch(addressUrl(id, 'default'), {
        method: 'PATCH',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? 'Failed to set default address');
      }
      const data: { address: Address } = await res.json();
      return data.address;
    },

    async deleteAddress(id: number): Promise<boolean> {
      const res = await apiFetch(addressUrl(id), { method: 'DELETE', headers: authHeaders() });
      return res.ok;
    },
  };

  return { connector };
};
