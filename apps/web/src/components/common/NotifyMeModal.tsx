import { useState } from 'react';
import { createPortal } from 'react-dom';
import { SfIconClose, SfIconCheck } from '@storefront-ui/react';
import { subscribeStockNotification } from '../../middleware/api/client';
import { useAuth } from '../../context/AuthContext';

interface Props {
  productId: number;
  productName: string;
  onClose: () => void;
}

export default function NotifyMeModal({ productId, productName, onClose }: Props) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');


  async function handleConfirm() {
    setStatus('loading');
    try {
      await subscribeStockNotification(productId);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl p-6 flex flex-col gap-5 shadow-2xl"
        style={{ background: '#fff' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <SfIconClose size="sm" />
        </button>

        {status === 'done' ? (
          /* Success state */
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: '#DCFCE7' }}
            >
              <SfIconCheck className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: '#111827' }}>You're on the list!</h3>
              <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
                We'll email <strong>{user?.email}</strong> as soon as{' '}
                <strong>{productName}</strong> is back in stock.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: '#1B3A6B' }}
            >
              Got it
            </button>
          </div>
        ) : (
          /* Confirm state */
          <>
            {/* Bell icon */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#EFF6FF' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B3A6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: '#111827' }}>Notify me when available</h3>
                <p className="text-xs" style={{ color: '#6B7280' }}>Get an email when stock is restored</p>
              </div>
            </div>

            {/* Product name */}
            <div
              className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: '#F8F9FB', color: '#374151', border: '1px solid #E2E8F0' }}
            >
              {productName}
            </div>

            {/* Email display */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                Notification will be sent to
              </label>
              <div
                className="rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #86EFAC' }}
              >
                {user?.email}
              </div>
            </div>

            {status === 'error' && (
              <p className="text-xs font-semibold" style={{ color: '#DC2626' }}>{errorMsg}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-gray-50"
                style={{ border: '1.5px solid #E2E8F0', color: '#374151' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={status === 'loading'}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: '#1B3A6B' }}
              >
                {status === 'loading' ? 'Subscribing…' : 'Notify Me'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
