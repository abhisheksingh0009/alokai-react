import { get, apiConfig } from './config';

export type Product = {
  id: number;
  title: string;
  price: number;
  images: string[];
  thumbnail: string;
  description: string;
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

export function fetchCategories(): Promise<string[]> {
  return get<string[]>(apiConfig.endpoints.categories);
}
