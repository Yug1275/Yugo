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
import { Search, Car, MapPin, Route, CheckCircle2, XCircle, AlertCircle, Clock, Wallet, Star, PhoneCall, CreditCard } from '../../components/common/Icons';

const STATUS_INFO = {
  pending: {
    label: 'Looking for a driver...',
    desc: 'Your ride request has been sent. Waiting for a driver to accept.',
    icon: <Search size={18} />,
    color: 'var(--color-warning)',
    gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    textColor: '#92400e',
  },
  accepted: {
    label: 'Driver accepted your ride',
    desc: 'A driver is on the way to your pickup point.',
    icon: <Car size={18} />,
    color: 'var(--color-primary)',
    gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    textColor: '#1e40af',
  },
  en_route: {
    label: 'Driver is nearby',
    desc: 'Your driver is almost at the pickup location.',
    icon: <MapPin size={18} />,
    color: 'var(--color-primary)',
    gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    textColor: '#1e40af',
  },
  started: {
    label: 'Ride in progress',
    desc: "You're on your way! Sit back and relax.",
    icon: <Route size={18} />,
    color: 'var(--color-success)',
    gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    textColor: '#166534',
  },
  completed: {
    label: 'Ride completed',
    desc: 'You have reached your destination. Hope you enjoyed the ride!',
    icon: <CheckCircle2 size={18} />,
    color: 'var(--color-success)',
    gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    textColor: '#166534',
  },
  cancelled: {
    label: 'Ride cancelled',
    desc: 'This ride has been cancelled.',
    icon: <XCircle size={18} />,
    color: 'var(--color-danger)',
    gradient: 'linear-gradient(135deg, #fee2e2, #fecaca)',
    textColor: '#991b1b',
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

    if (data.driver) {
      setDriverInfo((prev) => ({ ...prev, userId: data.driver }));
    }

    setStatusHistory((prev) => [
      { status: data.status, message: data.message, time: new Date() },
      ...prev,
    ]);

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
      await cancelRideApi(rideId, cancelReason || 'Cancelled by rider');
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
        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-warning)', marginBottom: 12 }}>
          <AlertCircle size={44} />
        </div>
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
  const isPending = rideStatus === 'pending';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div
        className="page-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <h2 className="page-title">Ride Tracking</h2>
          <p className="page-subtitle" style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
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
            style={{
              background: statusInfo.gradient,
              border: `1.5px solid ${statusInfo.color}`,
              padding: '18px 20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Radar rings for pending */}
            {isPending && (
              <div style={{ position: 'absolute', top: 16, right: 20 }}>
                <div style={{ position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: `2px solid ${statusInfo.color}`,
                        animation: `pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) ${i * 0.5}s infinite`,
                        opacity: 0.7,
                      }}
                    />
                  ))}
                  <span style={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>{statusInfo.icon}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              {!isPending && <span style={{ display: 'flex', alignItems: 'center' }}>{statusInfo.icon}</span>}
              <h4 style={{ margin: 0, color: statusInfo.textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {statusInfo.label}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: statusInfo.textColor, opacity: 0.8 }}>
              {statusInfo.desc}
            </p>

            {/* Live updates pulse indicator */}
            {['pending', 'accepted', 'en_route'].includes(rideStatus) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <span
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#22c55e',
                        display: 'inline-block',
                        animation: `bounce-dot 1.2s ease-in-out ${delay}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>
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
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ display: 'inline-flex', width: 10, height: 10, borderRadius: '50%', background: '#22c55e', flexShrink: 0, marginTop: 6 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>PICKUP</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{ride.pickup?.address}</p>
                </div>
              </div>
              <div style={{ borderLeft: '2px dashed var(--color-border)', marginLeft: 4, height: 16 }} />
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ display: 'inline-flex', width: 10, height: 10, borderRadius: '50%', background: '#ef4444', flexShrink: 0, marginTop: 6 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>DESTINATION</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{ride.destination?.address}</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border)', fontSize: '0.82rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap', alignItems: 'center' }}>
              {ride.distanceKm && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Route size={14} /> {ride.distanceKm} km</span>}
              {ride.durationMin && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {formatDuration(ride.durationMin)}</span>}
              <span style={{ fontWeight: 700, color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Wallet size={14} /> {formatCurrency(ride.finalFare || ride.fare)}</span>
            </div>
          </div>

          {/* Driver card */}
          {driver && driverUser && (
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
              <div
                style={{
                  background: 'var(--gradient-primary)',
                  padding: '12px 16px',
                }}
              >
                <h4 style={{ margin: 0, color: '#fff', fontSize: '0.875rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your Driver</h4>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: 'var(--gradient-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                    }}
                  >
                    {driverUser?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {driverUser?.name}
                    </p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Star size={12} style={{ color: '#fbbf24' }} /> {driver.rating || 'N/A'}
                      </span>
                      <span style={{ color: 'var(--color-border)' }}>·</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        {driver.totalRides || 0} rides
                      </span>
                    </div>
                    {/* Rating bar visualization */}
                    {driver.rating && (
                      <div style={{ marginTop: 6, height: 4, background: 'var(--color-border)', borderRadius: 2, width: 80, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${(driver.rating / 5) * 100}%`,
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {driverUser?.phone && (
                  <a
                    href={`tel:${driverUser.phone}`}
                    className="btn btn-ghost btn-sm btn-full"
                    style={{ textDecoration: 'none', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <PhoneCall size={14} /> Call Driver
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Fare card */}
          <div
            className="card"
            style={{
              background: 'var(--gradient-primary)',
              border: 'none',
              boxShadow: '0 4px 20px rgba(37,99,235,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '0.5px' }}>
                  {rideStatus === 'completed' ? 'FINAL FARE' : 'ESTIMATED FARE'}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                  Booked {formatDateTime(ride.createdAt)}
                </p>
              </div>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {formatCurrency(ride.finalFare || ride.fare)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {canCancel && (
              <Button variant="danger" fullWidth onClick={() => setCancelModalOpen(true)}>
                Cancel Ride
              </Button>
            )}

            {rideStatus === 'completed' && (
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(`/rider/payment/${ride._id}`)}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <CreditCard size={16} /> Pay Now — {formatCurrency(ride.finalFare || ride.fare)}
              </Button>
            )}

            {rideStatus === 'completed' && (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/rider/review/${ride._id}`)}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Star size={16} /> Rate Driver
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
              padding: '10px 14px',
              background: 'var(--color-surface)',
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              fontSize: '0.78rem',
              color: 'var(--color-text-secondary)',
              flexWrap: 'wrap',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} /> Pickup</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Destination</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Car size={14} style={{ color: 'var(--color-primary)' }} /> Driver (live)</span>
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
    </div>
  );
};

export default RideTracking;