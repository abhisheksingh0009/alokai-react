import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  SfButton,
  SfIconShoppingCart,
  SfIconFavorite,
  SfIconPerson,
  SfIconMenu,
  SfIconClose,
  SfIconSearch,
  SfDrawer,
  useDisclosure,
} from '@storefront-ui/react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import SearchResults from '../common/SearchResults';
import { fetchProducts, type Product } from '../../middleware/api/client';
import { useNavigation } from '../../context/NavigationContext';

const categories = ['Women', 'Men', 'Kids', 'Electronics'];

export default function Header() {
  const { cart } = useCart()!;
  const { user, logout } = useAuth();
  const { isOpen: isDrawerOpen, open: openDrawer, close: closeDrawer } = useDisclosure();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [inputVal, setInputVal] = useState<string>('');
  const [items, setItems] = useState<Product[]>([]);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { selectCategoryByNav, setSelectCategoryByNav } = useNavigation();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const location = useLocation();


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
    if (!inputVal.trim()) {
      navigate('/');
      return;
    }
    const firstMatch = items.find((p) =>
      p.title.toLowerCase().startsWith(inputVal.toLowerCase())
    );
    if (firstMatch) {
      navigate(`/product/${firstMatch.id}`);
      setInputVal('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSuggestion) {
        const firstItem = document.querySelector('[role="listbox"] [role="option"]') as HTMLElement;
        firstItem?.focus();
      }
    }
  };

  const [activeNode, setActiveNode] = useState<string[]>([]);
  const handleOpenMenu = (menuType: string[]) => () => {
    setActiveNode(menuType);
    open();
  };

  const seen = new Set<string>();
  const uniqueMenuNodes = items?.filter(node => {
    if (!node.category || !node.id) return false; // skip invalid
    if (seen.has(node.category)) return false;    // skip duplicates
    seen.add(node.category);
    return true;
  });


  return (
    <header className="bg-slate-900 text-white">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-3 md:px-6">

        {/* Mobile search expanded — replaces entire bar */}
        {mobileSearchOpen ? (
          <form className="flex flex-1 md:hidden" onSubmit={(e) => { handleSearchSubmit(e); setMobileSearchOpen(false); }}>
            <div className="relative flex-1">
              <div className="flex w-full bg-slate-700/60 border border-slate-500 rounded-lg overflow-hidden focus-within:border-cyan-400 focus-within:bg-slate-700 transition-all">
                <input
                  ref={mobileSearchRef}
                  type="text"
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 bg-transparent text-white text-sm outline-none placeholder:text-slate-400"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  className="px-3 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="Close search"
                  onClick={() => { setMobileSearchOpen(false); setInputVal(''); }}
                >
                  <SfIconClose />
                </button>
              </div>
              <SearchResults
                inputVal={inputVal}
                setInputVal={setInputVal}
                items={items}
                isOpen={showSuggestion}
                onSelect={() => setMobileSearchOpen(false)}
              />
            </div>
          </form>
        ) : (
          <>
            {/* Hamburger - mobile only */}
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
            <Link to="/" className="flex items-center gap-2 mr-6 whitespace-nowrap">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="34" height="34" rx="9" fill="url(#logoGrad)" />
                <path d="M11 14h12l-1.6 9.5H12.6L11 14z" fill="white" />
                <path d="M14 14c0-1.657 1.343-3 3-3s3 1.343 3 3" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                <defs>
                  <linearGradient id="logoGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="hidden md:inline text-xl font-black tracking-widest uppercase bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                ALOKAI-MART
              </span>
            </Link>
          </>
        )}

        {/* Desktop search */}
        <form className="hidden md:flex flex-1" onSubmit={handleSearchSubmit}>
          <div className="container relative">
            <div className="flex w-full bg-slate-700/60 border border-slate-500 rounded-lg overflow-hidden focus-within:border-cyan-400 focus-within:bg-slate-700 transition-all">
              <input
                type="text"
                placeholder="Search products..."
                className="flex-1 px-4 py-2 bg-transparent text-white text-sm outline-none placeholder:text-slate-400"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button type="submit" className="px-4 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                <SfIconSearch />
              </button>
            </div>
            <SearchResults inputVal={inputVal} setInputVal={setInputVal} items={items} isOpen={showSuggestion} />
          </div>
        </form>

        {/* Right actions — hidden on mobile when search is open */}
        <div className={`flex items-center gap-4 ml-auto ${mobileSearchOpen ? 'hidden md:flex' : ''}`}>
          {/* Search icon - mobile only */}
          <button
            className="md:hidden text-white"
            aria-label="Open search"
            onClick={() => { setMobileSearchOpen(true); setTimeout(() => mobileSearchRef.current?.focus(), 50); }}
          >
            <SfIconSearch />
          </button>

          <Link to="/wishlist" className="flex items-center gap-1 text-white font-medium hover:underline whitespace-nowrap" aria-label="Wishlist">
            <SfIconFavorite className="text-white" />
          </Link>

          {/* Account dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              className="flex items-center gap-1.5 text-white font-medium whitespace-nowrap"
              aria-label="Account"
              onClick={() => setIsAccountOpen(prev => !prev)}
            >
              <SfIconPerson className="text-white" />
              <span className="hidden md:inline text-sm">{user ? user.name : ''}</span>
            </button>

            {isAccountOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 text-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-700">
                <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <SfIconPerson className="text-white" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">My Account</span>
                </div>

                {user ? (
                  <>
                    <Link
                      to="/account"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-800 transition-colors"
                      onClick={() => setIsAccountOpen(false)}
                    >
                      <span className="text-emerald-400">&#9679;</span>
                      Profile
                    </Link>
                    <div className="border-t border-slate-700 mx-3" />
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-800 text-red-400 hover:text-red-300 transition-colors"
                      onClick={() => { logout(); setIsAccountOpen(false); }}
                    >
                      <span>&#8594;</span>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-800 transition-colors"
                      onClick={() => setIsAccountOpen(false)}
                    >
                      <span className="text-indigo-400">&#9679;</span>
                      Login
                    </Link>
                    <div className="border-t border-slate-700 mx-3" />
                    <Link
                      to="/signup"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-800 transition-colors"
                      onClick={() => setIsAccountOpen(false)}
                    >
                      <span className="text-cyan-400">&#9679;</span>
                      Sign up
                    </Link>
                  </>
                )}
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

      {/* Desktop nav - main categories only */}
      <nav className="hidden md:block bg-slate-800">
        <ul className="flex px-6">
          <li>
            <Link to="/" className={`block px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 ${selectCategoryByNav === null ? 'border-b-2 border-cyan-400 bg-slate-600 text-cyan-400 font-bold' : ''
              }`} onClick={() => { setSelectCategoryByNav(null) }}>
              Home
            </Link>
          </li>
          {uniqueMenuNodes?.map((menuNode) => (
            <li key={menuNode.id}>
              <button


                onClick={() => { setSelectCategoryByNav(menuNode.category); navigate('/products'); handleOpenMenu([(menuNode.id).toString()]) }}

                className={`px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 transition-colors capitalize  ${selectCategoryByNav === menuNode?.category ? 'border-b-2 border-cyan-400 bg-slate-600 text-cyan-400 font-bold' : ''
                  }`}
              >
                {menuNode.category}
              </button>

            </li>
          ))}
          <li>
            <Link to="/products" className={`block px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 ${location.pathname === '/products' && selectCategoryByNav === undefined ? 'border-b-2 border-cyan-400 bg-slate-600 text-cyan-400 font-bold' : ''
              }`} onClick={() => { setSelectCategoryByNav(undefined) }} >
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
        className="w-[300px] max-w-full bg-slate-900 text-white flex flex-col h-full overflow-y-auto !z-[9999]"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <SfIconMenu className="text-white !w-4 !h-4" />
            </div>
            <span className="font-bold text-base tracking-wide text-white">Menu</span>
          </div>
          <SfButton variant="tertiary" square onClick={closeDrawer} aria-label="Close menu" className="text-slate-400 hover:text-white">
            <SfIconClose />
          </SfButton>
        </div>

        {/* Category section */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 px-2 mb-1">Categories</p>
          <ul className="flex flex-col gap-1">
            {categories.map((cat) => (
              <li key={cat}>
                <Link
                  to="/products"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  {cat}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/products"
                onClick={closeDrawer}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-emerald-400 hover:bg-slate-800 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                All Products
              </Link>
            </li>
          </ul>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 mx-4 my-2" />

        {/* Account section */}
        <div className="px-4 pb-2">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 px-2 mb-1">Account</p>
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                to="/login"
                onClick={closeDrawer}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                onClick={closeDrawer}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                Sign up
              </Link>
            </li>
          </ul>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 mx-4 my-2" />

      </SfDrawer>
    </header>
  );
}
