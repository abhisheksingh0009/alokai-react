import Loader from '../common/Loader';

export default function ProductListSkeleton() {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5" style={{ background: '#F4F6F9' }}>
      <Loader size="3xl" className="text-primary-700" />
      <p className="text-base font-semibold tracking-wide" style={{ color: '#1B3A6B' }}>Loading products…</p>
    </div>
  );
}
