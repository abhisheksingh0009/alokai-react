import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  SfButton,
  SfIconShoppingCart,
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
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setActiveMegaMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-green-700 text-white">
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
        <form className="hidden md:flex flex-1">
          <div className="flex w-full border-2 border-white rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 px-4 py-2 text-neutral-900 text-base outline-none"
            />
            <button type="submit" className="bg-white px-4 flex items-center justify-center text-green-700 hover:bg-green-50">
              <SfIconSearch />
            </button>
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-4 ml-auto">
          <Link to="/products" className="text-white font-medium hover:underline whitespace-nowrap">
            Products
          </Link>
          <Link to="/cart" className="relative flex items-center gap-1 text-white font-medium hover:underline whitespace-nowrap">
            <SfIconShoppingCart className="text-white" />
            Cart
            {cartCount > 0 && (
              <span className="ml-1 bg-white text-green-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Desktop nav with megamenu */}
      <nav className="hidden md:block bg-green-800" ref={megaMenuRef}>
        <ul className="flex px-6">
          {categories.map((cat) => (
            <li key={cat.label} className="relative">
              <button
                className={`px-4 py-3 text-sm font-medium text-white hover:bg-green-600 transition-colors ${
                  activeMegaMenu === cat.label ? 'bg-green-600' : ''
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
                          className="block px-6 py-2 text-sm hover:bg-neutral-100 hover:text-green-700"
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
            <Link to="/products" className="block px-4 py-3 text-sm font-medium text-white hover:bg-green-600">
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
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-green-700 hover:bg-neutral-100 w-full"
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
