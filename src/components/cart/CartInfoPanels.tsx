import { SfIconLock, SfIconCreditCard, SfIconSafetyCheck } from '@storefront-ui/react';

export default function CartInfoPanels() {
  return (
    <>
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
    </>
  );
}
