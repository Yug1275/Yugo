import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRideByIdApi } from '../../api/rideApi';
import { createReviewApi, getReviewByRideApi } from '../../api/reviewApi';
import StarRating from '../../components/common/StarRating';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Avatar from '../../components/common/Avatar';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const QUICK_COMMENTS = [
  'Great driver, very punctual!',
  'Smooth and safe ride.',
  'Very professional and friendly.',
  'Clean vehicle, comfortable ride.',
  'Knew the routes well.',
  'Would ride again!',
];

const ReviewDriver = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rideRes, reviewRes] = await Promise.all([
          getRideByIdApi(rideId),
          getReviewByRideApi(rideId),
        ]);
        setRide(rideRes.data.data);
        if (reviewRes.data.data) {
          setExistingReview(reviewRes.data.data);
          setRating(reviewRes.data.data.rating);
          setComment(reviewRes.data.data.comment || '');
        }
      } catch {
        setError('Failed to load ride details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [rideId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    setSubmitLoading(true);
    setError('');

    try {
      await createReviewApi({ rideId, rating, comment });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <Loader text="Loading ride details..." />;

  const driver = ride?.driverId;
  const driverName = driver?.userId?.name || 'Your Driver';

  // Already reviewed
  if (existingReview && !submitted) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="page-header">
          <h2 className="page-title">Review Submitted</h2>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
          <h3 style={{ marginBottom: 8 }}>Already Reviewed</h3>
          <p style={{ marginBottom: 20 }}>You have already submitted a review for this ride.</p>

          <div
            style={{
              background: 'var(--color-surface-2)',
              borderRadius: 10,
              padding: '16px 20px',
              marginBottom: 20,
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <StarRating value={existingReview.rating} readonly size="sm" showLabel={false} />
              <span style={{ fontWeight: 700 }}>{existingReview.rating}/5</span>
            </div>
            {existingReview.comment && (
              <p style={{ margin: 0, fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                "{existingReview.comment}"
              </p>
            )}
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
              Submitted on {formatDateTime(existingReview.createdAt)}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="primary" fullWidth onClick={() => navigate('/rider/history')}>
              View Ride History
            </Button>
            <Button variant="ghost" fullWidth onClick={() => navigate('/rider')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Successfully submitted
  if (submitted) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="page-header">
          <h2 className="page-title">Thank You!</h2>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 20px',
              border: '3px solid #f59e0b',
            }}
          >
            ⭐
          </div>
          <h3 style={{ marginBottom: 8 }}>Review Submitted!</h3>
          <p style={{ marginBottom: 8 }}>
            Thank you for rating <strong>{driverName}</strong>.
          </p>
          <p style={{ marginBottom: 24 }}>
            Your feedback helps maintain quality service for all YUGO riders.
          </p>

          {/* Star display */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <StarRating value={rating} readonly size="lg" showLabel={false} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="primary" fullWidth onClick={() => navigate('/rider/book')}>
              Book Another Ride
            </Button>
            <Button variant="ghost" fullWidth onClick={() => navigate('/rider/reviews')}>
              View My Reviews
            </Button>
            <Button variant="ghost" fullWidth onClick={() => navigate('/rider')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Rate Your Driver</h2>
        <p className="page-subtitle">Your feedback helps improve the YUGO experience</p>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Ride + Driver summary */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            {/* Driver avatar */}
            <Avatar user={driver?.userId} name={driverName} size={56} role="driver" />
            <div>
              <h4 style={{ margin: 0 }}>{driverName}</h4>
              {driver?.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <StarRating value={driver.rating} readonly size="sm" showLabel={false} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {driver.rating.toFixed(1)} · {driver.totalRatings || 0} ratings
                  </span>
                </div>
              )}
            </div>
          </div>

          <hr className="divider" />

          {/* Ride summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: '0.9rem' }}>🟢</span>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                {ride?.pickup?.address}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: '0.9rem' }}>🔴</span>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                {ride?.destination?.address}
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid var(--color-border)',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>📅 {formatDateTime(ride?.createdAt)}</span>
            <span>💰 {formatCurrency(ride?.finalFare || ride?.fare)}</span>
          </div>
        </div>

        {/* Rating form */}
        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            {/* Star rating */}
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '1rem' }}>
                How was your ride with {driverName}?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <StarRating
                  value={rating}
                  onChange={setRating}
                  size="lg"
                  showLabel
                />
              </div>
            </div>

            {/* Quick comments */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Quick tags (optional):
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {QUICK_COMMENTS.map((qc) => (
                  <button
                    key={qc}
                    type="button"
                    onClick={() => setComment((prev) => prev ? `${prev} ${qc}` : qc)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      border: `1.5px solid ${comment.includes(qc) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: comment.includes(qc) ? 'var(--color-primary-light)' : 'var(--color-surface)',
                      color: comment.includes(qc) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {qc}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment textarea */}
            <div className="form-group">
              <label className="input-label">Write a review (optional)</label>
              <textarea
                className="input"
                placeholder="Share details about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={500}
                style={{ resize: 'vertical', minHeight: 80 }}
              />
              <span
                style={{
                  fontSize: '0.72rem',
                  color: comment.length > 450 ? 'var(--color-warning)' : 'var(--color-text-muted)',
                  textAlign: 'right',
                  display: 'block',
                  marginTop: 4,
                }}
              >
                {comment.length}/500
              </span>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 14,
                  fontSize: '0.875rem',
                  color: '#991b1b',
                }}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={submitLoading}
              disabled={rating === 0}
            >
              ⭐ Submit Review
            </Button>

            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => navigate('/rider')}
              style={{ marginTop: 10 }}
            >
              Skip for now
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewDriver;