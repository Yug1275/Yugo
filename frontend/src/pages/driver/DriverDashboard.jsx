import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getMyDriverProfileApi,
  toggleAvailabilityApi,
  getPendingRidesApi,
  acceptRideApi,
  updateLocationApi,
} from '../../api/driverApi';
import { useDriverSocket, useRideEmitter } from '../../hooks/useRideSocket';
import {
  setDriverProfile,
  setAvailability,
  setPendingRides,
} from '../../store/driverSlice';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import useAuth from '../../hooks/useAuth';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { getDriverReviewsApi } from '../../api/reviewApi';
import StarRating from '../../components/common/StarRating';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { profile, vehicle, availability, pendingRides } = useSelector((s) => s.driver);

  const [loading, setLoading] = useState(true);
  const [availLoading, setAvailLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [pendingLoading, setPendingLoading] = useState(false);
  const { emitAcceptRide } = useRideEmitter();
  const [recentReviews, setRecentReviews] = useState([]);

  // Load driver profile on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyDriverProfileApi();
        dispatch(setDriverProfile(res.data.data));

        // If profile incomplete — redirect
        if (!res.data.data.driver?.licenseNumber) {
          navigate('/driver/complete-profile', { replace: true });
          return;
        }

        // Auto-update location if available
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            // Fetch recent reviews
            try {
              const reviewRes = await getDriverReviewsApi(res.data.data.driver._id, { limit: 3 });
              setRecentReviews(reviewRes.data.data || []);
            } catch { /* silent */ }
          });
        }
      } catch {
        // handle silently
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Poll pending rides every 10s if online
  const { emitLocationUpdate } = useRideEmitter();

  useEffect(() => {
    if (!availability) return;

    const sendLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          try { await updateLocationApi(lat, lng); } catch { /* silent */ }
          emitLocationUpdate(lat, lng, null);
        });
      }
    };

    sendLocation();
    const interval = setInterval(sendLocation, 10000);
    return () => clearInterval(interval);
  }, [availability, emitLocationUpdate]);

  // Socket: listen for new ride requests in real time
  useDriverSocket(
    (newRide) => {
      console.log('New ride received via socket (component):', newRide?.rideId || newRide);
      const exists = Array.isArray(pendingRides) && pendingRides.some((r) => r._id?.toString() === newRide.rideId?.toString());
      if (!exists) {
        dispatch(setPendingRides([{ ...newRide, _id: newRide.rideId }, ...(Array.isArray(pendingRides) ? pendingRides : [])]));
      }
    },
    (takenRideId) => {
      const newList = Array.isArray(pendingRides)
        ? pendingRides.filter((r) => r._id?.toString() !== takenRideId?.toString())
        : [];
      dispatch(setPendingRides(newList));
    }
  );

  const handleToggleAvailability = async () => {
    setAvailLoading(true);
    try {
      const res = await toggleAvailabilityApi();
      dispatch(setAvailability(res.data.data.availability));
      if (!res.data.data.availability) {
        dispatch(setPendingRides([]));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update availability');
    } finally {
      setAvailLoading(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    setAcceptingId(rideId);
    try {
      await acceptRideApi(rideId);
      emitAcceptRide(rideId);
      navigate(`/driver/rides`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept ride');
      setAcceptingId(null);
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* ── Greeting header ── */}
      <div className="page-header">
        <h2 className="page-title">{greetEmoji} {greeting}, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="page-subtitle">Manage your rides and earnings</p>
      </div>

      {/* ── Approval banner ── */}
      {profile && !profile.isApproved && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '1.5px solid #f59e0b',
            borderRadius: 14,
            padding: '16px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>⏳</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#92400e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pending Admin Approval</p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350f', marginTop: 2 }}>
              Your account is under review. You'll be able to accept rides once approved.
            </p>
          </div>
        </div>
      )}

      {/* ── Suspended banner ── */}
      {profile?.isSuspended && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            border: '1.5px solid var(--color-danger)',
            borderRadius: 14,
            padding: '16px 18px',
            marginBottom: 20,
          }}
        >
          <p style={{ margin: 0, fontWeight: 700, color: '#991b1b', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>⛔ Account Suspended</p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#7f1d1d', marginTop: 2 }}>
            Contact support for more information.
          </p>
        </div>
      )}

      {/* ── Status + Stats grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {/* Availability toggle card */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            background: availability
              ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
              : 'var(--color-surface)',
            border: `1.5px solid ${availability ? '#22c55e' : 'var(--color-border)'}`,
            boxShadow: availability
              ? '0 4px 20px rgba(34,197,94,0.2)'
              : 'var(--shadow-card)',
          }}
        >
          {/* Status indicator with glow */}
          <div style={{ position: 'relative' }}>
            {availability && (
              <>
                <div className="radar-ring" style={{ width: 40, height: 40, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                <div className="radar-ring" style={{ width: 40, height: 40, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animationDelay: '0.5s', borderColor: '#22c55e' }} />
              </>
            )}
            <div style={{ fontSize: '2.2rem', position: 'relative', zIndex: 1 }}>
              {availability ? '🟢' : '🔴'}
            </div>
          </div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: availability ? '#166534' : 'var(--color-text-secondary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {availability ? 'Online' : 'Offline'}
          </p>

          {/* iOS-style toggle */}
          <button
            onClick={handleToggleAvailability}
            disabled={availLoading || !profile?.isApproved || profile?.isSuspended}
            className={`ios-toggle ${availability ? 'on' : ''}`}
            style={{
              opacity: availLoading || !profile?.isApproved ? 0.6 : 1,
              cursor: availLoading || !profile?.isApproved ? 'not-allowed' : 'pointer',
            }}
          />

          <p style={{ margin: 0, fontSize: '0.75rem', color: availability ? '#15803d' : 'var(--color-text-muted)', textAlign: 'center' }}>
            {availLoading ? 'Updating...' : availability ? 'Tap to go offline' : 'Tap to go online'}
          </p>

          {!availLoading && !profile?.isApproved && (
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Account pending approval
            </p>
          )}
        </div>

        {/* Stat cards */}
        {[
          {
            icon: '🚗',
            label: 'Total Rides',
            value: profile?.totalRides || 0,
            gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          },
          {
            icon: '💰',
            label: 'Total Earned',
            value: formatCurrency(profile?.totalEarnings || 0),
            gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
          },
          {
            icon: '⭐',
            label: 'Rating',
            value: profile?.rating ? profile.rating.toFixed(1) : 'N/A',
            gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: stat.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0,
              }}
            >
              {stat.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{stat.label}</p>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1.3rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Vehicle info ── */}
      {vehicle && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h4 style={{ marginBottom: 12 }}>🚗 My Vehicle</h4>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.875rem' }}>
            <span style={{ background: 'var(--color-surface-2)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--color-border)', fontWeight: 600 }}>
              {vehicle.vehicleModel}
            </span>
            <span style={{ background: 'var(--color-surface-2)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--color-border)' }}>
              🔢 {vehicle.vehicleNumber}
            </span>
            <span style={{ background: 'var(--color-surface-2)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--color-border)', textTransform: 'capitalize' }}>
              📋 {vehicle.vehicleType}
            </span>
            {vehicle.vehicleColor && (
              <span style={{ background: 'var(--color-surface-2)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                🎨 {vehicle.vehicleColor}
              </span>
            )}
            {vehicle.vehicleYear && (
              <span style={{ background: 'var(--color-surface-2)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                📅 {vehicle.vehicleYear}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Pending rides ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h4 style={{ margin: 0 }}>
            {availability ? '🔔 Available Ride Requests' : '📴 Go online to see ride requests'}
          </h4>
          {pendingLoading && (
            <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
          )}
        </div>

        {!availability ? (
          <div className="empty-state">
            <div className="empty-state-icon">📴</div>
            <p className="empty-state-title" style={{ marginTop: 12 }}>You're offline</p>
            <p className="empty-state-text">Go online to start receiving ride requests.</p>
          </div>
        ) : pendingRides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>🔍</div>
            <p className="empty-state-title" style={{ marginTop: 12 }}>No requests yet</p>
            <p className="empty-state-text">Checking every 10 seconds...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingRides.map((ride) => (
              <div
                key={ride._id}
                className="pending-ride-card"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    {formatDateTime(ride.createdAt)}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.875rem' }}>
                      <span
                        style={{
                          background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                          color: '#166534',
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: 4,
                          marginTop: 2,
                          flexShrink: 0,
                          letterSpacing: '0.5px',
                        }}
                      >
                        FROM
                      </span>
                      <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{ride.pickup?.address}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.875rem' }}>
                      <span
                        style={{
                          background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                          color: '#991b1b',
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: 4,
                          marginTop: 2,
                          flexShrink: 0,
                          letterSpacing: '0.5px',
                        }}
                      >
                        TO
                      </span>
                      <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{ride.destination?.address}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {ride.distanceKm && <span>📏 {ride.distanceKm} km</span>}
                    <span>👤 {ride.riderId?.name || 'Rider'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                  <span
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: 'var(--color-primary)',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {formatCurrency(ride.fare)}
                  </span>
                  <button
                    onClick={() => handleAcceptRide(ride._id)}
                    disabled={acceptingId === ride._id}
                    style={{
                      padding: '9px 22px',
                      background: acceptingId === ride._id
                        ? 'var(--color-border)'
                        : 'var(--gradient-success)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: acceptingId === ride._id ? 'not-allowed' : 'pointer',
                      opacity: acceptingId === ride._id ? 0.7 : 1,
                      boxShadow: acceptingId === ride._id ? 'none' : '0 4px 12px rgba(34,197,94,0.35)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (acceptingId !== ride._id) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(34,197,94,0.45)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(34,197,94,0.35)';
                    }}
                  >
                    {acceptingId === ride._id ? 'Accepting...' : '✓ Accept'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Recent reviews ── */}
      {recentReviews.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h4 style={{ marginBottom: 14 }}>Recent Reviews</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentReviews.map((review) => (
              <div
                key={review._id}
                style={{
                  padding: '12px 14px',
                  background: 'var(--color-surface-2)',
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {review.riderId?.name?.charAt(0).toUpperCase() || 'R'}
                    </div>
                    {review.riderId?.name || 'Rider'}
                  </span>
                  <StarRating value={review.rating} readonly size="sm" showLabel={false} />
                </div>
                {review.comment && (
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;