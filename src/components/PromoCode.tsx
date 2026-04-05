import { useState } from 'react';
import { SfButton } from '@storefront-ui/react';

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

  function handleApply() {
    const code = input.trim().toUpperCase();
    if (!code) return;

    if (VALID_CODES[code]) {
      setApplied(code);
      setError('');
      onApply(VALID_CODES[code], code);
    } else {
      setError('Invalid promo code. Try SAVE10, SAVE20 or WELCOME.');
    }
  }

  function handleRemove() {
    setApplied('');
    setInput('');
    setError('');
    onApply(0, '');
  }

  return (
    <div className="flex flex-col gap-2 border-t border-neutral-100 pt-4">
      <p className="text-sm font-medium text-neutral-700">Promo Code</p>

      {applied ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold text-sm">✓</span>
            <span className="text-green-700 text-sm font-semibold">{applied}</span>
            <span className="text-green-600 text-xs">({VALID_CODES[applied] * 100}% off)</span>
          </div>
          <button
            onClick={handleRemove}
            className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code"
              value={input}
              onChange={e => { setInput(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleApply()}
              className="flex-1 min-w-0 px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:border-neutral-400 uppercase placeholder:normal-case"
            />
            <SfButton size="sm" variant="secondary" onClick={handleApply}>
              Apply
            </SfButton>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <p className="text-xs text-neutral-400">Try: SAVE10, SAVE20, WELCOME</p>
        </>
      )}
    </div>
  );
}
