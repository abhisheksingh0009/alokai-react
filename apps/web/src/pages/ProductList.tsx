import { useState, useEffect, useRef, useCallback } from 'react';
import { SfIconMenu, SfIconExpandMore, SfIconClose } from '@storefront-ui/react';
import { useProductFilters, SORT_OPTIONS } from '../hooks/useProductFilters';
import { useProducts } from '../hooks/useProducts';
import ProductListFilters from '../components/ProductList/ProductListFilters';
import ProductListGrid from '../components/ProductList/ProductListGrid';
import ProductListSkeleton from '../components/ProductList/ProductListSkeleton';
import { useNavigation } from '../context/NavigationContext';

export default function PLP() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    filters, currentPage, setCurrentPage,
    toggleCategory, togglePrice, setMinRating, setSortBy,
    clearAll, hasFilters, activeFilterCount,
  } = useProductFilters();

  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { loading, categories, filtered, paginated, hasMore } = useProducts(filters, currentPage);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps
  //const { selectCategoryByNav } = useNavigation();
  const { selectCategoryByNav, setSelectCategoryByNav } = useNavigation();
  useEffect(() => {
    if (location.pathname === '/products' && selectCategoryByNav == null) {
      clearAll();
      setSelectCategoryByNav(undefined);
    }
    if (selectCategoryByNav) {
      clearAll();
      toggleCategory(selectCategoryByNav);
    }

  }, [selectCategoryByNav]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setCurrentPage(p => p + 1);
      setLoadingMore(false);
    }, 400);
  }, [hasMore, loadingMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (loading) return <ProductListSkeleton />;

  return (
    <div className="min-h-screen" style={{ background: '#F4F6F9' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Title + sort row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#111827' }}>Products</h1>
            <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>{filtered.length} items</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: '#1B3A6B', color: '#fff' }}
              onClick={() => setSidebarOpen(true)}
            >
              <SfIconMenu size="sm" />
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="bg-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
                  style={{ color: '#1B3A6B' }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none text-sm font-semibold pl-4 pr-10 py-2.5 rounded-xl outline-none cursor-pointer"
                style={{ background: '#fff', color: '#111827', border: '1.5px solid #E2E8F0', minWidth: '175px' }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <SfIconExpandMore size="sm" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#1B3A6B]" />
            </div>
          </div>
        </div>

        {/* Layout: sidebar + grid */}
        <div className="flex gap-8 items-start">

          {/* Desktop sidebar — white */}
          <aside
            className="hidden lg:block w-60 shrink-0 rounded-2xl p-5 sticky top-6"
            style={{ background: '#fff', border: '1px solid #E2E8F0' }}
          >
            <ProductListFilters
              categories={categories}
              filters={filters}
              onToggleCategory={toggleCategory}
              onTogglePrice={togglePrice}
              onSetMinRating={setMinRating}
              onClear={clearAll}
              hasFilters={hasFilters}
            />
          </aside>

          {/* Mobile sidebar drawer — dark */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 overflow-y-auto bg-slate-900 border-r border-slate-700 flex flex-col">
                <div className="flex items-center justify-between px-4 py-3.5 bg-slate-800 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 3h12M3 7h8M5 11h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="font-bold text-sm text-white tracking-wide">Filters</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <SfIconClose size="sm" />
                  </button>
                </div>
                <ProductListFilters
                  dark
                  categories={categories}
                  filters={filters}
                  onToggleCategory={toggleCategory}
                  onTogglePrice={togglePrice}
                  onSetMinRating={setMinRating}
                  onClear={clearAll}
                  hasFilters={hasFilters}
                />
              </div>
            </div>
          )}

          {/* Product grid + pagination */}
          <div className="flex-1 min-w-0">
            <ProductListGrid
              products={paginated}
              hasFilters={hasFilters}
              onClearFilters={clearAll}
            />

            {/* Infinite scroll sentinel + spinner */}
            <div ref={sentinelRef} className="h-1" />
            {(loadingMore || (hasMore && !loading)) && (
              <div className="flex justify-center items-center gap-3 py-8">
                <svg className="animate-spin h-5 w-5" style={{ color: '#1B3A6B' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>Loading</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
