import { useState, useCallback } from 'react';

export const PRICE_RANGES = [
  { label: 'Under $50',      min: 0,   max: 50 },
  { label: '$50 – $100',     min: 50,  max: 100 },
  { label: '$100 – $300',    min: 100, max: 300 },
  { label: 'Over $300',      min: 300, max: Infinity },
];

export const SORT_OPTIONS = [
  { label: 'Featured',          value: 'featured' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Top Rated',         value: 'rating' },
];

export interface Filters {
  categories: string[];
  brands: string[];
  prices: number[];
  minRating: number;
  inStockOnly: boolean;
  sortBy: string;
}

const DEFAULT_FILTERS: Filters = {
  categories: [],
  brands: [],
  prices: [],
  minRating: 0,
  inStockOnly: false,
  sortBy: 'featured',
};

export function useProductFilters() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const resetPage = useCallback(() => setCurrentPage(1), []);

  const toggleCategory = useCallback((cat: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }));
    resetPage();
  }, [resetPage]);

  const toggleBrand = useCallback((brand: string) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand],
    }));
    resetPage();
  }, [resetPage]);

  const toggleInStockOnly = useCallback(() => {
    setFilters(prev => ({ ...prev, inStockOnly: !prev.inStockOnly }));
    resetPage();
  }, [resetPage]);

  const togglePrice = useCallback((idx: number) => {
    setFilters(prev => ({
      ...prev,
      prices: prev.prices.includes(idx)
        ? prev.prices.filter(i => i !== idx)
        : [...prev.prices, idx],
    }));
    resetPage();
  }, [resetPage]);

  const setMinRating = useCallback((rating: number) => {
    setFilters(prev => ({ ...prev, minRating: rating }));
    resetPage();
  }, [resetPage]);

  const setSortBy = useCallback((sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
    resetPage();
  }, [resetPage]);

  const clearAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    resetPage();
  }, [resetPage]);

  const hasFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.prices.length > 0 ||
    filters.minRating > 0 ||
    filters.inStockOnly;

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    filters.prices.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  return {
    filters,
    currentPage,
    setCurrentPage,
    toggleCategory,
    toggleBrand,
    togglePrice,
    setMinRating,
    toggleInStockOnly,
    setSortBy,
    clearAll,
    hasFilters,
    activeFilterCount,
  };
}
