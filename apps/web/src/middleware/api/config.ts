export const middlewareUrl = import.meta.env.VITE_MIDDLEWARE_URL ?? 'http://localhost:4000';

// export const apiConfig = {
//   baseUrl: 'https://dummyjson.com',
//   endpoints: {
//     products: '/products?limit=${limit}&skip=${skip}&select=id,title,price,thumbnail,images,description,rating,stock,category,discountPercentage',
//     product: '/products/${id}',
//     searchProducts: '/products/search?q=${query}',
//     productsByCategory: '/products/category/${category}',
//     categories: '/products/categories',
//     comments: '/comments?limit=${limit}&skip=${skip}',
//     users: 'users',
//   },
// };

export const middlewareEndpoints = {
  products:           '/api/products',
  product:            '/api/products/${id}',
  productsByCategory: '/api/products/category/${category}',
  searchProducts:     '/api/products/search',
  categories:         '/api/products/categories',
  cart:               '/api/cart',
  cartItem:           '/api/cart/${productId}',
  wishlist:           '/api/wishlist',
  wishlistToggle:     '/api/wishlist/toggle',
  wishlistItem:       '/api/wishlist/${productId}',
};

// function resolveEndpoint(endpoint: string, params: Record<string, string | number> = {}): string {
//   return Object.entries(params).reduce(
//     (url, [key, value]) => url.replace(`\${${key}}`, String(value)),
//     `${apiConfig.baseUrl}${endpoint}`
//   );
// }

// export async function get<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
//   const url = resolveEndpoint(endpoint, params);
//   const res = await fetch(url);
//   if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
//   return res.json();
// }
