import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrackingMap from '../../components/map/TrackingMap';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { getRideByIdApi, cancelRideApi } from '../../api/rideApi';
import { fetchRoute } from '../../utils/mapHelpers';
import { formatCurrency, formatDateTime, formatDuration } from '../../utils/helpers';

// Human-readable status messages
const STATUS_INFO = {
  pending: {
    label: 'Looking for a driver...',
    desc: 'Your ride request has been sent. Waiting for a driver to accept.',
    icon: '🔍',
    color: 'var(--color-warning)',
  },
  accepted: {
    label: 'Driver is on the way',
    desc: 'A driver has accepted your ride and is heading to your pickup point.',
    icon: '🚗',
    color: 'var(--color-primary)',
  },
  en_route: {
    label: 'Driver is nearby',
    desc: 'Your driver is almost at the pickup location.',
    icon: '📍',
    color: 'var(--color-primary)',
  },
  started: {
    label: 'Ride in progress',
    desc: "You're on your way! Sit back and relax.",
    icon: '🛣️',
    color: 'var(--color-success)',
  },
  completed: {
    label: 'Ride completed',
    desc: 'You have reached your destination. Hope you enjoyed the ride!',
    icon: '✅',
    color: 'var(--color-success)',
  },
  cancelled: {
    label: 'Ride cancelled',
    desc: 'This ride has been cancelled.',
    icon: '❌',
    color: 'var(--color-danger)',
  },
};

const RideTracking = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchRide = useCallback(async () => {
    try {
      const res = await getRideByIdApi(rideId);
      const rideData = res.data.data;
      setRide(rideData);

      // Fetch route once when we have both coordinates
      if (
        rideData.pickup?.coordinates &&
        rideData.destination?.coordinates &&
        !routeCoordinates
      ) {
        const route = await fetchRoute(
          rideData.pickup.coordinates,
          rideData.destination.coordinates
        );
        if (route) setRouteCoordinates(route.coordinates);
      }
    } catch {
      setError('Failed to load ride details.');
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  // Initial fetch
  useEffect(() => {
    fetchRide();
  }, [fetchRide]);

  // Poll for status updates every 5 seconds if ride is active
  useEffect(() => {
    const activeStatuses = ['pending', 'accepted', 'en_route', 'started'];
    if (!ride || !activeStatuses.includes(ride.status)) return;

    const interval = setInterval(() => {
      fetchRide();
    }, 5000);

    return () => clearInterval(interval);
  }, [ride?.status, fetchRide]);

  const handleCancel = async () => {
    setCancelLoading(true);
    setCancelError('');
    try {
      await cancelRideApi(rideId, cancelReason || 'Cancelled by rider');
      setCancelModalOpen(false);
      fetchRide(); // refresh ride state
    } catch (err) {
      setCancelError(err.response?.data?.error || 'Failed to cancel ride.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <Loader fullPage text="Loading ride..." />;

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
        <h3>{error}</h3>
        <Button variant="primary" onClick={() => navigate('/rider')} className="" style={{ marginTop: 16 }}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!ride) return null;

  const statusInfo = STATUS_INFO[ride.status] || STATUS_INFO.pending;
  const driver = ride.driverId;
  const driverUser = driver?.userId;
  const canCancel = ['pending', 'accepted', 'en_route'].includes(ride.status);
  const isFinished = ['completed', 'cancelled'].includes(ride.status);

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">Ride Tracking</h2>
          <p className="page-subtitle" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            ID: {ride._id}
          </p>
        </div>
        <Badge status={ride.status} />
      </div>

      <div className="tracking-grid">

        {/* ─── Left panel ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Status card */}
          <div
            className="card"
            style={{
              borderLeft: `4px solid ${statusInfo.color}`,
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: '1.5rem' }}>{statusInfo.icon}</span>
              <h4 style={{ margin: 0, color: statusInfo.color }}>{statusInfo.label}</h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{statusInfo.desc}</p>

            {/* Live pulse indicator for active rides */}
            {['pending', 'accepted', 'en_route'].includes(ride.status) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--color-success)',
                    display: 'inline-block',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 600 }}>
                  Live — updating every 5s
                </span>
              </div>
            )}
          </div>

          {/* Route card */}
          <div className="card">
            <h4 style={{ marginBottom: 14 }}>Route</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2 }}>🟢</span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>PICKUP</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
                    {ride.pickup?.address}
                  </p>
                </div>
              </div>
              <div
                style={{
                  borderLeft: '2px dashed var(--color-border)',
                  marginLeft: 11,
                  height: 16,
                }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2 }}>🔴</span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>DESTINATION</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
                    {ride.destination?.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Trip meta */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 14,
                paddingTop: 14,
                borderTop: '1px solid var(--color-border)',
                fontSize: '0.82rem',
                color: 'var(--color-text-secondary)',
                flexWrap: 'wrap',
              }}
            >
              {ride.distanceKm && <span>📏 {ride.distanceKm} km</span>}
              {ride.durationMin && <span>⏱ {formatDuration(ride.durationMin)}</span>}
              <span>💰 {formatCurrency(ride.finalFare || ride.fare)}</span>
            </div>
          </div>

          {/* Driver card — only show when driver assigned */}
          {driver && driverUser && (
            <div className="card">
              <h4 style={{ marginBottom: 14 }}>Your Driver</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  {driverUser?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{driverUser?.name}</p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    ⭐ {driver.rating || 'N/A'} · {driver.totalRides || 0} rides
                  </p>
                </div>
              </div>
              {driverUser?.phone && (
                <a
                  href={`tel:${driverUser.phone}`}
                  className="btn btn-ghost btn-sm btn-full"
                  style={{ textDecoration: 'none', textAlign: 'center' }}
                >
                  📞 Call Driver
                </a>
              )}
            </div>
          )}

          {/* Fare card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {ride.status === 'completed' ? 'FINAL FARE' : 'ESTIMATED FARE'}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Booked {formatDateTime(ride.createdAt)}
                </p>
              </div>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {formatCurrency(ride.finalFare || ride.fare)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {canCancel && (
              <Button
                variant="danger"
                fullWidth
                onClick={() => setCancelModalOpen(true)}
              >
                Cancel Ride
              </Button>
            )}

            {ride.status === 'completed' && (
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(`/rider/review/${ride._id}`)}
              >
                ⭐ Rate Driver
              </Button>
            )}

            {isFinished && (
              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/rider')}
              >
                ← Back to Dashboard
              </Button>
            )}

            {isFinished && (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate('/rider/book')}
              >
                Book Another Ride
              </Button>
            )}
          </div>
        </div>

        {/* ─── Right panel: Map ──────────────────────────────── */}
        <div className="map-panel">
          <TrackingMap
            pickup={ride.pickup}
            destination={ride.destination}
            driverLocation={driver?.currentLocation?.lat ? driver.currentLocation : null}
            routeCoordinates={routeCoordinates}
            height="420px"
          />

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 10,
              padding: '8px 12px',
              background: 'var(--color-surface)',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              fontSize: '0.78rem',
              color: 'var(--color-text-secondary)',
              flexWrap: 'wrap',
            }}
          >
            <span>🟢 Pickup</span>
            <span>🔴 Destination</span>
            <span>🚗 Driver</span>
          </div>
        </div>
      </div>

      {/* ─── Cancel Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => { setCancelModalOpen(false); setCancelError(''); }}
        title="Cancel Ride"
        size="sm"
      >
        <p style={{ marginBottom: 16, fontSize: '0.9rem' }}>
          Are you sure you want to cancel this ride? This action cannot be undone.
        </p>

        <div className="form-group">
          <label className="input-label">Reason (optional)</label>
          <input
            className="input"
            placeholder="e.g. Change of plans"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>

        {cancelError && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 12,
              fontSize: '0.85rem',
              color: '#991b1b',
            }}
          >
            {cancelError}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => { setCancelModalOpen(false); setCancelError(''); }}
          >
            Keep Ride
          </Button>
          <Button
            variant="danger"
            fullWidth
            loading={cancelLoading}
            onClick={handleCancel}
          >
            Yes, Cancel
          </Button>
        </div>
      </Modal>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
};

export default RideTracking;