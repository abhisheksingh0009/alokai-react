import { useMemo } from 'react';
import { useAsync } from 'react-use';
import { fetchProducts, type Product } from '../middleware/api/client';
import { PRICE_RANGES, type Filters } from './useProductFilters';

export const PAGE_SIZE = 9;

const MOCK_PRODUCTS: Product[] = [
  { id: 1, title: 'Classic Sneakers', price: 89.99, images: [], thumbnail: 'https://via.placeholder.com/300', description: 'Comfortable everyday sneakers.', rating: 4.2, stock: 12 },
  { id: 2, title: 'Leather Bag',      price: 129.99, images: [], thumbnail: 'https://via.placeholder.com/300', description: 'Premium handcrafted leather bag.', rating: 4.7, stock: 8 },
];

export function useProducts(filters: Filters, currentPage: number) {
  const { loading, error, value: rawProducts } = useAsync(fetchProducts, []);

  const allProducts: Product[] = rawProducts ?? (error ? MOCK_PRODUCTS : []);

  const categories: string[] = useMemo(
    () => [...new Set(allProducts.map(p => p.category).filter((c): c is string => !!c))].sort(),
    [allProducts]
  );

  const filtered = useMemo(() => {
    let list = [...allProducts];

    if (filters.categories.length > 0)
      list = list.filter(p => p.category && filters.categories.includes(p.category));

    if (filters.prices.length > 0)
      list = list.filter(p =>
        filters.prices.some(i => p.price >= PRICE_RANGES[i].min && p.price < PRICE_RANGES[i].max)
      );

    if (filters.minRating > 0)
      list = list.filter(p => (p.rating ?? 0) >= filters.minRating);

    if (filters.sortBy === 'price_asc')  list.sort((a, b) => a.price - b.price);
    if (filters.sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    if (filters.sortBy === 'rating')     list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return list;
  }, [allProducts, filters]);

  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return {
    loading,
    categories,
    filtered,
    paginated,
    totalItems: filtered.length,
  };
}
