import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SfIconMenu, SfIconExpandMore, SfIconClose, SfDrawer, SfButton } from '@storefront-ui/react';
import { useProductFilters } from '../hooks/useProductFilters';
import { useProducts } from '../hooks/useProducts';
import ProductListFilters from '../components/ProductList/ProductListFilters';
import ProductListGrid from '../components/ProductList/ProductListGrid';
import ProductListSkeleton from '../components/ProductList/ProductListSkeleton';
import ActiveFilterChips from '../components/ProductList/ActiveFilterChips';
import { useNavigation } from '../context/NavigationContext';

export default function PLP() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SORT_OPTIONS = [
    { label: t('plp.sort_featured'),   value: 'featured' },
    { label: t('plp.sort_price_asc'),  value: 'price_asc' },
    { label: t('plp.sort_price_desc'), value: 'price_desc' },
    { label: t('plp.sort_rating'),     value: 'rating' },
  ];

  const {
    filters, currentPage,
    toggleCategory, toggleBrand, togglePrice, setMinRating, toggleInStockOnly, setSortBy,
    clearAll, hasFilters, activeFilterCount,
  } = useProductFilters();

  const sentinelRef = useRef<HTMLDivElement>(null);

  const { loading, loadingMore, refetch, loadMore, categories, brands, filtered, paginated, hasMore } = useProducts(filters, currentPage);

  const handleClearAll = useCallback(() => { clearAll(); refetch(); }, [clearAll, refetch]);

  const { selectCategoryByNav, setSelectCategoryByNav } = useNavigation();
  useEffect(() => {
    if (location.pathname === '/products' && selectCategoryByNav == null) {
      handleClearAll();
      setSelectCategoryByNav(undefined);
    }
    if (selectCategoryByNav) {
      handleClearAll();
      toggleCategory(selectCategoryByNav);
    }
  }, [selectCategoryByNav]);

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
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#111827' }}>{t('plp.title')}</h1>
            <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>{t('plp.items_count', { count: filtered.length })}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: '#1B3A6B', color: '#fff' }}
              onClick={() => setSidebarOpen(true)}
            >
              <SfIconMenu size="sm" />
              {t('plp.filters')}
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
              brands={brands}
              filters={filters}
              onToggleCategory={toggleCategory}
              onToggleBrand={toggleBrand}
              onTogglePrice={togglePrice}
              onSetMinRating={setMinRating}
              onToggleInStockOnly={toggleInStockOnly}
              onClear={handleClearAll}
              hasFilters={hasFilters}
            />
          </aside>

          {/* Mobile sidebar drawer — SfDrawer for Alokai-pattern consistency */}
          <SfDrawer
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            placement="left"
            className="w-72 max-w-full bg-slate-900 flex flex-col h-full !z-[9999] backdrop:bg-black/50 backdrop:backdrop-blur-sm lg:hidden"
          >
            <div className="flex items-center justify-between px-4 py-3.5 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                  <SfIconMenu size="sm" className="text-white" />
                </div>
                <span className="font-bold text-sm text-white tracking-wide">{t('plp.filters')}</span>
              </div>
              <SfButton
                variant="tertiary"
                square
                onClick={() => setSidebarOpen(false)}
                aria-label="Close filters"
                className="!text-slate-400 hover:!text-white"
              >
                <SfIconClose size="sm" />
              </SfButton>
            </div>
            <div className="flex-1 overflow-y-auto px-3">
              <ProductListFilters
                dark
                categories={categories}
                brands={brands}
                filters={filters}
                onToggleCategory={toggleCategory}
                onToggleBrand={toggleBrand}
                onTogglePrice={togglePrice}
                onSetMinRating={setMinRating}
                onToggleInStockOnly={toggleInStockOnly}
                onClear={handleClearAll}
                hasFilters={hasFilters}
              />
            </div>
          </SfDrawer>

          {/* Product grid + pagination */}
          <div className="flex-1 min-w-0">
            <ActiveFilterChips
              filters={filters}
              onToggleCategory={toggleCategory}
              onToggleBrand={toggleBrand}
              onTogglePrice={togglePrice}
              onSetMinRating={setMinRating}
              onToggleInStockOnly={toggleInStockOnly}
              onClear={handleClearAll}
            />
            <ProductListGrid
              products={paginated}
              hasFilters={hasFilters}
              onClearFilters={handleClearAll}
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
