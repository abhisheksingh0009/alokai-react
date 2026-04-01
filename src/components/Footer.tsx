import { Link } from 'react-router-dom';
import { SfButton, SfLink, SfIconFavorite } from '@storefront-ui/react';

const footerLinks = {
  shop: [
    { label: 'Women', to: '/products' },
    { label: 'Men', to: '/products' },
    { label: 'Kids', to: '/products' },
    { label: 'Electronics', to: '/products' },
    { label: 'All Products', to: '/products' },
  ],
  help: [
    { label: 'FAQ', to: '/' },
    { label: 'Shipping & Returns', to: '/' },
    { label: 'Order Tracking', to: '/' },
    { label: 'Size Guide', to: '/' },
    { label: 'Contact Us', to: '/' },
  ],
  company: [
    { label: 'About Us', to: '/' },
    { label: 'Careers', to: '/' },
    { label: 'Press', to: '/' },
    { label: 'Sustainability', to: '/' },
    { label: 'Affiliates', to: '/' },
  ],
};

const socialLinks = [
  { label: 'Facebook', href: '#', icon: 'f' },
  { label: 'Instagram', href: '#', icon: 'in' },
  { label: 'Twitter', href: '#', icon: 'tw' },
  { label: 'YouTube', href: '#', icon: 'yt' },
];

const paymentMethods = ['Visa', 'Mastercard', 'PayPal', 'Apple Pay'];

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link to="/" className="text-white font-bold text-2xl hover:text-green-200 transition-colors">
              My Store
            </Link>
            <p className="text-green-200 text-sm leading-relaxed">
              Your one-stop destination for quality products across fashion, electronics, and more.
              Shop with confidence with our easy returns and fast shipping.
            </p>
    
            <div className="flex gap-2 mt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-green-700 hover:bg-green-600 flex items-center justify-center text-white text-xs font-bold transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

    
          <div>
            <h3 className="font-semibold text-white text-base mb-4 uppercase tracking-wide">Shop</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.shop.map(({ label, to }) => (
                <li key={label}>
                  <SfLink
                    as={Link}
                    to={to}
                    variant="secondary"
                    className="text-green-200 hover:text-white no-underline hover:underline text-sm transition-colors"
                  >
                    {label}
                  </SfLink>
                </li>
              ))}
            </ul>
          </div>

      
          <div>
            <h3 className="font-semibold text-white text-base mb-4 uppercase tracking-wide">Help</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.help.map(({ label, to }) => (
                <li key={label}>
                  <SfLink
                    as={Link}
                    to={to}
                    variant="secondary"
                    className="text-green-200 hover:text-white no-underline hover:underline text-sm transition-colors"
                  >
                    {label}
                  </SfLink>
                </li>
              ))}
            </ul>
          </div>

  
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-semibold text-white text-base mb-4 uppercase tracking-wide">Company</h3>
              <ul className="flex flex-col gap-2">
                {footerLinks.company.map(({ label, to }) => (
                  <li key={label}>
                    <SfLink
                      as={Link}
                      to={to}
                      variant="secondary"
                      className="text-green-200 hover:text-white no-underline hover:underline text-sm transition-colors"
                    >
                      {label}
                    </SfLink>
                  </li>
                ))}
              </ul>
            </div>

       
            <div>
              <h3 className="font-semibold text-white text-base mb-3 uppercase tracking-wide">Newsletter</h3>
              <p className="text-green-200 text-sm mb-3">Get the latest deals and news.</p>
              <form
                className="flex gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 min-w-0 px-3 py-2 rounded-md text-neutral-900 text-sm outline-none focus:ring-2 focus:ring-green-300"
                  aria-label="Email for newsletter"
                />
                <SfButton
                  type="submit"
                  size="sm"
                  className="bg-white !text-green-700 hover:bg-green-50 whitespace-nowrap"
                  slotPrefix={<SfIconFavorite size="xs" />}
                >
                  Subscribe
                </SfButton>
              </form>
            </div>
          </div>
        </div>
      </div>


      <div className="border-t border-green-700">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-green-300 text-sm">
            &copy; {new Date().getFullYear()} My Store. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="bg-green-700 text-green-100 text-xs px-2 py-1 rounded font-medium"
              >
                {method}
              </span>
            ))}
          </div>
          <div className="flex gap-4">
            <SfLink
              as={Link}
              to="/"
              variant="secondary"
              className="text-green-300 hover:text-white no-underline hover:underline text-xs"
            >
              Privacy Policy
            </SfLink>
            <SfLink
              as={Link}
              to="/"
              variant="secondary"
              className="text-green-300 hover:text-white no-underline hover:underline text-xs"
            >
              Terms of Service
            </SfLink>
            <SfLink
              as={Link}
              to="/"
              variant="secondary"
              className="text-green-300 hover:text-white no-underline hover:underline text-xs"
            >
              Cookies
            </SfLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
