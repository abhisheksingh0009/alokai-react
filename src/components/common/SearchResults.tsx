import { useEffect, useId, useRef, useState} from 'react';
import { type Product } from '../../middleware/api/client';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import {
  SfListItem,
  useTrapFocus,
} from '@storefront-ui/react';

interface SearchResultsProps {
  inputVal: string;
  setInputVal: (value: string) => void;
  items: Product[];
  isOpen: boolean;
}
const SearchResuts = ({ inputVal, setInputVal ,items,isOpen}: SearchResultsProps) => {
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

  const filteredItems = items.filter((product) => 
    product.title.toLowerCase().startsWith(inputVal.toLowerCase())
  );

  return (
    <div className="relative h-0 w-131 w-full">
      <ul
      ref={listboxRef}  
        role="listbox"
        className={classNames('relative z-10 rounded-xl shadow-md gap-1 bg-gray-800 border border-neutral-100', {
          hidden: !isOpen || !inputVal.trim(),
        })}
      >
        {filteredItems.length > 0?(filteredItems.map((product, index) => (
          <SfListItem
            key={product.id}
            as="button"
            type="button"
            role="option"
            tabIndex={0}
            onFocus={() => setFocusedIndex(index)}   // track focused item
            onMouseEnter={() => setFocusedIndex(index)}  // sync hover with focus
            onMouseLeave={() => setFocusedIndex(null)}   // clear on leave
            className={classNames(
                'flex items-center gap-4 rounded-xl w-full text-left transition-colors focus:outline-none',
                focusedIndex === index
                ? 'bg-neutral-700 text-black'   // only one item highlighted at a time
                : 'hover:bg-neutral-700'
            )}
            onClick={() => {
              navigate(`/product/${product.id}`);
              setInputVal("");
            }}
            onKeyDown={(e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();  // stops page scroll while navigating list
                }
                if (e.key === 'Enter') {
                e.preventDefault();
                navigate(`/product/${product.id}`);
                setInputVal("");
                }
            }}
            slotPrefix={
              <img 
                src={product.images[0]} 
                alt={product.title} 
                width={50} 
                height={50} 
                className="object-contain"
              />
            }
          >
            <div className="flex flex-col items-start gap-1">
                <span className="text-sm font-semibold">{product.title}</span>
                <span className="text-xs text-gray-500">{product.category}</span>
            </div>
            
          </SfListItem>
        ))
    ):(<li>No Product Found...</li>)}
      </ul>
    </div>
  );
}
export default SearchResuts;