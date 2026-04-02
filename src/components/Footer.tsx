import { Link } from 'react-router-dom';
import { SfButton, SfLink } from '@storefront-ui/react';

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
    <footer style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' }} className="text-white">
      {/* Top accent line */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444, #ec4899, #8b5cf6, #3b82f6, #10b981)' }} />

      <div className="max-w-7xl mx-auto px-4 py-14 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="text-2xl font-extrabold tracking-tight" style={{ background: 'linear-gradient(90deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              My Store
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your one-stop destination for quality products across fashion, electronics, and more.
            </p>
            <div className="flex gap-2 mt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-amber-400">Shop</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.shop.map(({ label, to }) => (
                <li key={label}>
                  <SfLink as={Link} to={to} variant="secondary" className="text-slate-300 hover:text-amber-400 no-underline text-sm transition-colors">
                    {label}
                  </SfLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-pink-400">Help</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.help.map(({ label, to }) => (
                <li key={label}>
                  <SfLink as={Link} to={to} variant="secondary" className="text-slate-300 hover:text-pink-400 no-underline text-sm transition-colors">
                    {label}
                  </SfLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Newsletter */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-purple-400">Company</h3>
              <ul className="flex flex-col gap-2">
                {footerLinks.company.map(({ label, to }) => (
                  <li key={label}>
                    <SfLink as={Link} to={to} variant="secondary" className="text-slate-300 hover:text-purple-400 no-underline text-sm transition-colors">
                      {label}
                    </SfLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-3 uppercase tracking-widest text-cyan-400">Newsletter</h3>
              <p className="text-slate-400 text-sm mb-3">Get the latest deals and news.</p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 min-w-0 px-3 py-2 rounded-md bg-slate-700 border border-slate-500 text-white text-sm outline-none focus:border-cyan-400 placeholder:text-slate-400"
                  aria-label="Email for newsletter"
                />
                <SfButton type="submit" size="sm" style={{ background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }} className="!text-white whitespace-nowrap font-semibold border-0">
                  Join
                </SfButton>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-600/80">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} My Store. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <span key={method} className="border border-slate-500 text-slate-200 text-xs px-2 py-1 rounded font-medium bg-slate-700/50">
                {method}
              </span>
            ))}
          </div>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookies'].map((label) => (
              <SfLink key={label} as={Link} to="/" variant="secondary" className="text-slate-400 hover:text-white no-underline hover:underline text-xs transition-colors">
                {label}
              </SfLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
