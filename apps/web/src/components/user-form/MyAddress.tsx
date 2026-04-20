export default function MyAddress() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      {/* Location icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: '#EFF6FF' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B3A6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      </div>

      <div>
        <h3 className="text-base font-bold" style={{ color: '#111827' }}>No address saved yet</h3>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          Your saved delivery addresses will appear here.
        </p>
      </div>

      <button
        className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
        style={{ background: '#1B3A6B' }}
        onClick={() => alert('Add address — coming soon!')}
      >
        + Add Address
      </button>
    </div>
  );
}
