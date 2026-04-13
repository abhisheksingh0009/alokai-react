export default function ProductListSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: '#F4F6F9' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex gap-8">
        <div className="hidden lg:block w-60 shrink-0 space-y-4">
          {[80, 120, 100].map((h, i) => (
            <div key={i} className="rounded-xl animate-pulse" style={{ background: '#E2E8F0', height: h }} />
          ))}
        </div>
        <div className="flex-1">
          <div className="h-9 w-48 rounded-lg animate-pulse mb-8" style={{ background: '#E2E8F0' }} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden animate-pulse bg-white"
                style={{ border: '1px solid #E2E8F0' }}
              >
                <div className="aspect-square" style={{ background: '#F1F5F9' }} />
                <div className="p-4 space-y-2">
                  <div className="h-3 rounded w-1/3" style={{ background: '#E2E8F0' }} />
                  <div className="h-4 rounded w-3/4" style={{ background: '#E2E8F0' }} />
                  <div className="h-3 rounded w-1/2" style={{ background: '#E2E8F0' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
