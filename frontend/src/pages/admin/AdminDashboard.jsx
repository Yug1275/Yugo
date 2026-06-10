import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStatsApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/helpers';

const StatCard = ({ icon, label, value, sub, color, to }) => {
  const content = (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        borderLeft: `4px solid ${color || 'var(--color-primary)'}`,
        cursor: to ? 'pointer' : 'default',
        transition: 'transform 0.15s ease',
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: 12,
          background: color ? `${color}20` : 'var(--color-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
          {value}
        </p>
        {sub && (
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );

  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link> : content;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAdminStatsApi();
        setStats(res.data.data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Admin Dashboard</h2>
        <p className="page-subtitle">Platform overview and key metrics</p>
      </div>

      {/* Revenue row */}
      <div style={{ marginBottom: 10 }}>
        <h4 style={{ marginBottom: 12, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Revenue
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard icon="💰" label="Total Revenue" value={formatCurrency(stats?.revenue?.total || 0)} color="#22c55e" to="/admin/payments" />
          <StatCard icon="📅" label="Today" value={formatCurrency(stats?.revenue?.today || 0)} color="#22c55e" />
          <StatCard icon="🗓️" label="This Week" value={formatCurrency(stats?.revenue?.week || 0)} color="#22c55e" />
          <StatCard icon="📆" label="This Month" value={formatCurrency(stats?.revenue?.month || 0)} color="#22c55e" />
        </div>
      </div>

      {/* Rides row */}
      <div style={{ marginBottom: 10 }}>
        <h4 style={{ marginBottom: 12, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Rides
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard icon="🚗" label="Total Rides" value={stats?.rides?.total || 0} color="#2563EB" to="/admin/rides" />
          <StatCard icon="📅" label="Today" value={stats?.rides?.today || 0} color="#2563EB" />
          <StatCard icon="✅" label="Completed" value={stats?.rides?.completed || 0} color="#22c55e" sub={`${stats?.rides?.completionRate || 0}% completion rate`} />
          <StatCard icon="❌" label="Cancelled" value={stats?.rides?.cancelled || 0} color="#ef4444" />
        </div>
      </div>

      {/* Users + Drivers row */}
      <div>
        <h4 style={{ marginBottom: 12, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Users & Drivers
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard icon="👥" label="Total Riders" value={stats?.users?.total || 0} color="#8b5cf6" to="/admin/users" />
          <StatCard icon="🚗" label="Total Drivers" value={stats?.drivers?.total || 0} color="#f59e0b" to="/admin/drivers" />
          <StatCard icon="✅" label="Approved Drivers" value={stats?.drivers?.approved || 0} color="#22c55e" />
          <StatCard icon="⏳" label="Pending Approval" value={stats?.drivers?.pending || 0} color="#f59e0b" to="/admin/drivers?status=pending" sub={stats?.drivers?.pending > 0 ? 'Needs attention' : 'All clear'} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h4 style={{ marginBottom: 16 }}>Quick Actions</h4>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/admin/drivers?status=pending" className="btn btn-primary btn-sm">
            ⏳ Review Pending Drivers
          </Link>
          <Link to="/admin/rides" className="btn btn-ghost btn-sm">
            🛣️ View All Rides
          </Link>
          <Link to="/admin/analytics" className="btn btn-ghost btn-sm">
            📈 View Analytics
          </Link>
          <Link to="/admin/payments" className="btn btn-ghost btn-sm">
            💳 Payment Records
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
