export const apiConfig = {
  baseUrl: 'https://dummyjson.com',
  endpoints: {
    products: '/products?limit=${limit}&skip=${skip}&select=id,title,price,thumbnail,images,description',
    product: '/products/${id}',
    searchProducts: '/products/search?q=${query}',
    productsByCategory: '/products/category/${category}',
    categories: '/products/categories',
  },
};

function resolveEndpoint(endpoint: string, params: Record<string, string | number> = {}): string {
  return Object.entries(params).reduce(
    (url, [key, value]) => url.replace(`\${${key}}`, String(value)),
    `${apiConfig.baseUrl}${endpoint}`
  );
}

export async function get<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = resolveEndpoint(endpoint, params);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}
