// Google Analytics utility for tracking events
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = 'GA_MEASUREMENT_ID'; // Replace with your actual GA4 Measurement ID

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID);
  }
};

// Track add to cart event
export const trackAddToCart = (productTitle: string, productId: string | number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: 0, // You can add product price here if needed
      items: [{
        item_id: productId,
        item_name: productTitle,
        quantity: 1
      }]
    });
    
    // Also log to console for POC demonstration
    console.log('🛒 GA Event: Add to Cart', { productTitle, productId });
  }
};