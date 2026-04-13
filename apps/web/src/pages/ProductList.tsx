import { useState } from 'react';
import { SfIconMenu, SfIconExpandMore, SfIconClose } from '@storefront-ui/react';
import { useProductFilters, SORT_OPTIONS } from '../hooks/useProductFilters';
import { useProducts } from '../hooks/useProducts';
import ProductListFilters from '../components/ProductList/ProductListFilters';
import ProductListGrid from '../components/ProductList/ProductListGrid';
import ProductListPagination from '../components/ProductList/ProductListPagination';
import ProductListSkeleton from '../components/ProductList/ProductListSkeleton';

export default function PLP() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    filters, currentPage, setCurrentPage,
    toggleCategory, togglePrice, setMinRating, setSortBy,
    clearAll, hasFilters, activeFilterCount,
  } = useProductFilters();

  const { loading, categories, filtered, paginated, totalItems } = useProducts(filters, currentPage);

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

          {/* Desktop sidebar */}
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

          {/* Mobile sidebar drawer */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div
                className="absolute left-0 top-0 bottom-0 w-72 overflow-y-auto p-6"
                style={{ background: '#fff' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-bold text-base" style={{ color: '#111827' }}>Filters</span>
                  <button onClick={() => setSidebarOpen(false)} style={{ color: '#6B7280' }}>
                    <SfIconClose size="sm" />
                  </button>
                </div>
                <ProductListFilters
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
            <ProductListPagination
              totalItems={totalItems}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
