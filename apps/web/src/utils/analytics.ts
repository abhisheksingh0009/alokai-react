// Google Analytics 4 (GA4) e-commerce tracking.
// Follows GA4's recommended e-commerce event model:
// https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Replace with your actual GA4 Measurement ID (also update index.html).
export const GA_MEASUREMENT_ID = 'GA_MEASUREMENT_ID';

const isReady = () => typeof window !== 'undefined' && typeof window.gtag === 'function';

// Initialize Google Analytics
export const initGA = () => {
  if (isReady()) {
    window.gtag('config', GA_MEASUREMENT_ID);
  }
};

/** A single product line item in GA4's standard `items` shape. */
export interface AnalyticsItem {
  id: string | number;
  name: string;
  price: number;
  quantity?: number;
  currency?: string;
}

const toGa4Item = (item: AnalyticsItem) => ({
  item_id: String(item.id),
  item_name: item.name,
  price: item.price,
  quantity: item.quantity ?? 1,
});

// page_view — fire on every client-side route change (see usePageTracking)
export const trackPageView = (path: string, title?: string) => {
  if (!isReady()) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
  });
};

// view_item — fire when a product detail page is viewed
export const trackViewItem = (item: AnalyticsItem) => {
  if (!isReady()) return;
  window.gtag('event', 'view_item', {
    currency: item.currency ?? 'USD',
    value: item.price,
    items: [toGa4Item(item)],
  });
};

// add_to_cart — fire when a product is added to the cart
export const trackAddToCart = (item: AnalyticsItem) => {
  if (!isReady()) return;
  const quantity = item.quantity ?? 1;
  window.gtag('event', 'add_to_cart', {
    currency: item.currency ?? 'USD',
    value: item.price * quantity,
    items: [toGa4Item(item)],
  });

  console.log('🛒 GA4 add_to_cart', item);
};
