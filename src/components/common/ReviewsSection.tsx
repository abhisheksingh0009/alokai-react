import { useMemo } from 'react';
import { useAsync } from 'react-use';
import Review from './Review';
import { fetchComments } from '../../middleware/api/client';
import type { Comment } from '../../middleware/api/client';

// Derive a deterministic star rating (3–5) from comment id
function deriveRating(id: number): number {
  return (id % 3) + 3;
}

// Fisher-Yates shuffle seeded with productId (LCG random)
function seededPick(all: Comment[], seed: number, count: number): Comment[] {
  const arr = [...all];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = Math.imul(s, 1664525) + 1013904223;
    const j = (s >>> 0) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

type Props = { productId: number };

export default function ReviewsSection({ productId }: Props) {
  // Fetch all 30 comments once; re-fetch only if the pool changes (never)
  const { loading, error, value: allComments } = useAsync(() => fetchComments(30), []);

  // Deterministically pick 6 comments for this product
  const comments = useMemo(() => {
    if (!allComments) return [];
    return seededPick(allComments, productId, 6);
  }, [allComments, productId]);

  return (
    <section
      id="reviews"
      className="rounded-2xl p-6"
      style={{ background: '#fff', border: '1px solid #E2E8F0' }}
    >
      {/* Header */}
      <div className="flex items-baseline gap-3 flex-wrap mb-6">
        <h2 className="text-xl font-bold" style={{ color: '#111827' }}>Customer Reviews</h2>
        {!loading && !error && (
          <span className="text-sm" style={{ color: '#6B7280' }}>
            Showing {comments.length} reviews
          </span>
        )}
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl" style={{ background: '#E2E8F0' }} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-center py-8" style={{ color: '#6B7280' }}>
          Could not load reviews. Please try again later.
        </p>
      )}

      {/* Reviews grid */}
      {!loading && !error && comments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comments.map(comment => (
            <Review
              key={comment.id}
              author={comment.user.fullName}
              rating={deriveRating(comment.id)}
              body={comment.body}
              meta={comment.likes > 0 ? `${comment.likes} ${comment.likes === 1 ? 'like' : 'likes'}` : undefined}
              verified={true}
              avatar={`https://i.pravatar.cc/40?img=${(comment.user.id % 70) + 1}`}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && comments.length === 0 && !loading && (
        <p className="text-sm text-center py-8" style={{ color: '#6B7280' }}>
          No reviews yet. Be the first to review!
        </p>
      )}
    </section>
  );
}
