import { middlewareUrl, middlewareEndpoints } from './config';

export type Product = {
  id: number;
  title: string;
  price: number;
  images: string[];
  thumbnail: string;
  description: string;
  rating?: number;
  stock?: number;
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
  const res = await fetch(`https://dummyjson.com/comments?limit=${limit}`);
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
  const res = await fetch(`${middlewareUrl}/api/products?limit=${limit}&skip=${skip}`);
  if (!res.ok) throw new Error(`DB API error: ${res.status}`);
  const data: DBProductsResponse = await res.json();
  return { products: (data.products ?? []).map(dbProductToProduct), total: data.total };
}

export async function fetchProductFromDB(id: string | number): Promise<Product> {
  const res = await fetch(`${middlewareUrl}/api/products/${id}`);
  if (!res.ok) throw new Error(`DB API error: ${res.status}`);
  const data: DBProduct = await res.json();
  return dbProductToProduct(data);
}

export async function fetchProductsByCategoryFromDB(category: string): Promise<Product[]> {
  const res = await fetch(`${middlewareUrl}/api/products/category/${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error(`DB API error: ${res.status}`);
  const data: DBProductsResponse = await res.json();
  return (data.products ?? []).map(dbProductToProduct);
}

export async function searchProductsFromDB(query: string): Promise<Product[]> {
  const res = await fetch(`${middlewareUrl}/api/products/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`DB API error: ${res.status}`);
  const data: DBProductsResponse = await res.json();
  return (data.products ?? []).map(dbProductToProduct);
}

export async function fetchCategoriesFromDB(): Promise<string[]> {
  const res = await fetch(`${middlewareUrl}/api/products/categories`);
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
  const res = await fetch(cartUrl('cart'), { headers: cartHeaders() });
  if (!res.ok) return [];
  const data: CartResponse = await res.json();
  return data.items ?? [];
}

export async function upsertCartItem(productId: number, quantity: number): Promise<CartItem[]> {
  const res = await fetch(cartUrl('cart'), {
    method: 'POST',
    headers: cartHeaders(),
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) return [];
  const data: CartResponse = await res.json();
  return data.items ?? [];
}

export async function patchCartItem(productId: number, quantity: number): Promise<CartItem[]> {
  const res = await fetch(cartUrl('cartItem', productId), {
    method: 'PATCH',
    headers: cartHeaders(),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) return [];
  const data: CartResponse = await res.json();
  return data.items ?? [];
}

export async function removeCartItem(productId: number): Promise<CartItem[]> {
  const res = await fetch(cartUrl('cartItem', productId), {
    method: 'DELETE',
    headers: cartHeaders(),
  });
  if (!res.ok) return [];
  const data: CartResponse = await res.json();
  return data.items ?? [];
}

// ── Wishlist helpers ─────────────────────────────────────────────────────────

type WishlistResponse = { items: Product[] };

export async function fetchWishlist(): Promise<Product[]> {
  const res = await fetch(`${middlewareUrl}${middlewareEndpoints.wishlist}`, { headers: cartHeaders() });
  if (!res.ok) return [];
  const data: WishlistResponse = await res.json();
  return data.items ?? [];
}

export async function toggleWishlistItem(productId: number): Promise<Product[]> {
  const res = await fetch(`${middlewareUrl}${middlewareEndpoints.wishlistToggle}`, {
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
  const res = await fetch(url, { method: 'DELETE', headers: cartHeaders() });
  if (!res.ok) return [];
  const data: WishlistResponse = await res.json();
  return data.items ?? [];
}

