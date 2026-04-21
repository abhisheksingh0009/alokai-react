import { SfButton, SfIconLocationOn } from '@storefront-ui/react';

export default function MyAddress() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#EFF6FF' }}>
        <SfIconLocationOn size="lg" className="text-primary-700" />
      </div>

      <div>
        <h3 className="text-base font-bold" style={{ color: '#111827' }}>No address saved yet</h3>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          Your saved delivery addresses will appear here.
        </p>
      </div>

      <SfButton
        className="mt-2"
        variant="primary"
        style={{background:'#1B3A6B'}}
        onClick={() => alert('Add address — coming soon!')}
      >
        + Add Address
      </SfButton>
    </div>
  );
}
