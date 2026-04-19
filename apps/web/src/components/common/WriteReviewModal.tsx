import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SfButton, SfIconClose, SfIconStar, SfIconStarFilled } from '@storefront-ui/react';
import { useAuth } from '../../context/AuthContext';
import { submitReview } from '../../middleware/api/client';

type Props = {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function WriteReviewModal({ productId, isOpen, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ── Not logged in: prompt to login ──────────────────────────────────────────
  if (!user) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative shadow-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: '#9CA3AF' }}
            aria-label="Close"
          >
            <SfIconClose size="sm" />
          </button>

          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: '#EFF6FF' }}
            >
              <SfIconStarFilled size="lg" style={{ color: '#1B3A6B' }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: '#111827' }}>Login to Write a Review</h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              You need to be logged in to share your experience with this product.
            </p>
          </div>

          <div className="flex gap-3">
            <SfButton
              onClick={() => { onClose(); navigate('/login', { state: { from: location.pathname, openReviewModal: true } }); }}
              className="flex-1 !bg-[#1B3A6B] !text-white font-semibold"
            >
              Login
            </SfButton>
            <SfButton variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </SfButton>
          </div>

          <p className="text-center text-xs mt-3" style={{ color: '#9CA3AF' }}>
            Don't have an account?{' '}
            <button
              onClick={() => { onClose(); navigate('/signup'); }}
              className="font-semibold underline"
              style={{ color: '#1B3A6B' }}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── Logged in: review form ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return setError('Please select a star rating.');
    if (!comment.trim()) return setError('Please write a review comment.');

    setSubmitting(true);
    setError('');
    try {
      await submitReview(productId, { comment: comment.trim(), rating });
      setComment('');
      setRating(0);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: '#9CA3AF' }}
          aria-label="Close"
        >
          <SfIconClose size="sm" />
        </button>

        <h2 className="text-xl font-bold mb-1" style={{ color: '#111827' }}>Write a Review</h2>
        <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
          Reviewing as <strong style={{ color: '#374151' }}>{displayName}</strong>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Star Rating Selector */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Rating <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                >
                  {star <= (hovered || rating) ? (
                    <SfIconStarFilled size="lg" style={{ color: '#F59E0B' }} />
                  ) : (
                    <SfIconStar size="lg" style={{ color: '#D1D5DB' }} />
                  )}
                </button>
              ))}
              {(hovered || rating) > 0 && (
                <span className="ml-2 text-sm self-center" style={{ color: '#6B7280' }}>
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hovered || rating]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Your Review <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Share your experience with this product..."
              className="w-full px-3 py-2.5 rounded-xl text-sm resize-none transition-colors focus:outline-none"
              style={{
                border: '1.5px solid #E2E8F0',
                color: '#374151',
              }}
              onFocus={e => (e.target.style.borderColor = '#1B3A6B')}
              onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
            />
            <p className="text-xs mt-1 text-right" style={{ color: '#9CA3AF' }}>
              {comment.length}/1000
            </p>
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#DC2626', background: '#FEF2F2' }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <SfButton
              type="submit"
              disabled={submitting}
              className="flex-1 !bg-[#1B3A6B] !text-white font-semibold"
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </SfButton>
            <SfButton type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </SfButton>
          </div>
        </form>
      </div>
    </div>
  );
}
