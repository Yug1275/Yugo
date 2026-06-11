import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStatsApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/helpers';
import { Wallet, CalendarDays, Car, Users, CheckCircle2, XCircle, Clock, Route, TrendingUp, CreditCard, AlertCircle, Check } from '../../components/common/Icons';

const StatCard = ({ icon, label, value, sub, color, gradient, to }) => {
  const content = (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        borderLeft: `4px solid ${color || 'var(--color-primary)'}`,
        cursor: to ? 'pointer' : 'default',
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
          background: gradient || `${color}22` || 'var(--color-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* ── Header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="page-title">Admin Dashboard</h2>
          <p className="page-subtitle">Platform overview and key metrics</p>
        </div>
        {/* Platform Health indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            border: '1px solid #22c55e',
            borderRadius: 10,
            padding: '8px 14px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#166534',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#22c55e',
              display: 'inline-block',
              animation: 'pulse 1.5s infinite',
            }}
          />
          Platform Healthy
        </div>
      </div>

      {/* ── Revenue row ── */}
      <div style={{ marginBottom: 10 }}>
        <p className="section-label">Revenue</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard
            icon={<Wallet size={20} style={{ color: '#166534' }} />}
            label="Total Revenue"
            value={formatCurrency(stats?.revenue?.total || 0)}
            color="#22c55e"
            gradient="linear-gradient(135deg, #dcfce7, #bbf7d0)"
            to="/admin/payments"
          />
          <StatCard
            icon={<CalendarDays size={20} style={{ color: '#166534' }} />}
            label="Today"
            value={formatCurrency(stats?.revenue?.today || 0)}
            color="#22c55e"
            gradient="linear-gradient(135deg, #dcfce7, #bbf7d0)"
          />
          <StatCard
            icon={<CalendarDays size={20} style={{ color: '#166534' }} />}
            label="This Week"
            value={formatCurrency(stats?.revenue?.week || 0)}
            color="#22c55e"
            gradient="linear-gradient(135deg, #dcfce7, #bbf7d0)"
          />
          <StatCard
            icon={<CalendarDays size={20} style={{ color: '#166534' }} />}
            label="This Month"
            value={formatCurrency(stats?.revenue?.month || 0)}
            color="#22c55e"
            gradient="linear-gradient(135deg, #dcfce7, #bbf7d0)"
          />
        </div>
      </div>

      {/* ── Rides row ── */}
      <div style={{ marginBottom: 10 }}>
        <p className="section-label">Rides</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard
            icon={<Car size={20} style={{ color: '#1e40af' }} />}
            label="Total Rides"
            value={stats?.rides?.total || 0}
            color="#2563EB"
            gradient="linear-gradient(135deg, #dbeafe, #bfdbfe)"
            to="/admin/rides"
          />
          <StatCard
            icon={<CalendarDays size={20} style={{ color: '#1e40af' }} />}
            label="Today"
            value={stats?.rides?.today || 0}
            color="#2563EB"
            gradient="linear-gradient(135deg, #dbeafe, #bfdbfe)"
          />
          <StatCard
            icon={<CheckCircle2 size={20} style={{ color: '#166534' }} />}
            label="Completed"
            value={stats?.rides?.completed || 0}
            color="#22c55e"
            gradient="linear-gradient(135deg, #dcfce7, #bbf7d0)"
            sub={`${stats?.rides?.completionRate || 0}% completion rate`}
          />
          <StatCard
            icon={<XCircle size={20} style={{ color: '#991b1b' }} />}
            label="Cancelled"
            value={stats?.rides?.cancelled || 0}
            color="#ef4444"
            gradient="linear-gradient(135deg, #fee2e2, #fecaca)"
          />
        </div>
      </div>

      {/* ── Users + Drivers row ── */}
      <div style={{ marginBottom: 24 }}>
        <p className="section-label">Users & Drivers</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <StatCard
            icon={<Users size={20} style={{ color: '#6d28d9' }} />}
            label="Total Riders"
            value={stats?.users?.total || 0}
            color="#8b5cf6"
            gradient="linear-gradient(135deg, #ede9fe, #ddd6fe)"
            to="/admin/users"
          />
          <StatCard
            icon={<Car size={20} style={{ color: '#b45309' }} />}
            label="Total Drivers"
            value={stats?.drivers?.total || 0}
            color="#f59e0b"
            gradient="linear-gradient(135deg, #fef3c7, #fde68a)"
            to="/admin/drivers"
          />
          <StatCard
            icon={<CheckCircle2 size={20} style={{ color: '#166534' }} />}
            label="Approved Drivers"
            value={stats?.drivers?.approved || 0}
            color="#22c55e"
            gradient="linear-gradient(135deg, #dcfce7, #bbf7d0)"
          />
          <StatCard
            icon={<Clock size={20} style={{ color: '#b45309' }} />}
            label="Pending Approval"
            value={stats?.drivers?.pending || 0}
            color="#f59e0b"
            gradient="linear-gradient(135deg, #fef3c7, #fde68a)"
            to="/admin/drivers?status=pending"
            sub={stats?.drivers?.pending > 0 ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#b45309', fontWeight: 600 }}>
                <AlertCircle size={12} /> Needs attention
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#166534', fontWeight: 600 }}>
                <Check size={12} /> All clear
              </span>
            )}
          />
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="card">
        <h4 style={{ marginBottom: 16 }}>Quick Actions</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          {[
            { to: '/admin/drivers?status=pending', icon: <Clock size={22} />, label: 'Review Drivers', gradient: 'var(--gradient-primary)', color: '#fff' },
            { to: '/admin/rides', icon: <Route size={22} />, label: 'All Rides', gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: 'var(--color-primary)' },
            { to: '/admin/analytics', icon: <TrendingUp size={22} />, label: 'Analytics', gradient: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#7c3aed' },
            { to: '/admin/payments', icon: <CreditCard size={22} />, label: 'Payments', gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#166534' },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '16px 8px',
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
    </div>
  );
};

export default AdminDashboard;
