import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getRiderRidesApi, getActiveRideApi, cancelRideApi } from '../../api/rideApi';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { Sunrise, Sun, Moon, Car, Wallet, Clock, ArrowRight, CheckCircle2, XCircle, User, MapPin, Bell } from '../../components/common/Icons';

const STATUS_BORDER = {
  completed: '#22c55e',
  cancelled: '#ef4444',
  pending: '#f59e0b',
  accepted: '#6366f1',
  started: '#3b82f6',
  en_route: '#3b82f6',
};

const StatCard = ({ icon, label, value, gradient }) => (
  <div
    className="card"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      cursor: 'default',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
    }}
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: gradient || 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.4rem',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, fontWeight: 600, letterSpacing: '0.3px' }}>
        {label}
      </p>
      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {value}
      </p>
    </div>
  </div>
);

const RiderDashboard = () => {
  const { user } = useAuth();
  const [recentRides, setRecentRides] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, cancelled: 0, spent: 0 });
  const [loading, setLoading] = useState(true);
  const [activeRide, setActiveRide] = useState(null);

  useEffect(() => {
    const checkActiveRide = async () => {
      try {
        const res = await getActiveRideApi();
        setActiveRide(res.data.data);
      } catch {
        setActiveRide(null);
      }
    };
    checkActiveRide();
  }, []);

  const handleCancelRide = async () => {
    if (!activeRide) return;
    const ok = window.confirm('Cancel this active ride?');
    if (!ok) return;
    try {
      await cancelRideApi(activeRide._id, 'Cancelled by rider');
      setActiveRide(null);
    } catch {
      // handle silently
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getRiderRidesApi({ limit: 5, page: 1 });
        const rides = res.data.data || [];
        const total = res.data.pagination?.total || 0;
        const completed = rides.filter((r) => r.status === 'completed').length;
        const cancelled = rides.filter((r) => r.status === 'cancelled').length;
        const spent = rides
          .filter((r) => r.status === 'completed')
          .reduce((sum, r) => sum + (r.finalFare || r.fare || 0), 0);
        setRecentRides(rides);
        setStats({ total, completed, cancelled, spent });
      } catch {
        // empty state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetIcon = hour < 12 ? <Sunrise size={16} style={{ color: 'rgba(255,255,255,0.8)' }} /> : hour < 17 ? <Sun size={16} style={{ color: 'rgba(255,255,255,0.8)' }} /> : <Moon size={16} style={{ color: 'rgba(255,255,255,0.8)' }} />;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* ── Hero greeting banner ── */}
      <div
        style={{
          background: 'var(--gradient-primary)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.03) 30px, rgba(255,255,255,0.03) 60px)',
            borderRadius: 20,
          }}
        />
        <div style={{ position: 'relative' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            {greetIcon} {greeting}
          </p>
          <h2
            style={{
              margin: '4px 0 6px',
              color: '#fff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.6rem',
              letterSpacing: '-0.75px',
            }}
          >
            {user?.name?.split(' ')[0]}
          </h2>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)' }}>
            Here's what's happening with your rides
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <Link
            to="/rider/book"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 22px',
              background: '#fff',
              color: 'var(--color-primary)',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
            }}
          >
            <Car size={16} style={{ marginRight: 6 }} /> Book a Ride
          </Link>
        </div>
      </div>

      {/* ── Active ride banner ── */}
      {activeRide && (
        <div
          style={{
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            border: '1.5px solid #22c55e',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            boxShadow: '0 4px 16px rgba(34,197,94,0.2)',
            animation: 'glow-pulse 2s ease-in-out infinite',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', background: '#ffffff50', borderRadius: '50%', padding: 8 }}><Car size={22} style={{ color: '#166534' }} /></span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>
                Active ride in progress
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#15803d' }}>
                To: {activeRide.destination?.address}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link
              to={`/rider/tracking/${activeRide._id}`}
              className="btn btn-sm"
              style={{ background: '#22c55e', color: '#fff', border: 'none', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700, borderRadius: 8, padding: '7px 16px', fontSize: '0.82rem' }}
            >
              Track <ArrowRight size={14} style={{ marginLeft: 4 }} />
            </Link>
            <button
              onClick={handleCancelRide}
              className="btn btn-sm"
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="responsive-grid-auto-fit" style={{ marginBottom: 24, '--grid-min': '160px' }}>
        <StatCard
          icon={<Car size={22} style={{ color: 'var(--color-primary)' }} />}
          label="Total Rides"
          value={stats.total}
          gradient="linear-gradient(135deg, #dbeafe, #bfdbfe)"
        />
        <StatCard
          icon={<CheckCircle2 size={22} style={{ color: '#22c55e' }} />}
          label="Completed"
          value={stats.completed}
          gradient="linear-gradient(135deg, #dcfce7, #bbf7d0)"
        />
        <StatCard
          icon={<XCircle size={22} style={{ color: '#ef4444' }} />}
          label="Cancelled"
          value={stats.cancelled}
          gradient="linear-gradient(135deg, #fee2e2, #fecaca)"
        />
        <StatCard
          icon={<Wallet size={22} style={{ color: '#b45309' }} />}
          label="Total Spent"
          value={formatCurrency(stats.spent)}
          gradient="linear-gradient(135deg, #fef3c7, #fde68a)"
        />
      </div>

      {/* ── Quick actions ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ marginBottom: 14 }}>Quick Actions</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
          {[
            { to: '/rider/book', icon: <Car size={22} />, label: 'Book a Ride', gradient: 'var(--gradient-primary)', color: '#fff' },
            { to: '/rider/history', icon: <Clock size={22} />, label: 'History', gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: 'var(--color-primary)' },
            { to: '/rider/notifications', icon: <Bell size={22} />, label: 'Notifications', gradient: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#7c3aed' },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '14px 8px',
                background: action.gradient,
                borderRadius: 12,
                textDecoration: 'none',
                color: action.color,
                fontWeight: 700,
                fontSize: '0.8rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', color: action.color }}>{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent rides ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <h4 style={{ margin: 0 }}>Recent Rides</h4>
          <Link to="/rider/history" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
            View all →
          </Link>
        </div>

        {recentRides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-text-muted)', marginBottom: 12 }}>
              <Car size={36} strokeWidth={1.5} />
            </div>
            <p className="empty-state-title">No rides yet</p>
            <p className="empty-state-text">Book your first ride and start your journey!</p>
            <Link to="/rider/book" className="btn btn-primary" style={{ marginTop: 16 }}>
              Book Now
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentRides.map((ride) => (
              <div
                key={ride._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: 'var(--color-surface-2)',
                  borderRadius: 10,
                  border: '1px solid var(--color-border)',
                  borderLeft: `3px solid ${STATUS_BORDER[ride.status] || 'var(--color-border)'}`,
                  gap: 10,
                  flexWrap: 'wrap',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <MapPin size={14} style={{ color: 'var(--color-primary)', marginRight: 6, verticalAlign: 'middle' }} />
                    <span style={{ verticalAlign: 'middle' }}>{ride.destination?.address || 'Unknown destination'}</span>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {formatDateTime(ride.createdAt)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <Badge status={ride.status} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                    {formatCurrency(ride.finalFare || ride.fare)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderDashboard;