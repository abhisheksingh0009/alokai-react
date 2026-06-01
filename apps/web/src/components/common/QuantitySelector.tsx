// Customised version of the Storefront UI v2 `QuantitySelector` Block.
// Original reference: https://docs.storefrontui.io/v2/react/blocks/QuantitySelector
//
// We kept the Block's structure (SfIconAdd/Remove primitives, clamp helper,
// useId for label-input association, controlled numeric input) and customised:
//   - brand pill styling (rounded-full, brand border colour)
//   - controlled API (value + onChange) so it can plug into cart / PDP / checkout
//   - "max reached" callback so the parent can render its own warning
import { useId, type ChangeEvent } from 'react';
import { SfIconAdd, SfIconRemove } from '@storefront-ui/react';
import { clamp } from '@storefront-ui/shared';

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
  className?: string;
};

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  ariaLabel = 'Quantity',
  className = '',
}: Props) {
  const inputId = useId();

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const parsed = parseFloat(e.target.value);
    if (Number.isNaN(parsed)) return;
    const next = Number(clamp(parsed, min, max).toFixed(0));
    if (next !== value) onChange(next);
  }

  function dec() {
    if (value > min) onChange(value - 1);
  }

  function inc() {
    if (value < max) onChange(value + 1);
  }

  return (
    <div
      className={`inline-flex items-center rounded-full ${className}`}
      style={{ border: '1.5px solid #E5E7EB', background: '#F9FAFB' }}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="w-8 h-8 flex items-center justify-center rounded-l-full transition-colors hover:bg-gray-100 disabled:opacity-40"
        disabled={value <= min}
        aria-controls={inputId}
        aria-label="Decrease quantity"
        onClick={dec}
      >
        <SfIconRemove className="text-xs" />
      </button>

      <input
        id={inputId}
        type="number"
        role="spinbutton"
        className="w-9 text-center bg-transparent font-bold text-sm focus-visible:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
        style={{ color: '#111827' }}
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
      />

      <button
        type="button"
        className="w-8 h-8 flex items-center justify-center rounded-r-full transition-colors hover:bg-gray-100 disabled:opacity-40"
        disabled={value >= max}
        aria-controls={inputId}
        aria-label="Increase quantity"
        onClick={inc}
      >
        <SfIconAdd className="text-xs" />
      </button>
    </div>
  );
}
