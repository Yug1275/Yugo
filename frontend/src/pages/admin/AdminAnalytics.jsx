import { useEffect, useState } from 'react';
import { getRideAnalyticsApi, getRevenueAnalyticsApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/helpers';

const MEDALS = ['🥇', '🥈', '🥉'];

const AdminAnalytics = () => {
  const [days, setDays] = useState(30);
  const [rideData, setRideData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rideRes, revRes] = await Promise.all([
          getRideAnalyticsApi(days),
          getRevenueAnalyticsApi(days),
        ]);
        setRideData(rideRes.data.data);
        setRevenueData(revRes.data.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [days]);

  if (loading) return <Loader text="Analyzing platform data..." />;

  // 1. Calculations for Daily Rides Trend
  const dailyRides = rideData?.daily || [];
  const maxRides = Math.max(...dailyRides.map((d) => d.total), 1);

  // 2. Calculations for Daily Revenue Trend
  const dailyRevenue = revenueData?.daily || [];
  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.revenue), 1);

  // 3. Calculations for Hourly Distribution
  const hourlyRides = rideData?.hourly || [];
  const maxHourly = Math.max(...hourlyRides.map((h) => h.rides), 1);

  // 4. Calculations for Payment Method Breakdown
  const methods = revenueData?.methodBreakdown || [];
  const totalTransactions = methods.reduce((acc, m) => acc + m.count, 0) || 1;
  const razorpayInfo = methods.find((m) => m._id === 'razorpay') || { count: 0, total: 0 };
  const cashInfo = methods.find((m) => m._id === 'cash') || { count: 0, total: 0 };

  const razorpayPercent = Math.round((razorpayInfo.count / totalTransactions) * 100);
  const cashPercent = Math.round((cashInfo.count / totalTransactions) * 100);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 className="page-title">Platform Analytics</h2>
          <p className="page-subtitle">Historical trends, peak distributions, and earnings</p>
        </div>
        <select
          className="input"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{ width: 'auto', minWidth: 150 }}
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Daily Rides Trend Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ marginBottom: 18, fontSize: '0.95rem', fontWeight: 700 }}>📈 Ride Activity Trend</h4>
          {dailyRides.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'var(--color-text-muted)' }}>
              No ride data available for this range.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 180, paddingBottom: 10, borderBottom: '1.5px solid var(--color-border)' }}>
                {dailyRides.map((d, index) => {
                  const compHeight = (d.completed / maxRides) * 100;
                  const cancHeight = (d.cancelled / maxRides) * 100;
                  return (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        height: '100%',
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      title={`${d.date} — Total: ${d.total} (Completed: ${d.completed}, Cancelled: ${d.cancelled})`}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <div
                        style={{
                          width: '100%',
                          background: 'linear-gradient(180deg, #f87171 0%, #ef4444 100%)',
                          height: `${cancHeight}%`,
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease, opacity 0.15s ease',
                        }}
                      />
                      <div
                        style={{
                          width: '100%',
                          background: 'linear-gradient(180deg, #4ade80 0%, #22c55e 100%)',
                          height: `${compHeight}%`,
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease',
                          marginTop: -1,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 2px 0', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                <span>{dailyRides[0]?.date}</span>
                <span>Middle</span>
                <span>{dailyRides[dailyRides.length - 1]?.date}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: '0.75rem', justifyContent: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'linear-gradient(#4ade80, #22c55e)', display: 'inline-block' }} /> Completed
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'linear-gradient(#f87171, #ef4444)', display: 'inline-block' }} /> Cancelled
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Daily Revenue Trend Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ marginBottom: 18, fontSize: '0.95rem', fontWeight: 700 }}>💰 Gross Revenue Trend</h4>
          {dailyRevenue.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'var(--color-text-muted)' }}>
              No transaction data available for this range.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 180, paddingBottom: 10, borderBottom: '1.5px solid var(--color-border)' }}>
                {dailyRevenue.map((d, index) => {
                  const revHeight = (d.revenue / maxRevenue) * 100;
                  return (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        height: '100%',
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      title={`${d.date} — Revenue: ${formatCurrency(d.revenue)}`}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <div
                        style={{
                          width: '100%',
                          background: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                          height: `${revHeight}%`,
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 2px 0', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                <span>{dailyRevenue[0]?.date}</span>
                <span>Middle</span>
                <span>{dailyRevenue[dailyRevenue.length - 1]?.date}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: '0.75rem', justifyContent: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'linear-gradient(#60a5fa, #2563eb)', display: 'inline-block' }} /> Revenue (INR)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Hourly + Payment row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Hourly Distribution */}
        <div className="card">
          <h4 style={{ marginBottom: 18, fontSize: '0.95rem', fontWeight: 700 }}>⏰ Peak Traffic Hours</h4>
          {hourlyRides.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180, color: 'var(--color-text-muted)' }}>
              No traffic patterns found.
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 160, paddingBottom: 10, borderBottom: '1.5px solid var(--color-border)' }}>
                {hourlyRides.map((h, index) => {
                  const hourPercent = (h.rides / maxHourly) * 100;
                  return (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        display: 'flex',
                        height: '100%',
                        justifyContent: 'flex-end',
                        cursor: 'pointer',
                      }}
                      title={`${h.hour} — ${h.rides} rides`}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <div
                        style={{
                          width: '100%',
                          background: 'linear-gradient(180deg, #a78bfa 0%, #8b5cf6 100%)',
                          height: `${hourPercent}%`,
                          borderRadius: '2px 2px 0 0',
                          transition: 'height 0.3s ease',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 2px 0', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ marginBottom: 18, fontSize: '0.95rem', fontWeight: 700 }}>💳 Payment Methods</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Razorpay */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>💳 Online (Razorpay)</span>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{razorpayPercent}%</span>
                </div>
                <div style={{ height: 10, background: 'var(--color-border)', borderRadius: 5, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${razorpayPercent}%`,
                      background: 'linear-gradient(90deg, #60a5fa, #2563eb)',
                      borderRadius: 5,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <p style={{ margin: '5px 0 0', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  {formatCurrency(razorpayInfo.total)} · {razorpayInfo.count} bookings
                </p>
              </div>

              {/* Cash */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>💵 Cash</span>
                  <span style={{ fontWeight: 800, color: '#22c55e' }}>{cashPercent}%</span>
                </div>
                <div style={{ height: 10, background: 'var(--color-border)', borderRadius: 5, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${cashPercent}%`,
                      background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                      borderRadius: 5,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <p style={{ margin: '5px 0 0', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  {formatCurrency(cashInfo.total)} · {cashInfo.count} bookings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Earning Drivers ── */}
      <div className="card">
        <h4 style={{ marginBottom: 16, fontSize: '0.95rem', fontWeight: 700 }}>🏆 Top Earning Drivers</h4>
        {!revenueData?.topDrivers || revenueData.topDrivers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)' }}>
            No earnings records found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {revenueData.topDrivers.map((d, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  cursor: 'default',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Rank badge */}
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: index < 3 ? '1.1rem' : '0.8rem',
                      background: index === 0
                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                        : index === 1
                        ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                        : index === 2
                        ? 'linear-gradient(135deg, #cd7c3a, #b45309)'
                        : 'var(--gradient-primary)',
                      color: '#fff',
                      boxShadow: index < 3 ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    }}
                  >
                    {index < 3 ? MEDALS[index] : index + 1}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {d.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      {d.email} · ⭐ {d.rating || 0}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#22c55e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {formatCurrency(d.totalEarnings)}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    {d.totalRides || 0} rides
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
