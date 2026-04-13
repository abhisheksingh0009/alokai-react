import { SfRating, SfIconCheck } from '@storefront-ui/react';

type ReviewProps = {
  author: string;
  rating: number;
  body: string;
  meta?: string;
  verified?: boolean;
  avatar?: string;
};

export default function Review({ author, rating, body, meta, verified = true, avatar }: ReviewProps) {
  return (
    <article
      className="w-full p-4 rounded-xl"
      style={{ border: '1px solid #E2E8F0', background: '#fff' }}
    >
      {/* Header row: avatar+info on left, verified badge on right */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2">
          <img
            src={avatar ?? 'https://storage.googleapis.com/sfui_docs_artifacts_bucket_public/production/review_avatar.png'}
            alt={`${author} avatar`}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm font-semibold text-left" style={{ color: '#111827' }}>{author}</span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7280' }}>
              <SfRating value={rating} max={5} size="xs" />
              {meta && <span>{meta}</span>}
            </span>
          </div>
        </div>
        {verified && (
          <p className="flex items-center text-xs font-medium shrink-0" style={{ color: '#1B3A6B' }}>
            <SfIconCheck size="xs" className="mr-1" />
            Verified purchase
          </p>
        )}
      </div>

      {/* Review body — explicit left align */}
      <p className="text-sm leading-relaxed text-left" style={{ color: '#374151' }}>{body}</p>
    </article>
  );
}
