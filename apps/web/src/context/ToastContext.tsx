import { createContext, useContext, useState, useCallback } from 'react';
import { SfIconCheckCircle, SfIconClose, SfIconShoppingCart } from '@storefront-ui/react';

const DURATION = 3500;

const ToastContext = createContext<{ showToast: () => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(100);

  const showToast = useCallback(() => {
    setVisible(true);
    setProgress(100);
    setAnimating(false);
    requestAnimationFrame(() => setAnimating(true));

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 30);

    const timer = setTimeout(() => {
      setAnimating(false);
      setTimeout(() => setVisible(false), 400);
    }, DURATION);

    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  const handleClose = () => {
    setAnimating(false);
    setTimeout(() => setVisible(false), 400);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            role="alert"
            className="pointer-events-auto flex items-center gap-3 min-w-[320px] max-w-[420px] bg-positive-100 ring-1 ring-positive-300 rounded-xl shadow-lg px-4 py-3 overflow-hidden"
            style={{
              transform: animating ? 'translateY(0) scale(1)' : 'translateY(-120%) scale(0.95)',
              opacity: animating ? 1 : 0,
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease',
            }}
          >
            {/* Check icon */}
            <SfIconCheckCircle className="text-positive-700 shrink-0" size="lg" />

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="typography-text-sm font-medium text-positive-900 leading-snug">Added to cart</p>
              <p className="typography-text-xs text-positive-700 leading-snug">Product added successfully</p>
            </div>

            {/* Cart icon */}
            <SfIconShoppingCart className="text-positive-600 shrink-0" size="sm" />

            {/* Close button */}
            <button
              type="button"
              aria-label="Close alert"
              onClick={handleClose}
              className="p-1 rounded-md text-positive-700 hover:bg-positive-200 active:bg-positive-300 transition-colors shrink-0"
            >
              <SfIconClose size="sm" />
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-positive-200">
              <div
                className="h-full bg-positive-500 rounded-full transition-[width] duration-[30ms] linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext)!;
}
