import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchProductsFromDB, type Product } from '../middleware/api/client';
import { PRICE_RANGES, type Filters } from './useProductFilters';

const PAGE_SIZE = 20;

export { PAGE_SIZE };
export const LOAD_MORE_SIZE = 20;

export function useProducts(filters: Filters, _loadedPages: number) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [total, setTotal]             = useState(0);
  const [skip, setSkip]               = useState(0);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // refetchKey resets everything and re-fetches from scratch
  const [refetchKey, setRefetchKey]   = useState(0);
  const isMounted = useRef(true);

  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);

  // Initial / reset load
  useEffect(() => {
    setLoading(true);
    setAllProducts([]);
    setSkip(0);
    fetchProductsFromDB(PAGE_SIZE, 0).then(({ products, total }) => {
      if (!isMounted.current) return;
      setAllProducts(products);
      setTotal(total);
      setSkip(PAGE_SIZE);
    }).finally(() => {
      if (isMounted.current) setLoading(false);
    });
  }, [refetchKey]);

  // Load next page and append
  const loadMore = useCallback(async () => {
    if (loadingMore || skip >= total) return;
    setLoadingMore(true);
    const { products: next } = await fetchProductsFromDB(PAGE_SIZE, skip);
    if (isMounted.current) {
      setAllProducts(prev => [...prev, ...next]);
      setSkip(s => s + PAGE_SIZE);
    }
    if (isMounted.current) setLoadingMore(false);
  }, [loadingMore, skip, total]);

  // Reset and re-fetch from scratch (called on clear filters)
  const refetch = useCallback(() => setRefetchKey(k => k + 1), []);

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
      list = list.filter(p => p.avgReviewRating != null && p.avgReviewRating >= filters.minRating);

    if (filters.sortBy === 'price_asc')  list.sort((a, b) => a.price - b.price);
    if (filters.sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    if (filters.sortBy === 'rating')     list.sort((a, b) => (b.avgReviewRating ?? 0) - (a.avgReviewRating ?? 0));

    return list;
  }, [allProducts, filters]);

  const hasMore = skip < total;

  return {
    loading,
    loadingMore,
    refetch,
    loadMore,
    categories,
    filtered,
    paginated: filtered,   // all loaded+filtered products visible at once
    hasMore,
    totalItems: filtered.length,
  };
}
