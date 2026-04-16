import { useEffect, useRef, useState } from 'react';
import { type Product } from '../../middleware/api/client';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import {
  SfListItem,
  SfButton,
  SfIconChevronRight,
  useTrapFocus,
} from '@storefront-ui/react';

interface SearchResultsProps {
  inputVal: string;
  setInputVal: (value: string) => void;
  items: Product[];
  isOpen: boolean;
  onSelect?: () => void;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-cyan-100 text-cyan-800 rounded px-0.5 not-italic">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

const categoryColors: Record<string, string> = {
  beauty: 'bg-pink-100 text-pink-700',
  electronics: 'bg-blue-100 text-blue-700',
  clothing: 'bg-purple-100 text-purple-700',
  kids: 'bg-yellow-100 text-yellow-700',
  men: 'bg-indigo-100 text-indigo-700',
  women: 'bg-rose-100 text-rose-700',
};
const getCategoryColor = (cat: string) =>
  categoryColors[cat.toLowerCase()] ?? 'bg-neutral-100 text-neutral-600';

const SearchResults = ({ inputVal, setInputVal, items, isOpen, onSelect }: SearchResultsProps) => {
  const navigate = useNavigate();
  const listboxRef = useRef<HTMLUListElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useTrapFocus(listboxRef, {
    arrowKeysUpDown: true,
    activeState: isOpen,
    initialFocus: false,
  });

  useEffect(() => {
    if (!isOpen) setFocusedIndex(null);
  }, [isOpen]);

  const filteredItems = items
    .filter((p) => p.title.toLowerCase().includes(inputVal.toLowerCase()))
    .slice(0, 6);

  const handleSelect = (id: number) => {
    navigate(`/product/${id}`);
    setInputVal('');
    onSelect?.();
  };

  const handleViewAll = () => {
    navigate(`/products?search=${encodeURIComponent(inputVal)}`);
    setInputVal('');
    onSelect?.();
  };

  if (!isOpen || !inputVal.trim()) return null;

  return (
    <div className="absolute left-0 right-0 top-full mt-1 z-50">
      <div className="rounded-xl shadow-2xl bg-white border border-neutral-200 overflow-hidden">

        {filteredItems.length > 0 ? (
          <>
            {/* Result count header */}
            <p className="px-4 pt-3 pb-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
            </p>

            <ul ref={listboxRef} role="listbox">
              {filteredItems.map((product, index) => (
                <SfListItem
                  key={product.id}
                  as="button"
                  type="button"
                  role="option"
                  tabIndex={0}
                  selected={focusedIndex === index}
                  onFocus={() => setFocusedIndex(index)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onMouseLeave={() => setFocusedIndex(null)}
                  className={classNames(
                    'w-full !items-center gap-1 transition-colors',
                    focusedIndex === index ? '!bg-neutral-50' : 'hover:!bg-neutral-50'
                  )}
                  onClick={() => handleSelect(product.id)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleSelect(product.id); }
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') e.preventDefault();
                  }}
                  slotPrefix={
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  }
                  slotSuffix={
                    product.discountPercentage ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {Math.round(product.discountPercentage)}% off
                      </span>
                    ) : undefined
                  }
                >
                  <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                    <span className="text-sm font-medium text-neutral-900 truncate w-full text-left">
                      <HighlightMatch text={product.title} query={inputVal} />
                    </span>
                    <span className={classNames(
                      'text-xs font-medium px-1.5 py-0.5 rounded-full',
                      getCategoryColor(product.category ?? '')
                    )}>
                      {product.category}
                    </span>
                  </div>
                </SfListItem>
              ))}
            </ul>

            {/* View all footer */}
            <div className="border-t border-neutral-100 px-2 py-1.5">
              <SfButton
                variant="tertiary"
                size="sm"
                className="w-full !text-cyan-600 hover:!bg-cyan-50 !justify-between font-semibold"
                slotSuffix={<SfIconChevronRight size="sm" />}
                onClick={handleViewAll}
              >
                View all results for "{inputVal}"
              </SfButton>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
            <span className="text-3xl">🔍</span>
            <p className="text-sm font-semibold text-neutral-700">No results for "{inputVal}"</p>
            <p className="text-xs text-neutral-400">Try a different keyword or browse all products</p>
            <SfButton
              variant="tertiary"
              size="sm"
              className="!text-cyan-600 hover:!bg-cyan-50 font-semibold mt-1"
              onClick={() => { navigate('/products'); setInputVal(''); }}
            >
              Browse all products
            </SfButton>
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchResults;
