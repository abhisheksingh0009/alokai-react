import { useState } from 'react';
import { SfIconExpandMore } from '@storefront-ui/react';
import { PRICE_RANGES, type Filters } from '../../hooks/useProductFilters';

interface Props {
  categories: string[];
  filters: Filters;
  onToggleCategory: (cat: string) => void;
  onTogglePrice: (idx: number) => void;
  onSetMinRating: (r: number) => void;
  onClear: () => void;
  hasFilters: boolean;
  dark?: boolean;
}

interface AccordionSectionProps {
  title: string;
  badge?: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  dark?: boolean;
}

function AccordionSection({ title, badge, open, onToggle, children, dark }: AccordionSectionProps) {
  return (
    <section className={`border-b ${dark ? 'border-slate-700' : 'border-[#E2E8F0]'}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between py-4 text-left px-2 rounded-lg transition-colors ${dark ? 'hover:bg-slate-800' : ''}`}
      >
        <span className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-[#111827]'}`}>
            {title}
          </span>
          {badge ? (
            <span className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center text-white bg-indigo-500">
              {badge}
            </span>
          ) : null}
        </span>
        <SfIconExpandMore
          size="sm"
          className={dark ? 'text-slate-400' : 'text-[#6B7280]'}
          style={{
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {open && <div className="pb-5 px-2">{children}</div>}
    </section>
  );
}

export default function ProductListFilters({
  categories, filters, onToggleCategory, onTogglePrice, onSetMinRating, onClear, hasFilters, dark = false,
}: Props) {
  const [openSections, setOpenSections] = useState({ category: true, price: true, rating: true });

  function toggle(key: keyof typeof openSections) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div>
      {hasFilters && (
        <div className={`pb-3 border-b ${dark ? 'border-slate-700' : 'border-[#E2E8F0]'}`}>
          <button
            onClick={onClear}
            className={`text-xs font-semibold underline ${dark ? 'text-red-400 hover:text-red-300' : 'text-[#2563EB]'}`}
          >
            Clear all filters
          </button>
        </div>
      )}

      <AccordionSection title="Category" badge={filters.categories.length || undefined} open={openSections.category} onToggle={() => toggle('category')} dark={dark}>
        <ul className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
          {categories.map(cat => (
            <li key={cat} className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id={`cat-${cat}`}
                checked={filters.categories.includes(cat)}
                onChange={() => onToggleCategory(cat)}
                className="w-4 h-4 rounded cursor-pointer accent-indigo-500"
              />
              <label htmlFor={`cat-${cat}`} className={`text-sm capitalize cursor-pointer select-none ${dark ? 'text-slate-300 hover:text-white' : 'text-[#374151]'}`}>
                {cat.replace(/-/g, ' ')}
              </label>
            </li>
          ))}
        </ul>
      </AccordionSection>

      <AccordionSection title="Price" badge={filters.prices.length || undefined} open={openSections.price} onToggle={() => toggle('price')} dark={dark}>
        <ul className="space-y-3.5">
          {PRICE_RANGES.map((range, idx) => (
            <li key={range.label} className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id={`price-${idx}`}
                checked={filters.prices.includes(idx)}
                onChange={() => onTogglePrice(idx)}
                className="w-4 h-4 rounded cursor-pointer accent-indigo-500"
              />
              <label htmlFor={`price-${idx}`} className={`text-sm cursor-pointer select-none ${dark ? 'text-slate-300 hover:text-white' : 'text-[#374151]'}`}>
                {range.label}
              </label>
            </li>
          ))}
        </ul>
      </AccordionSection>

      <AccordionSection title="Minimum Rating" badge={filters.minRating > 0 ? 1 : undefined} open={openSections.rating} onToggle={() => toggle('rating')} dark={dark}>
        <ul className="space-y-3.5">
          {[4, 3, 2].map(r => (
            <li key={r} className="flex items-center gap-2.5">
              <input
                type="radio"
                id={`rating-${r}`}
                name="rating"
                checked={filters.minRating === r}
                onChange={() => onSetMinRating(r)}
                className="w-4 h-4 cursor-pointer accent-indigo-500"
              />
              <label htmlFor={`rating-${r}`} className={`text-sm cursor-pointer select-none flex items-center gap-1 ${dark ? 'text-slate-300' : 'text-[#374151]'}`}>
                <span className="text-amber-400">{'★'.repeat(r)}</span>
                <span className={dark ? 'text-slate-600' : 'text-[#D1D5DB]'}>{'★'.repeat(5 - r)}</span>
                <span className={`ml-1 text-xs ${dark ? 'text-slate-500' : 'text-[#6B7280]'}`}>& above</span>
              </label>
            </li>
          ))}
          {filters.minRating > 0 && (
            <li>
              <button onClick={() => onSetMinRating(0)} className={`text-xs underline mt-1 ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-[#6B7280]'}`}>
                Clear
              </button>
            </li>
          )}
        </ul>
      </AccordionSection>
    </div>
  );
}
