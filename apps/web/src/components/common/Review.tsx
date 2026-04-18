import { SfIconCheck, SfIconStarFilled } from '@storefront-ui/react';

type ReviewProps = {
  author: string;
  rating: number;
  body: string;
  meta?: string;
  verified?: boolean;
};

// Generate a consistent background colour from the author name
function avatarColor(name: string): string {
  const colors = ['#1B3A6B', '#2563EB', '#7C3AED', '#DB2777', '#059669', '#D97706', '#DC2626'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Review({ author, rating, body, meta, verified = true }: ReviewProps) {
  const initials = author
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <article
      className="w-full p-4 rounded-xl"
      style={{ border: '1px solid #E2E8F0', background: '#fff' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2.5">
          {/* Initials avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
            style={{ background: avatarColor(author) }}
          >
            {initials}
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm font-semibold" style={{ color: '#111827' }}>{author}</span>
            {/* Inline stars — no SfRating to avoid stacking bug */}
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <SfIconStarFilled
                    key={star}
                    size="xs"
                    style={{ color: star <= rating ? '#F59E0B' : '#E5E7EB' }}
                  />
                ))}
              </div>
              {meta && <span className="text-xs" style={{ color: '#9CA3AF' }}>· {meta}</span>}
            </div>
          </div>
        </div>

        {verified && (
          <p className="flex items-center text-xs font-medium shrink-0" style={{ color: '#1B3A6B' }}>
            <SfIconCheck size="xs" className="mr-1" />
            Verified
          </p>
        )}
      </div>

      <p className="text-sm leading-relaxed text-left" style={{ color: '#374151' }}>{body}</p>
    </article>
  );
}
