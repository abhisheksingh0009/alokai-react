import { useState } from 'react';
import Loader from './Loader';

const VALID_CODES: Record<string, number> = {
  SAVE10: 0.10,
  SAVE20: 0.20,
  WELCOME: 0.15,
};

type Props = {
  onApply: (discountRate: number, code: string) => void;
};

export default function PromoCode({ onApply }: Props) {
  const [input, setInput] = useState('');
  const [applied, setApplied] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleApply() {
    const code = input.trim().toUpperCase();
    if (!code || loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (VALID_CODES[code]) {
        setApplied(code);
        setError('');
        onApply(VALID_CODES[code], code);
      } else {
        setError('Invalid promo code.');
      }
    }, 2000);
  }

  function handleRemove() {
    setApplied('');
    setInput('');
    setError('');
    onApply(0, '');
  }

  return (
    <div className="flex-1 w-full">
      <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6B7280' }}>
        Promo / Coupon Code
      </label>

      {applied ? (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: '#16A34A' }}>✓</span>
            <span className="text-sm font-semibold" style={{ color: '#15803D' }}>{applied}</span>
            <span className="text-xs" style={{ color: '#16A34A' }}>({VALID_CODES[applied] * 100}% off)</span>
          </div>
          <button
            onClick={handleRemove}
            className="text-xs transition-colors"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setError(''); }}
              placeholder="Enter code (e.g. SAVE10)"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed uppercase placeholder:normal-case"
              style={{
                border: error ? '1.5px solid #EF4444' : '1.5px solid #E5E7EB',
                color: '#111827',
                background: '#F9FAFB',
              }}
              onKeyDown={e => e.key === 'Enter' && handleApply()}
            />
            <button
              onClick={handleApply}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold shrink-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[72px]"
              style={{ border: '1.5px solid #1B3A6B', color: '#1B3A6B', background: 'transparent' }}
              onMouseEnter={e => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#1B3A6B';
                  (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = '#1B3A6B';
              }}
            >
              {loading ? <Loader size="sm" /> : 'Apply'}
            </button>
          </div>
          {error && <p className="mt-1.5 text-xs" style={{ color: '#EF4444' }}>{error}</p>}
        </>
      )}
    </div>
  );
}
