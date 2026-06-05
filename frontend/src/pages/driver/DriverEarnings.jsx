import { useEffect, useState } from 'react';
import { getDriverEarningsApi } from '../../api/driverApi';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const DriverEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDriverEarningsApi();
        setData(res.data.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading earnings..." />;

  if (!data) return (
    <div className="empty-state">
      <div className="empty-state-icon">💰</div>
      <p className="empty-state-text">Could not load earnings data.</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Earnings</h2>
        <p className="page-subtitle">Your ride earnings and performance overview</p>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { icon: '📅', label: "Today's Earnings", value: formatCurrency(data.todayEarnings), color: '#dcfce7' },
          { icon: '🗓️', label: 'This Week', value: formatCurrency(data.weekEarnings), color: '#dbeafe' },
          { icon: '💰', label: 'All Time', value: formatCurrency(data.totalEarnings), color: '#fef3c7' },
          { icon: '🚗', label: "Today's Rides", value: data.todayRides, color: '#f3e8ff' },
          { icon: '📊', label: 'Week Rides', value: data.weekRides, color: '#fee2e2' },
          { icon: '⭐', label: 'Rating', value: data.rating ? data.rating.toFixed(1) : 'N/A', color: '#fef3c7' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              background: stat.color,
              border: 'none',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {stat.label}
            </p>
            <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Daily breakdown */}
      {data.daily?.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h4 style={{ marginBottom: 16 }}>Daily Breakdown (Last 14 days)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.daily.map((day, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: 'var(--color-surface-2)',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                }}
              >
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  📅 {day.date}
                </span>
                <div style={{ display: 'flex', gap: 20, fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    🚗 {day.rides} ride{day.rides !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {formatCurrency(day.earnings)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent completed rides */}
      {data.recentRides?.length > 0 && (
        <div className="card">
          <h4 style={{ marginBottom: 14 }}>Recent Completed Rides</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.recentRides.map((ride) => (
              <div
                key={ride._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: 'var(--color-surface-2)',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📍 {ride.destination?.address}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {formatDateTime(ride.createdAt)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Badge status={ride.status} />
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {formatCurrency(ride.finalFare || ride.fare)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recentRides?.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">💰</div>
          <p className="empty-state-text">No completed rides yet. Start accepting rides to earn!</p>
        </div>
      )}
    </div>
  );
};

export default DriverEarnings;