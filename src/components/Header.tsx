import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SfButton,
  SfIconShoppingCart,
  SfIconFavorite,
  SfIconPerson,
  SfIconMenu,
  SfIconClose,
  SfIconSearch,
  SfDrawer,
  SfListItem,
  SfIconChevronRight,
  SfIconChevronLeft,
  useDisclosure,
} from '@storefront-ui/react';
import { useCart } from '../context/CartContext';
import SearchResuts from '../search/SearchResults';
import { fetchProducts, type Product } from '../middleware/api/client';

//poc use
const categories = [
  {
    label: 'Women',
    subcategories: ['Clothing', 'Shoes', 'Accessories', 'Bags'],
  },
  {
    label: 'Men',
    subcategories: ['Clothing', 'Shoes', 'Accessories', 'Sportswear'],
  },
  {
    label: 'Kids',
    subcategories: ['Girls', 'Boys', 'Baby', 'Toys'],
  },
  {
    label: 'Electronics',
    subcategories: ['Phones', 'Laptops', 'Audio', 'Cameras'],
  },
];

export default function Header() {
  const { cart } = useCart()!;
  const { isOpen: isDrawerOpen, open: openDrawer, close: closeDrawer } = useDisclosure();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [inputVal,setInputVal]=useState<string>("");
  const [items, setItems] = useState<Product[]>([]);
  const [showSuggestion,setShowSuggestion]=useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setActiveMegaMenu(null);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchProducts().then(data => {
      setItems(data);
    })
  }, []);

  useEffect(()=>{
    if (inputVal.length >= 3) {
    setShowSuggestion(true);
  } else {
    setShowSuggestion(false);
  }
  },[inputVal]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!inputVal.trim()){
      navigate('/');
      return;
    }
    const firstMatch = items.find((p) => 
      p.title.toLowerCase().startsWith(inputVal.toLowerCase())
    );

    if (firstMatch) {
      navigate(`/product/${firstMatch.id}`);
      setInputVal("");
    }
  };

  const handleKeyDown=(e:React.KeyboardEvent<HTMLInputElement>)=>{
    if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
      e.preventDefault(); 
      if (showSuggestion) {
        const firstItem = document.querySelector('[role="listbox"] [role="option"]') as HTMLElement;
        firstItem?.focus();
      }
    }
  }

  return (
    <header className="bg-slate-900 text-white">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-3 md:px-6">
        {/* Hamburger - mobile */}
        <SfButton
          variant="tertiary"
          square
          className="text-white md:hidden"
          aria-label="Open menu"
          onClick={openDrawer}
        >
          <SfIconMenu className="text-white" />
        </SfButton>

        {/* Logo */}
        <Link to="/" className="text-white font-bold text-xl mr-6 whitespace-nowrap">
          My Store
        </Link>

        {/* Search */}
        <form className="hidden md:flex flex-1" onSubmit={handleSearchSubmit}>
          <div className="container relative">
            <div className="flex w-full bg-slate-700/60 border border-slate-500 rounded-lg overflow-hidden focus-within:border-cyan-400 focus-within:bg-slate-700 transition-all">
              <input
                type="text"
                placeholder="Search products..."
                className="flex-1 px-4 py-2 bg-transparent text-white text-sm outline-none placeholder:text-slate-400"
                value={inputVal}
                onChange={(e)=>setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button type="submit" className="px-4 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                <SfIconSearch />
              </button>
            </div>
            <SearchResuts inputVal={inputVal} setInputVal={setInputVal} items={items} isOpen={showSuggestion}/>
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-4 ml-auto">
          <Link to="/wishlist" className="flex items-center gap-1 text-white font-medium hover:underline whitespace-nowrap" aria-label="Wishlist">
            <SfIconFavorite className="text-white" />
          </Link>
          <div className="relative" ref={accountRef}>
            <button
              className="flex items-center gap-1 text-white font-medium hover:underline whitespace-nowrap"
              aria-label="Account"
              onClick={() => setIsAccountOpen(prev => !prev)}
            >
              <SfIconPerson className="text-white" />
              <span className="hidden md:inline"></span>
            </button>
            {isAccountOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white text-neutral-900 rounded-lg shadow-xl z-50 py-1 border border-neutral-100">
                <Link
                  to="/login"
                  className="block px-4 py-2.5 text-sm font-medium hover:bg-neutral-100 hover:text-emerald-600"
                  onClick={() => setIsAccountOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-4 py-2.5 text-sm font-medium hover:bg-neutral-100 hover:text-emerald-600"
                  onClick={() => setIsAccountOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <Link to="/cart" className="relative flex items-center gap-1 text-white font-medium hover:underline whitespace-nowrap">
            <SfIconShoppingCart className="text-white" />
            Cart
            {cartCount > 0 && (
              <span className="ml-1 bg-emerald-400 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Desktop nav with megamenu */}
      <nav className="hidden md:block bg-slate-800" ref={megaMenuRef}>
        <ul className="flex px-6">
          {categories.map((cat) => (
            <li key={cat.label} className="relative">
              <button
                className={`px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 transition-colors ${
                  activeMegaMenu === cat.label ? 'bg-slate-700' : ''
                }`}
                onMouseEnter={() => setActiveMegaMenu(cat.label)}
                onClick={() => setActiveMegaMenu(activeMegaMenu === cat.label ? null : cat.label)}
              >
                {cat.label}
              </button>

              {/* Megamenu dropdown */}
              {activeMegaMenu === cat.label && (
                <div
                  className="absolute left-0 top-full z-50 bg-white text-neutral-900 shadow-xl rounded-b-lg min-w-[200px] py-4"
                  onMouseLeave={() => setActiveMegaMenu(null)}
                >
                  <ul>
                    {cat.subcategories.map((sub) => (
                      <li key={sub}>
                        <Link
                          to="/products"
                          className="block px-6 py-2 text-sm hover:bg-neutral-100 hover:text-emerald-600"
                          onClick={() => setActiveMegaMenu(null)}
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
          <li>
            <Link to="/products" className="block px-4 py-3 text-sm font-medium text-white hover:bg-slate-700">
              All Products
            </Link>
          </li>
        </ul>
      </nav>

      {/* Mobile drawer */}
      <SfDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        placement="left"
        className="bg-white text-neutral-900 w-[320px] max-w-full"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-lg">Menu</span>
          <SfButton variant="tertiary" square onClick={closeDrawer} aria-label="Close menu">
            <SfIconClose />
          </SfButton>
        </div>

        {activeCategory ? (
          <>
            <button
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-neutral-100 w-full"
              onClick={() => setActiveCategory(null)}
            >
              <SfIconChevronLeft size="sm" /> Back
            </button>
            <p className="px-4 py-2 font-semibold text-neutral-700">{activeCategory}</p>
            <ul>
              {categories
                .find((c) => c.label === activeCategory)
                ?.subcategories.map((sub) => (
                  <li key={sub}>
                    <SfListItem
                      as={Link}
                      to="/products"
                      onClick={closeDrawer}
                      className="px-4"
                    >
                      {sub}
                    </SfListItem>
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <ul>
            {categories.map((cat) => (
              <li key={cat.label}>
                <SfListItem
                  suffix={<SfIconChevronRight size="sm" />}
                  className="px-4"
                  onClick={() => setActiveCategory(cat.label)}
                >
                  {cat.label}
                </SfListItem>
              </li>
            ))}
            <li>
              <SfListItem as={Link} to="/products" onClick={closeDrawer} className="px-4">
                All Products
              </SfListItem>
            </li>
            <li>
              <SfListItem as={Link} to="/wishlist" onClick={closeDrawer} className="px-4">
              </SfListItem>
            </li>
            <li>
              <SfListItem as={Link} to="/login" onClick={closeDrawer} className="px-4">
                Login
              </SfListItem>
            </li>
            <li>
              <SfListItem as={Link} to="/signup" onClick={closeDrawer} className="px-4">
                Sign up
              </SfListItem>
            </li>
            <li>
              <SfListItem as={Link} to="/cart" onClick={closeDrawer} className="px-4">
                Cart ({cartCount})
              </SfListItem>
            </li>
          </ul>
        )}
      </SfDrawer>
    </header>
  );
}
