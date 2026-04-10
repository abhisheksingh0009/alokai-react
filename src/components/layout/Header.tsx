import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SfButton,
  SfInput,
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
import { useCart } from '../../context/CartContext';
import SearchResults from '../common/SearchResults';
import { fetchProducts, type Product } from '../../middleware/api/client';

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

  useEffect(() => {
    setShowSuggestion(inputVal.length >= 1);
  }, [inputVal]);

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
        <Link to="/" className="flex items-center gap-2 mr-6 whitespace-nowrap group relative">
          {/* Logo mark — premium tote bag */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#06b6d4"/>
              </linearGradient>
              <linearGradient id="logoSheen" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" stopOpacity="0.15"/>
                <stop offset="1" stopColor="white" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="11" fill="url(#logoBg)"/>
            <rect width="40" height="40" rx="11" fill="url(#logoSheen)"/>
            {/* Tote bag body — trapezoid */}
            <path d="M10 18h20l-2 13H12L10 18z" fill="white" fillOpacity="0.95"/>
            {/* Two rope handles */}
            <path d="M15 18c0-3 1.5-6 5-6s5 3 5 6" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.7"/>
            {/* Horizontal band across bag */}
            <path d="M10.6 22.5h18.8" stroke="url(#logoBg)" strokeWidth="2"/>
            {/* Bold A on bag */}
            <path d="M18 29l2-5 2 5M18.8 27.5h2.4" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          {/* Wordmark */}
          <div className="hidden md:flex flex-col leading-none gap-0.5">
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-amber-400/80">Premium</span>
            <span className="text-lg font-black tracking-[0.12em] uppercase bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">ALOKAI-MART</span>
          </div>
        </Link>

        {/* Search */}
        <form className="hidden md:flex flex-1" onSubmit={handleSearchSubmit}>
          <div className="relative w-full flex items-center">
            <SfInput
              value={inputVal}
              placeholder="Search products..."
              className="!text-white !placeholder-slate-400 !bg-transparent"
              wrapperClassName="flex-1 !bg-slate-700/60 !border-slate-500 !border-r-0 !rounded-r-none focus-within:!border-cyan-400 focus-within:!bg-slate-700 transition-all"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              slotPrefix={<SfIconSearch className="text-slate-400" />}
              slotSuffix={
                inputVal ? (
                  <SfButton
                    type="button"
                    variant="tertiary"
                    square
                    size="sm"
                    className="!text-slate-400 hover:!text-white"
                    aria-label="Clear search"
                    onClick={() => setInputVal('')}
                  >
                    <SfIconClose size="sm" />
                  </SfButton>
                ) : undefined
              }
            />
            <SfButton
              type="submit"
              className="!bg-cyan-500 hover:!bg-cyan-400 !text-white !rounded-l-none !rounded-r-lg shrink-0 self-stretch !h-auto"
            >
              Search
            </SfButton>
            <SearchResults inputVal={inputVal} setInputVal={setInputVal} items={items} isOpen={showSuggestion}/>
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
              <span className="ml-1 bg-emerald-400 text-slate-900 text-xs font-bold rounded-full w-5 h-5 hidden md:flex items-center justify-center">
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
                  className="px-4"
                  onClick={() => setActiveCategory(cat.label)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{cat.label}</span>
                    <SfIconChevronRight size="sm" />
                  </div>
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
