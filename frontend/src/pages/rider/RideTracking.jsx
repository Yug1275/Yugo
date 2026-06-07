import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrackingMap from '../../components/map/TrackingMap';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { getRideByIdApi, cancelRideApi } from '../../api/rideApi';
import { useRiderSocket, useRideEmitter } from '../../hooks/useRideSocket';
import { fetchRoute } from '../../utils/mapHelpers';
import { formatCurrency, formatDateTime, formatDuration } from '../../utils/helpers';

const STATUS_INFO = {
  pending: {
    label: 'Looking for a driver...',
    desc: 'Your ride request has been sent. Waiting for a driver to accept.',
    icon: '🔍',
    color: 'var(--color-warning)',
  },
  accepted: {
    label: 'Driver accepted your ride',
    desc: 'A driver is on the way to your pickup point.',
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
  const { emitCancelRide } = useRideEmitter();

  const [ride, setRide] = useState(null);
  const [rideStatus, setRideStatus] = useState('pending');
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState(null);
  const [liveDriverLocation, setLiveDriverLocation] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [statusHistory, setStatusHistory] = useState([]);

  // Fetch ride once on mount
  const fetchRide = useCallback(async () => {
    try {
      const res = await getRideByIdApi(rideId);
      const rideData = res.data.data;
      setRide(rideData);
      setRideStatus(rideData.status);

      if (rideData.driverId) {
        setDriverInfo(rideData.driverId);
        if (rideData.driverId.currentLocation?.lat) {
          setLiveDriverLocation(rideData.driverId.currentLocation);
        }
      }

      if (rideData.pickup?.coordinates && rideData.destination?.coordinates && !routeCoordinates) {
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

  useEffect(() => {
    fetchRide();
  }, [fetchRide]);

  // ─── Socket: real-time status updates ──────────────────────────────────
  const handleStatusChange = useCallback((data) => {
    setRideStatus(data.status);

    // Update driver info if provided
    if (data.driver) {
      setDriverInfo((prev) => ({ ...prev, userId: data.driver }));
    }

    // Add to status history
    setStatusHistory((prev) => [
      { status: data.status, message: data.message, time: new Date() },
      ...prev,
    ]);

    // If completed or cancelled, re-fetch full ride data
    if (['completed', 'cancelled'].includes(data.status)) {
      fetchRide();
    }
  }, [fetchRide]);

  const handleDriverLocationUpdate = useCallback((location) => {
    setLiveDriverLocation(location);
  }, []);

  // Register socket listeners
  useRiderSocket(rideId, handleDriverLocationUpdate, handleStatusChange);

  // Poll every 8 seconds as fallback (in case socket drops)
  useEffect(() => {
    const activeStatuses = ['pending', 'accepted', 'en_route', 'started'];
    if (!rideStatus || !activeStatuses.includes(rideStatus)) return;

    const interval = setInterval(fetchRide, 8000);
    return () => clearInterval(interval);
  }, [rideStatus, fetchRide]);

  const handleCancel = async () => {
    setCancelLoading(true);
    setCancelError('');
    try {
      // Cancel via REST API
      await cancelRideApi(rideId, cancelReason || 'Cancelled by rider');
      // Also emit via socket to notify driver instantly
      emitCancelRide(rideId, cancelReason || 'Cancelled by rider');
      setCancelModalOpen(false);
      setRideStatus('cancelled');
      fetchRide();
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
        <Button variant="primary" onClick={() => navigate('/rider')} style={{ marginTop: 16 }}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!ride) return null;

  const statusInfo = STATUS_INFO[rideStatus] || STATUS_INFO.pending;
  const driver = driverInfo;
  const driverUser = driver?.userId;
  const canCancel = ['pending', 'accepted', 'en_route'].includes(rideStatus);
  const isFinished = ['completed', 'cancelled'].includes(rideStatus);

  return (
    <div>
      {/* Header */}
      <div
        className="page-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <h2 className="page-title">Ride Tracking</h2>
          <p className="page-subtitle" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            ID: {ride._id}
          </p>
        </div>
        <Badge status={rideStatus} />
      </div>

      <div className="tracking-grid">

        {/* ─── Left panel ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Status card */}
          <div
            className="card"
            style={{ borderLeft: `4px solid ${statusInfo.color}`, padding: '16px 20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: '1.5rem' }}>{statusInfo.icon}</span>
              <h4 style={{ margin: 0, color: statusInfo.color }}>{statusInfo.label}</h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{statusInfo.desc}</p>

            {/* Live pulse for active rides */}
            {['pending', 'accepted', 'en_route'].includes(rideStatus) && (
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
                  Live updates via Socket.IO
                </span>
              </div>
            )}
          </div>

          {/* Status history */}
          {statusHistory.length > 0 && (
            <div className="card" style={{ padding: '14px 16px' }}>
              <h4 style={{ marginBottom: 10, fontSize: '0.875rem' }}>Status Updates</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {statusHistory.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Badge status={h.status} />
                    <div>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 500 }}>{h.message}</p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {h.time.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Route card */}
          <div className="card">
            <h4 style={{ marginBottom: 14 }}>Route</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2 }}>🟢</span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>PICKUP</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{ride.pickup?.address}</p>
                </div>
              </div>
              <div style={{ borderLeft: '2px dashed var(--color-border)', marginLeft: 11, height: 16 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2 }}>🔴</span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>DESTINATION</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{ride.destination?.address}</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border)', fontSize: '0.82rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
              {ride.distanceKm && <span>📏 {ride.distanceKm} km</span>}
              {ride.durationMin && <span>⏱ {formatDuration(ride.durationMin)}</span>}
              <span>💰 {formatCurrency(ride.finalFare || ride.fare)}</span>
            </div>
          </div>

          {/* Driver card */}
          {driver && driverUser && (
            <div className="card">
              <h4 style={{ marginBottom: 14 }}>Your Driver</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
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
                  {rideStatus === 'completed' ? 'FINAL FARE' : 'ESTIMATED FARE'}
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
          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {canCancel && (
              <Button variant="danger" fullWidth onClick={() => setCancelModalOpen(true)}>
                Cancel Ride
              </Button>
            )}

            {/* ← Add this payment button */}
            {rideStatus === 'completed' && (
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(`/rider/payment/${ride._id}`)}
              >
                💳 Pay Now — {formatCurrency(ride.finalFare || ride.fare)}
              </Button>
            )}

            {rideStatus === 'completed' && (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/rider/review/${ride._id}`)}
              >
                ⭐ Rate Driver
              </Button>
            )}

            {isFinished && (
              <>
                <Button variant="ghost" fullWidth onClick={() => navigate('/rider')}>
                  ← Back to Dashboard
                </Button>
                <Button variant="ghost" fullWidth onClick={() => navigate('/rider/book')}>
                  Book Another Ride
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ─── Right panel: Map ──────────────────────────────── */}
        <div className="map-panel">
          <TrackingMap
            pickup={ride.pickup}
            destination={ride.destination}
            driverLocation={liveDriverLocation}
            routeCoordinates={routeCoordinates}
            height="540px"
          />
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
            <span>🚗 Driver (live)</span>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => { setCancelModalOpen(false); setCancelError(''); }}
        title="Cancel Ride"
        size="sm"
      >
        <p style={{ marginBottom: 16, fontSize: '0.9rem' }}>
          Are you sure you want to cancel this ride?
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
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: '0.85rem', color: '#991b1b' }}>
            {cancelError}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button variant="ghost" fullWidth onClick={() => { setCancelModalOpen(false); setCancelError(''); }}>
            Keep Ride
          </Button>
          <Button variant="danger" fullWidth loading={cancelLoading} onClick={handleCancel}>
            Yes, Cancel
          </Button>
        </div>
      </Modal>

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