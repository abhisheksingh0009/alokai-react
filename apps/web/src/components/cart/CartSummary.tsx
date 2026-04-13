import PromoCode from './PromoCode';
import CartInfoPanels from './CartInfoPanels';

type Props = {
  cartLength: number;
  subtotal: number;
  savings: number;
  discount: number;
  grandTotal: number;
  onApplyPromo: (rate: number, code: string) => void;
};

export default function CartSummary({ cartLength, subtotal, savings, discount, grandTotal, onApplyPromo }: Props) {
  return (
    <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6 flex flex-col gap-3">

      {/* Order Summary */}
      <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
        <h2 className="text-lg font-extrabold" style={{ color: '#111827' }}>Order Summary</h2>

        <div className="flex justify-between text-sm" style={{ color: '#6B7280' }}>
          <span>Subtotal ({cartLength} item{cartLength > 1 ? 's' : ''})</span>
          <span style={{ color: '#111827', fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
        </div>

        {savings > 0 && (
          <div className="flex justify-between text-sm font-medium" style={{ color: '#16A34A' }}>
            <span>Product savings</span>
            <span>-${savings.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm" style={{ color: '#6B7280' }}>
          <span>Shipping</span>
          <span className="font-semibold" style={{ color: '#16A34A' }}>Free</span>
        </div>

        <div className="flex justify-between text-sm items-center" style={{ color: '#6B7280' }}>
          <span className="shrink-0">Estimated delivery</span>
          <span className="font-medium text-right" style={{ color: '#374151' }}>3–5 business days</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm font-medium" style={{ color: '#16A34A' }}>
            <span>Promo discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}

        <div style={{ borderTop: '1px solid #E5E7EB' }} className="pt-4">
          <PromoCode onApply={onApplyPromo} />
        </div>

        <div
          className="flex justify-between font-extrabold text-lg pt-4"
          style={{ borderTop: '1px solid #E5E7EB', color: '#111827' }}
        >
          <span>Grand Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>

        <button
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
          style={{ background: '#1B3A6B', color: '#fff', border: 'none' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#162d54'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1B3A6B'; }}
        >
          Go to Checkout
        </button>
      </div>

      <CartInfoPanels />
    </div>
  );
}
