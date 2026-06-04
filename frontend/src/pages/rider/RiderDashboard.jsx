import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getRiderRidesApi } from '../../api/rideApi';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        background: color || 'var(--color-primary-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
        {label}
      </p>
      <p
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: 0,
          lineHeight: 1.2,
        }}
      >
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
        // API not ready yet — use empty state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="page-subtitle">Here's what's happening with your rides</p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard icon="🚗" label="Total Rides" value={stats.total} />
        <StatCard
          icon="✅"
          label="Completed"
          value={stats.completed}
          color="#dcfce7"
        />
        <StatCard
          icon="❌"
          label="Cancelled"
          value={stats.cancelled}
          color="#fee2e2"
        />
        <StatCard
          icon="💰"
          label="Total Spent"
          value={formatCurrency(stats.spent)}
          color="#fef3c7"
        />
      </div>

      {/* Quick actions */}
      <div className="card" style={{ marginBottom: 28 }}>
        <h4 style={{ marginBottom: 16 }}>Quick Actions</h4>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/rider/book" className="btn btn-primary">
            🚗 Book a Ride
          </Link>
          <Link to="/rider/history" className="btn btn-ghost">
            🕒 View History
          </Link>
          <Link to="/rider/profile" className="btn btn-ghost">
            👤 Edit Profile
          </Link>
        </div>
      </div>

      {/* Recent rides */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h4 style={{ margin: 0 }}>Recent Rides</h4>
          <Link
            to="/rider/history"
            style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}
          >
            View all →
          </Link>
        </div>

        {recentRides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚗</div>
            <p className="empty-state-text">No rides yet. Book your first ride!</p>
            <Link to="/rider/book" className="btn btn-primary" style={{ marginTop: 16 }}>
              Book Now
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentRides.map((ride) => (
              <div
                key={ride._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--color-surface-2)',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  gap: 12,
                  flexWrap: 'wrap',
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
                    📍 {ride.destination?.address || 'Unknown destination'}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.78rem',
                      color: 'var(--color-text-muted)',
                      marginTop: 2,
                    }}
                  >
                    {formatDateTime(ride.createdAt)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Badge status={ride.status} />
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: 'var(--color-text-primary)',
                    }}
                  >
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