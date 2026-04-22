import { middlewareUrl, middlewareEndpoints } from './config';

const TIMEOUT_MS = 10_000;

function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

export type Product = {
  id: number;
  title: string;
  price: number;
  images: string[];
  thumbnail: string;
  description: string;
  rating?: number;
  stock?: number;
  reviewCount?: number;
  avgReviewRating?: number | null;
  category?: string;
  discountPercentage?: number;
  brand?: string;
  warrantyInformation?: string;
  shippingInformation?: string;
  returnPolicy?: string;
  tags?: string[];
};

export type Comment = {
  id: number;
  body: string;
  postId: number;
  likes: number;
  user: { id: number; username: string; fullName: string };
};

export async function fetchComments(limit = 6): Promise<Comment[]> {
  const res = await apiFetch(`https://dummyjson.com/comments?limit=${limit}`);
  if (!res.ok) throw new Error(`Comments API error: ${res.status}`);
  const data: { comments: Comment[] } = await res.json();
  return data.comments ?? [];
}

// ── DB-backed product helpers ────────────────────────────────────────────────

export type DBProduct = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  price: string | null;          // Prisma Decimal comes back as string over JSON
  discountPercentage: string | null;
  rating: string | null;
  stock: number | null;
  brand: string | null;
  sku: string | null;
  weight: string | null;
  warrantyInformation: string | null;
  shippingInformation: string | null;
  availabilityStatus: string | null;
  returnPolicy: string | null;
  minimumOrderQuantity: number | null;
  thumbnail: string | null;
  _count?: { reviews: number };
  avgReviewRating?: number | null;
};

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

export async function fetchProductsFromDB(limit = 20, skip = 0): Promise<{ products: Product[]; total: number }> {
  const res = await apiFetch(`${middlewareUrl}/api/products?limit=${limit}&skip=${skip}`);
  if (!res.ok) throw new Error(`DB API error: ${res.status}`);
  const data: DBProductsResponse = await res.json();
  return { products: (data.products ?? []).map(dbProductToProduct), total: data.total };
}

export async function fetchProductFromDB(id: string | number): Promise<Product> {
  const res = await apiFetch(`${middlewareUrl}/api/products/${id}`);
  if (!res.ok) throw new Error(`DB API error: ${res.status}`);
  const data: DBProduct = await res.json();
  return dbProductToProduct(data);
}

export async function fetchProductsByCategoryFromDB(category: string): Promise<Product[]> {
  const res = await apiFetch(`${middlewareUrl}/api/products/category/${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error(`DB API error: ${res.status}`);
  const data: DBProductsResponse = await res.json();
  return (data.products ?? []).map(dbProductToProduct);
}

export async function searchProductsFromDB(query: string): Promise<Product[]> {
  const res = await apiFetch(`${middlewareUrl}/api/products/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`DB API error: ${res.status}`);
  const data: DBProductsResponse = await res.json();
  return (data.products ?? []).map(dbProductToProduct);
}

export async function fetchCategoriesFromDB(): Promise<string[]> {
  const res = await apiFetch(`${middlewareUrl}/api/products/categories`);
  if (!res.ok) throw new Error(`DB API error: ${res.status}`);
  return res.json();
}

// ── Cart helpers ─────────────────────────────────────────────────────────────

export type CartItem = Product & { quantity: number };

type CartResponse = { items: CartItem[] };

function cartHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

function cartUrl(key: keyof typeof middlewareEndpoints, productId?: number): string {
  const path = productId !== undefined
    ? middlewareEndpoints[key].replace('${productId}', String(productId))
    : middlewareEndpoints[key];
  return `${middlewareUrl}${path}`;
}

export async function fetchCart(): Promise<CartItem[]> {
  const res = await apiFetch(cartUrl('cart'), { headers: cartHeaders() });
  if (!res.ok) return [];
  const data: CartResponse = await res.json();
  return data.items ?? [];
}

export async function upsertCartItem(productId: number, quantity: number): Promise<CartItem[]> {
  const res = await apiFetch(cartUrl('cart'), {
    method: 'POST',
    headers: cartHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) return [];
  const data: CartResponse = await res.json();
  return data.items ?? [];
}

export async function patchCartItem(productId: number, quantity: number): Promise<CartItem[]> {
  const res = await apiFetch(cartUrl('cartItem', productId), {
    method: 'PATCH',
    headers: cartHeaders(),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) return [];
  const data: CartResponse = await res.json();
  return data.items ?? [];
}

export async function removeCartItem(productId: number): Promise<CartItem[]> {
  const res = await apiFetch(cartUrl('cartItem', productId), {
    method: 'DELETE',
    headers: cartHeaders(),
  });
  if (!res.ok) return [];
  const data: CartResponse = await res.json();
  return data.items ?? [];
}

// ── Review helpers ───────────────────────────────────────────────────────────

export type Review = {
  id: number;
  comment: string;
  likes: number;
  providerName: string;
  productId: number;
  userEmail: string;
  rating: number;
  createdAt: string;
};

export async function fetchReviews(productId: number): Promise<Review[]> {
  const res = await apiFetch(`${middlewareUrl}/api/reviews/${productId}`);
  if (!res.ok) return [];
  const data: { reviews: Review[] } = await res.json();
  return data.reviews ?? [];
}

export async function submitReview(
  productId: number,
  payload: { comment: string; rating: number }
): Promise<Review> {
  const res = await apiFetch(`${middlewareUrl}/api/reviews/${productId}`, {
    method: 'POST',
    headers: cartHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Failed to submit review');
  }
  const data: { review: Review } = await res.json();
  return data.review;
}

// ── Stock notification helpers ───────────────────────────────────────────────

export async function subscribeStockNotification(productId: number): Promise<{ success: boolean; message: string }> {
  const res = await apiFetch(`${middlewareUrl}/api/notifications/stock`, {
    method: 'POST',
    headers: cartHeaders(),
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Failed to subscribe');
  }
  return res.json();
}

export async function checkStockSubscription(productId: number): Promise<boolean> {
  const res = await apiFetch(`${middlewareUrl}/api/notifications/stock/${productId}`, {
    headers: cartHeaders(),
  });
  if (!res.ok) return false;
  const data: { subscribed: boolean } = await res.json();
  return data.subscribed;
}

// ── Wishlist helpers ─────────────────────────────────────────────────────────

type WishlistResponse = { items: Product[] };

export async function fetchWishlist(): Promise<Product[]> {
  const res = await apiFetch(`${middlewareUrl}${middlewareEndpoints.wishlist}`, { headers: cartHeaders() });
  if (!res.ok) return [];
  const data: WishlistResponse = await res.json();
  return data.items ?? [];
}

export async function toggleWishlistItem(productId: number): Promise<Product[]> {
  const res = await apiFetch(`${middlewareUrl}${middlewareEndpoints.wishlistToggle}`, {
    method: 'POST',
    headers: cartHeaders(),
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) return [];
  const data: WishlistResponse = await res.json();
  return data.items ?? [];
}

export async function removeWishlistItem(productId: number): Promise<Product[]> {
  const url = `${middlewareUrl}${middlewareEndpoints.wishlistItem}`.replace('${productId}', String(productId));
  const res = await apiFetch(url, { method: 'DELETE', headers: cartHeaders() });
  if (!res.ok) return [];
  const data: WishlistResponse = await res.json();
  return data.items ?? [];
}

// ── Address helpers ───────────────────────────────────────────────────────────

export type Address = {
  id: number;
  userEmail: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  label: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressPayload = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  label?: string;
  isDefault?: boolean;
};

function addressUrl(id?: number, suffix?: string): string {
  if (id !== undefined) {
    const base = `${middlewareUrl}${middlewareEndpoints.addressItem}`.replace('${id}', String(id));
    return suffix ? `${base}/${suffix}` : base;
  }
  return `${middlewareUrl}${middlewareEndpoints.addresses}`;
}

export async function fetchAddresses(): Promise<Address[]> {
  const res = await apiFetch(addressUrl(), { headers: cartHeaders() });
  if (!res.ok) return [];
  const data: { addresses: Address[] } = await res.json();
  return data.addresses ?? [];
}

export async function saveAddress(payload: AddressPayload): Promise<Address> {
  const res = await apiFetch(addressUrl(), {
    method: 'POST',
    headers: cartHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Failed to save address');
  }
  const data: { address: Address } = await res.json();
  return data.address;
}

export async function updateAddress(id: number, payload: Partial<AddressPayload>): Promise<Address> {
  const res = await apiFetch(addressUrl(id), {
    method: 'PUT',
    headers: cartHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Failed to update address');
  }
  const data: { address: Address } = await res.json();
  return data.address;
}

export async function setDefaultAddress(id: number): Promise<Address> {
  const res = await apiFetch(addressUrl(id, 'default'), {
    method: 'PATCH',
    headers: cartHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Failed to set default address');
  }
  const data: { address: Address } = await res.json();
  return data.address;
}

export async function deleteAddress(id: number): Promise<boolean> {
  const res = await apiFetch(addressUrl(id), { method: 'DELETE', headers: cartHeaders() });
  return res.ok;
}

