import { SfIconClose } from "@storefront-ui/react";
import { useAlokaiI18nContext } from "../../context/AlokaiI18nContext";
import { PRICE_RANGES, type Filters } from "../../hooks/useProductFilters";

type Props = {
  filters: Filters;
  onToggleCategory: (cat: string) => void;
  onToggleBrand: (brand: string) => void;
  onTogglePrice: (idx: number) => void;
  onSetMinRating: (r: number) => void;
  onToggleInStockOnly: () => void;
  onClear: () => void;
};

type Chip = { key: string; label: string; remove: () => void };

export default function ActiveFilterChips({
  filters, onToggleCategory, onToggleBrand, onTogglePrice, onSetMinRating, onToggleInStockOnly, onClear,
}: Props) {
  const { t } = useAlokaiI18nContext();
  const chips: Chip[] = [
    ...filters.categories.map(c => ({
      key: `cat-${c}`,
      label: c.replace(/-/g, " "),
      remove: () => onToggleCategory(c),
    })),
    ...filters.brands.map(b => ({
      key: `brand-${b}`,
      label: b,
      remove: () => onToggleBrand(b),
    })),
    ...filters.prices.map(idx => ({
      key: `price-${idx}`,
      label: PRICE_RANGES[idx].label,
      remove: () => onTogglePrice(idx),
    })),
    ...(filters.minRating > 0
      ? [{
          key: "rating",
          label: `${filters.minRating}★ ${t('plp.and_above')}`,
          remove: () => onSetMinRating(0),
        }]
      : []),
    ...(filters.inStockOnly
      ? [{
          key: "stock",
          label: t('plp.in_stock_only'),
          remove: onToggleInStockOnly,
        }]
      : []),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span
        className="text-xs font-bold uppercase tracking-widest mr-1"
        style={{ color: "#6B7280" }}
      >
        {t('plp.active_label')}
      </span>
      {chips.map(chip => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          aria-label={`Remove ${chip.label} filter`}
          className="group inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-[1.02]"
          style={{
            background: "#EFF6FF",
            color: "#1B3A6B",
            border: "1px solid #DBEAFE",
          }}
        >
          <span className="capitalize">{chip.label}</span>
          <SfIconClose
            size="sm"
            className="opacity-60 group-hover:opacity-100 transition-opacity"
          />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold underline ml-1 transition-opacity hover:opacity-70"
          style={{ color: "#2563EB" }}
        >
          {t('plp.clear_all_short')}
        </button>
      )}
    </div>
  );
}
