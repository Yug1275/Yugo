import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDriverRidesApi, startRideApi, completeRideApi } from '../../api/driverApi';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDateTime, formatDuration } from '../../utils/helpers';
import { Car, Route, Clock, User, CheckCircle2, Play, MapPin } from '../../components/common/Icons';

const FILTERS = ['all', 'accepted', 'en_route', 'started', 'completed', 'cancelled'];

const DriverRides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRides = async (p = 1, status = 'all') => {
    setLoading(true);
    try {
      const params = { page: p, limit: 8 };
      if (status !== 'all') params.status = status;
      const res = await getDriverRidesApi(params);
      setRides(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRides(page, filter); }, [page, filter]);

  const handleStart = async (rideId) => {
    setActionLoading(rideId + '_start');
    try {
      await startRideApi(rideId);
      fetchRides(page, filter);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start ride');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (rideId) => {
    setActionLoading(rideId + '_complete');
    try {
      await completeRideApi(rideId);
      fetchRides(page, filter);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete ride');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">My Rides</h2>
        <p className="page-subtitle">All rides assigned to you</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: `1.5px solid ${filter === f ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
              color: filter === f ? '#fff' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader text="Loading rides..." />
      ) : rides.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-text-muted)', marginBottom: 12 }}>
            <Car size={36} strokeWidth={1.5} />
          </div>
          <p className="empty-state-text">No rides found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rides.map((ride) => (
            <div key={ride._id} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>

                {/* Left: ride info */}
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <Badge status={ride.status} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {formatDateTime(ride.createdAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.875rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#166534', fontWeight: 800, fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, flexShrink: 0, letterSpacing: '0.5px' }}><MapPin size={10} /> FROM</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{ride.pickup?.address}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.875rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#991b1b', fontWeight: 800, fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, flexShrink: 0, letterSpacing: '0.5px' }}><MapPin size={10} /> TO</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{ride.destination?.address}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: '0.8rem', color: 'var(--color-text-muted)', flexWrap: 'wrap', alignItems: 'center' }}>
                    {ride.distanceKm && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Route size={14} /> {ride.distanceKm} km</span>}
                    {ride.durationMin && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {formatDuration(ride.durationMin)}</span>}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><User size={14} /> {ride.riderId?.name || 'Rider'}</span>
                  </div>
                </div>

                {/* Right: fare + actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {formatCurrency(ride.finalFare || ride.fare)}
                  </span>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {ride.status === 'accepted' && (
                      <button
                        onClick={() => handleStart(ride._id)}
                        disabled={actionLoading === ride._id + '_start'}
                        style={{
                          padding: '7px 14px',
                          background: 'var(--color-primary)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 7,
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {actionLoading === ride._id + '_start' ? 'Starting...' : (
                          <>
                            <Play size={12} fill="#fff" /> Start Ride
                          </>
                        )}
                      </button>
                    )}

                    {ride.status === 'started' && (
                      <button
                        onClick={() => handleComplete(ride._id)}
                        disabled={actionLoading === ride._id + '_complete'}
                        style={{
                          padding: '7px 14px',
                          background: 'var(--color-success)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 7,
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {actionLoading === ride._id + '_complete' ? 'Completing...' : (
                          <>
                            <CheckCircle2 size={12} /> Complete
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 24 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Page {page} of {pagination.pages}
          </span>
          <button className="btn btn-ghost btn-sm" disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default DriverRides;