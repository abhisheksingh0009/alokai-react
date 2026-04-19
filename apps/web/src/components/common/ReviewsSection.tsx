import { SfButton, SfIconStarFilled } from '@storefront-ui/react';
import Review from './Review';
import WriteReviewModal from './WriteReviewModal';
import type { Review as ReviewType } from '../../middleware/api/client';

type Props = {
  productId: number;
  reviews: ReviewType[] | undefined;
  loading: boolean;
  error: Error | undefined;
  onWriteReview: () => void;
  modalOpen: boolean;
  onModalClose: () => void;
  onReviewSuccess: () => void;
};

export default function ReviewsSection({
  productId,
  reviews,
  loading,
  error,
  onWriteReview,
  modalOpen,
  onModalClose,
  onReviewSuccess,
}: Props) {
  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <>
      <WriteReviewModal
        productId={productId}
        isOpen={modalOpen}
        onClose={onModalClose}
        onSuccess={onReviewSuccess}
      />

      <section
        id="reviews"
        className="rounded-2xl p-6"
        style={{ background: '#fff', border: '1px solid #E2E8F0' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-xl font-bold" style={{ color: '#111827' }}>Customer Reviews</h2>
            {!loading && !error && reviews && reviews.length > 0 && (
              <span className="text-sm" style={{ color: '#6B7280' }}>
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            )}
          </div>

          <SfButton
            onClick={onWriteReview}
            size="sm"
            className="!bg-[#1B3A6B] !text-white font-semibold flex items-center gap-1.5"
          >
            <SfIconStarFilled size="xs" />
            Write a Review
          </SfButton>
        </div>

        {/* Average rating summary */}
        {!loading && !error && reviews && reviews.length > 0 && (
          <div
            className="flex items-center gap-4 mb-6 p-4 rounded-xl"
            style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
          >
            <span className="text-4xl font-bold" style={{ color: '#111827' }}>
              {avgRating.toFixed(1)}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <SfIconStarFilled
                    key={star}
                    size="sm"
                    style={{ color: star <= Math.round(avgRating) ? '#F59E0B' : '#E5E7EB' }}
                  />
                ))}
              </div>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
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
        {!loading && !error && reviews && reviews.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map(review => (
              <Review
                key={review.id}
                author={review.providerName}
                rating={review.rating}
                body={review.comment}
                meta={review.likes > 0 ? `${review.likes} ${review.likes === 1 ? 'like' : 'likes'}` : undefined}
                verified={true}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && (!reviews || reviews.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <SfIconStarFilled size="xl" style={{ color: '#E2E8F0' }} />
            <p className="text-sm font-medium" style={{ color: '#374151' }}>No reviews yet</p>
            <p className="text-sm" style={{ color: '#6B7280' }}>Be the first to share your experience!</p>
          </div>
        )}
      </section>
    </>
  );
}
