import { useEffect, useState } from 'react';
import { getMyReviewsApi } from '../../api/reviewApi';
import StarRating from '../../components/common/StarRating';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchReviews = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getMyReviewsApi({ page: p, limit: 8 });
      setReviews(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(page); }, [page]);

  // Average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">My Reviews</h2>
        <p className="page-subtitle">All reviews you have submitted</p>
      </div>

      {/* Summary */}
      {reviews.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div className="card" style={{ background: '#fef3c7', border: 'none' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>
              Avg Rating Given
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: '1.4rem' }}>⭐</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#92400e' }}>
                {avgRating}
              </span>
            </div>
          </div>
          <div className="card" style={{ background: '#dbeafe', border: 'none' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>
              Total Reviews
            </p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e40af', marginTop: 4 }}>
              {pagination.total || reviews.length}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <Loader text="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <p className="empty-state-text">
            You haven't submitted any reviews yet. Complete a ride to leave a review!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reviews.map((review) => {
            const driverName = review.driverId?.userId?.name || 'Driver';
            return (
              <div key={review._id} className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  {/* Driver info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                    >
                      {driverName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>
                        {driverName}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {formatDateTime(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Star rating */}
                  <StarRating value={review.rating} readonly size="sm" showLabel={false} />
                </div>

                {/* Comment */}
                {review.comment && (
                  <p
                    style={{
                      margin: '0 0 12px',
                      fontSize: '0.875rem',
                      color: 'var(--color-text-secondary)',
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                    }}
                  >
                    "{review.comment}"
                  </p>
                )}

                {/* Ride info */}
                {review.rideId && (
                  <div
                    style={{
                      background: 'var(--color-surface-2)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.8rem',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <span>🟢</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {review.rideId.pickup?.address}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span>🔴</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {review.rideId.destination?.address}
                      </span>
                    </div>
                    {review.rideId.finalFare && (
                      <p style={{ margin: '6px 0 0', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {formatCurrency(review.rideId.finalFare || review.rideId.fare)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            marginTop: 24,
          }}
        >
          <button
            className="btn btn-ghost btn-sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Page {page} of {pagination.pages}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page === pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default MyReviews;