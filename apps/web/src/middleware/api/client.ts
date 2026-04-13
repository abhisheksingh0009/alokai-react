import { get, apiConfig } from './config';

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

type ProductsResponse = { products: Product[] };

export function fetchProducts(limit = 20, skip = 0): Promise<Product[]> {
  return get<ProductsResponse>(apiConfig.endpoints.products, { limit, skip }).then(d => d.products ?? []);
}

export function fetchProduct(id: string | number): Promise<Product> {
  return get<Product>(apiConfig.endpoints.product, { id });
}

export function searchProducts(query: string): Promise<Product[]> {
  return get<ProductsResponse>(apiConfig.endpoints.searchProducts, { query }).then(d => d.products ?? []);
}

export function fetchProductsByCategory(category: string): Promise<Product[]> {
  return get<ProductsResponse>(apiConfig.endpoints.productsByCategory, { category }).then(d => d.products ?? []);
}

export type Comment = {
  id: number;
  body: string;
  postId: number;
  likes: number;
  user: { id: number; username: string; fullName: string };
};

type CommentsResponse = { comments: Comment[]; total: number; skip: number; limit: number };

export function fetchComments(limit = 6, skip = 0): Promise<Comment[]> {
  return get<CommentsResponse>(apiConfig.endpoints.comments, { limit, skip }).then(d => d.comments ?? []);
}

type CategoryItem = string | { slug: string; name: string; url: string };

export function fetchCategories(): Promise<string[]> {
  return get<CategoryItem[]>(apiConfig.endpoints.categories).then(items =>
    items.map(item => (typeof item === 'string' ? item : item.slug))
  );
}
