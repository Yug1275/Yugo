import { useEffect, useState } from 'react';
import { getRiderRidesApi } from '../../api/rideApi';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDateTime, formatDuration } from '../../utils/helpers';

const FILTERS = ['all', 'completed', 'cancelled', 'pending'];

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchRides = async (currentPage = 1, status = 'all') => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 8 };
      if (status !== 'all') params.status = status;
      const res = await getRiderRidesApi(params);
      setRides(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides(page, filter);
  }, [page, filter]);

  const handleFilterChange = (f) => {
    setFilter(f);
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">Ride History</h2>
        <p className="page-subtitle">All your past and current rides</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              border: `1.5px solid ${filter === f ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
              color: filter === f ? '#fff' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.15s ease',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Rides list */}
      {loading ? (
        <Loader text="Loading rides..." />
      ) : rides.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🕒</div>
          <p className="empty-state-text">No rides found for this filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rides.map((ride) => (
            <div key={ride._id} className="card" style={{ padding: '16px 20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                {/* Left: Route info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Badge status={ride.status} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {formatDateTime(ride.createdAt)}
                    </span>
                  </div>

                  {/* Route */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 700 }}>FROM</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {ride.pickup?.address || 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 700 }}>TO</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {ride.destination?.address || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 16,
                      marginTop: 10,
                      fontSize: '0.8rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {ride.distanceKm && <span>📏 {ride.distanceKm} km</span>}
                    {ride.durationMin && <span>⏱ {formatDuration(ride.durationMin)}</span>}
                    {ride.cancelReason && (
                      <span style={{ color: 'var(--color-danger)' }}>
                        Reason: {ride.cancelReason}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Fare */}
                <div style={{ textAlign: 'right' }}>
                  <p
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}
                  >
                    {formatCurrency(ride.finalFare || ride.fare)}
                  </p>
                  {ride.finalFare && ride.finalFare !== ride.fare && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        margin: 0,
                        textDecoration: 'line-through',
                      }}
                    >
                      Est. {formatCurrency(ride.fare)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            marginTop: 28,
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

export default RideHistory;