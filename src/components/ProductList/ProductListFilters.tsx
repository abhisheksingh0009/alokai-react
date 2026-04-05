import { useState } from 'react';
import { PRICE_RANGES, type Filters } from '../../hooks/useProductFilters';

interface Props {
  categories: string[];
  filters: Filters;
  onToggleCategory: (cat: string) => void;
  onTogglePrice: (idx: number) => void;
  onSetMinRating: (r: number) => void;
  onClear: () => void;
  hasFilters: boolean;
}

interface AccordionSectionProps {
  title: string;
  badge?: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({ title, badge, open, onToggle, children }: AccordionSectionProps) {
  return (
    <section style={{ borderBottom: '1px solid #E2E8F0' }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3.5 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#111827' }}>
            {title}
          </span>
          {badge ? (
            <span
              className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center text-white"
              style={{ background: '#1B3A6B' }}
            >
              {badge}
            </span>
          ) : null}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 20 20" fill="none"
          style={{
            color: '#6B7280',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </section>
  );
}

export default function ProductListFilters({
  categories, filters, onToggleCategory, onTogglePrice, onSetMinRating, onClear, hasFilters,
}: Props) {
  const [openSections, setOpenSections] = useState({ category: true, price: true, rating: true });

  function toggle(key: keyof typeof openSections) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div>
      {hasFilters && (
        <div className="pb-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
          <button
            onClick={onClear}
            className="text-xs font-semibold underline"
            style={{ color: '#2563EB' }}
          >
            Clear all filters
          </button>
        </div>
      )}

      <AccordionSection
        title="Category"
        badge={filters.categories.length || undefined}
        open={openSections.category}
        onToggle={() => toggle('category')}
      >
        <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {categories.map(cat => (
            <li key={cat} className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id={`cat-${cat}`}
                checked={filters.categories.includes(cat)}
                onChange={() => onToggleCategory(cat)}
                className="w-4 h-4 rounded cursor-pointer accent-[#1B3A6B]"
              />
              <label
                htmlFor={`cat-${cat}`}
                className="text-sm capitalize cursor-pointer select-none"
                style={{ color: '#374151' }}
              >
                {cat.replace(/-/g, ' ')}
              </label>
            </li>
          ))}
        </ul>
      </AccordionSection>

      <AccordionSection
        title="Price"
        badge={filters.prices.length || undefined}
        open={openSections.price}
        onToggle={() => toggle('price')}
      >
        <ul className="space-y-2">
          {PRICE_RANGES.map((range, idx) => (
            <li key={range.label} className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id={`price-${idx}`}
                checked={filters.prices.includes(idx)}
                onChange={() => onTogglePrice(idx)}
                className="w-4 h-4 rounded cursor-pointer accent-[#1B3A6B]"
              />
              <label
                htmlFor={`price-${idx}`}
                className="text-sm cursor-pointer select-none"
                style={{ color: '#374151' }}
              >
                {range.label}
              </label>
            </li>
          ))}
        </ul>
      </AccordionSection>

      <AccordionSection
        title="Minimum Rating"
        badge={filters.minRating > 0 ? 1 : undefined}
        open={openSections.rating}
        onToggle={() => toggle('rating')}
      >
        <ul className="space-y-2">
          {[4, 3, 2].map(r => (
            <li key={r} className="flex items-center gap-2.5">
              <input
                type="radio"
                id={`rating-${r}`}
                name="rating"
                checked={filters.minRating === r}
                onChange={() => onSetMinRating(r)}
                className="w-4 h-4 cursor-pointer accent-[#1B3A6B]"
              />
              <label
                htmlFor={`rating-${r}`}
                className="text-sm cursor-pointer select-none flex items-center gap-1"
                style={{ color: '#374151' }}
              >
                {'★'.repeat(r)}{'☆'.repeat(5 - r)}
                <span className="ml-1" style={{ color: '#6B7280' }}>& above</span>
              </label>
            </li>
          ))}
          {filters.minRating > 0 && (
            <li>
              <button
                onClick={() => onSetMinRating(0)}
                className="text-xs underline mt-1"
                style={{ color: '#6B7280' }}
              >
                Clear
              </button>
            </li>
          )}
        </ul>
      </AccordionSection>
    </div>
  );
}
