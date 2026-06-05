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
import {
  setDriverProfile,
  setAvailability,
  setPendingRides,
} from '../../store/driverSlice';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import useAuth from '../../hooks/useAuth';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { profile, vehicle, availability, pendingRides } = useSelector((s) => s.driver);

  const [loading, setLoading] = useState(true);
  const [availLoading, setAvailLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [pendingLoading, setPendingLoading] = useState(false);

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
            try {
              await updateLocationApi(pos.coords.latitude, pos.coords.longitude);
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
  useEffect(() => {
    if (!availability) return;

    const fetchPending = async () => {
      setPendingLoading(true);
      try {
        const res = await getPendingRidesApi();
        dispatch(setPendingRides(res.data.data || []));
      } catch { /* silent */ }
      finally { setPendingLoading(false); }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval);
  }, [availability]);

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
      navigate(`/driver/rides/${rideId}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept ride');
      setAcceptingId(null);
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">{greeting}, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="page-subtitle">Manage your rides and earnings</p>
      </div>

      {/* Approval banner */}
      {profile && !profile.isApproved && (
        <div
          style={{
            background: '#fef3c7',
            border: '1.5px solid #f59e0b',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: '1.3rem' }}>⏳</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#92400e' }}>Pending Admin Approval</p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350f' }}>
              Your account is under review. You'll be able to accept rides once approved.
            </p>
          </div>
        </div>
      )}

      {/* Suspended banner */}
      {profile?.isSuspended && (
        <div
          style={{
            background: '#fee2e2',
            border: '1.5px solid var(--color-danger)',
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 20,
          }}
        >
          <p style={{ margin: 0, fontWeight: 700, color: '#991b1b' }}>⛔ Account Suspended</p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#7f1d1d' }}>
            Contact support for more information.
          </p>
        </div>
      )}

      {/* Online / Offline toggle + stats row */}
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
            gap: 10,
            background: availability ? '#dcfce7' : 'var(--color-surface)',
            border: `1.5px solid ${availability ? '#22c55e' : 'var(--color-border)'}`,
          }}
        >
          <div style={{ fontSize: '2rem' }}>{availability ? '🟢' : '🔴'}</div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: availability ? '#166534' : 'var(--color-text-secondary)' }}>
            {availability ? 'Online' : 'Offline'}
          </p>
          <button
            onClick={handleToggleAvailability}
            disabled={availLoading || !profile?.isApproved || profile?.isSuspended}
            style={{
              padding: '7px 18px',
              borderRadius: 20,
              border: 'none',
              background: availability ? '#ef4444' : '#22c55e',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: availLoading || !profile?.isApproved ? 'not-allowed' : 'pointer',
              opacity: availLoading || !profile?.isApproved ? 0.6 : 1,
            }}
          >
            {availLoading ? '...' : availability ? 'Go Offline' : 'Go Online'}
          </button>
          {/* Explain why toggle may be disabled */}
          {!availLoading && !profile?.isApproved && (
            <p style={{ margin: 0, marginTop: 8, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Your account is pending approval — you cannot go online yet.
            </p>
          )}
          {!availLoading && profile?.isSuspended && (
            <p style={{ margin: 0, marginTop: 8, fontSize: '0.82rem', color: 'var(--color-danger)' }}>
              Your account is suspended. Contact support for help.
            </p>
          )}
        </div>

        {/* Stats */}
        {[
          { icon: '🚗', label: 'Total Rides', value: profile?.totalRides || 0 },
          { icon: '💰', label: 'Total Earned', value: formatCurrency(profile?.totalEarnings || 0) },
          { icon: '⭐', label: 'Rating', value: profile?.rating ? profile.rating.toFixed(1) : 'N/A' },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.8rem' }}>{stat.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{stat.label}</p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem' }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Vehicle info */}
      {vehicle && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h4 style={{ marginBottom: 12 }}>My Vehicle</h4>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: '0.875rem' }}>
            <span>🚗 <strong>{vehicle.vehicleModel}</strong></span>
            <span>🔢 {vehicle.vehicleNumber}</span>
            <span style={{ textTransform: 'capitalize' }}>📋 {vehicle.vehicleType}</span>
            {vehicle.vehicleColor && <span>🎨 {vehicle.vehicleColor}</span>}
            {vehicle.vehicleYear && <span>📅 {vehicle.vehicleYear}</span>}
          </div>
        </div>
      )}

      {/* Pending rides */}
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
            <p className="empty-state-text">You are currently offline. Go online to start receiving ride requests.</p>
          </div>
        ) : pendingRides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p className="empty-state-text">No ride requests right now. Checking every 10 seconds...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingRides.map((ride) => (
              <div
                key={ride._id}
                style={{
                  padding: '14px 16px',
                  background: 'var(--color-surface-2)',
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    {formatDateTime(ride.createdAt)}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', gap: 8, fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.7rem', marginTop: 2 }}>FROM</span>
                      <span style={{ fontWeight: 500 }}>{ride.pickup?.address}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.7rem', marginTop: 2 }}>TO</span>
                      <span style={{ fontWeight: 500 }}>{ride.destination?.address}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {ride.distanceKm && <span>📏 {ride.distanceKm} km</span>}
                    <span>👤 {ride.riderId?.name || 'Rider'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {formatCurrency(ride.fare)}
                  </span>
                  <button
                    onClick={() => handleAcceptRide(ride._id)}
                    disabled={acceptingId === ride._id}
                    style={{
                      padding: '8px 20px',
                      background: 'var(--color-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: acceptingId === ride._id ? 'not-allowed' : 'pointer',
                      opacity: acceptingId === ride._id ? 0.7 : 1,
                    }}
                  >
                    {acceptingId === ride._id ? 'Accepting...' : 'Accept'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;