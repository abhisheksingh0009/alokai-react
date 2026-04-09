import { SfIconLock, SfIconCreditCard, SfIconSafetyCheck } from '@storefront-ui/react';
import PromoCode from './PromoCode';

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

      {/* Order Summary card */}
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
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#162d54';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#1B3A6B';
          }}
        >
          Go to Checkout
        </button>
      </div>

      {/* Trust badges */}
      <div className="flex justify-around text-xs py-3" style={{ color: '#9CA3AF' }}>
        <span className="flex flex-col items-center gap-1"><span className="text-xl">🔒</span>Secure</span>
        <span className="flex flex-col items-center gap-1"><span className="text-xl">🚚</span>Free shipping</span>
        <span className="flex flex-col items-center gap-1"><span className="text-xl">↩️</span>Easy returns</span>
      </div>

      {/* Helping Hand */}
      <div className="rounded-2xl p-6 text-center flex flex-col gap-3" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
        <h3 className="text-sm font-extrabold uppercase tracking-widest" style={{ color: '#111827' }}>A Helping Hand?</h3>
        <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
          If you have any queries or need help with your order, our customer service team are on hand to assist from{' '}
          <span className="font-semibold" style={{ color: '#374151' }}>Monday – Friday: 10am–4pm.</span>
        </p>
      </div>

      {/* Secure Shopping */}
      <div className="rounded-2xl p-6 text-center flex flex-col gap-3" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
        <h3 className="text-sm font-extrabold uppercase tracking-widest" style={{ color: '#111827' }}>Secure Shopping</h3>
        <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
          Your security is important to us. For details of how we protect your payment and personal details, read our{' '}
          <span className="underline cursor-pointer" style={{ color: '#1B3A6B' }}>Privacy Statement.</span>
        </p>
        <div className="flex items-center justify-center gap-6 pt-1">
          <span className="flex flex-col items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
            <SfIconLock className="w-6 h-6" style={{ color: '#1B3A6B' }} />
            Secure
          </span>
          <span className="flex flex-col items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
            <SfIconCreditCard className="w-6 h-6" style={{ color: '#1B3A6B' }} />
            Payments
          </span>
          <span className="flex flex-col items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
            <SfIconSafetyCheck className="w-6 h-6" style={{ color: '#16A34A' }} />
            Protected
          </span>
        </div>
      </div>

    </div>
  );
}
