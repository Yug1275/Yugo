import { useState, useRef } from 'react';
import { searchApi } from '../../api/driverApi';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const TYPES = [
  { value: 'all',     label: 'All'     },
  { value: 'rides',   label: 'Rides'   },
  { value: 'drivers', label: 'Drivers' },
];

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const handleSearch = async (q, t) => {
    if (!q.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await searchApi(q, t);
      setResults(res.data.data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val, type), 500);
  };

  const handleTypeChange = (t) => {
    setType(t);
    if (query.trim()) handleSearch(query, t);
  };

  const totalResults = (results?.rides?.length || 0) + (results?.drivers?.length || 0);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Search</h2>
        <p className="page-subtitle">Search rides, drivers, and locations</p>
      </div>

      {/* Search bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
          <input
            className="input"
            placeholder="Search by address, driver name, status..."
            value={query}
            onChange={handleQueryChange}
            style={{ paddingLeft: 38 }}
            autoFocus
          />
        </div>

        {/* Type tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => handleTypeChange(t.value)}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                border: `1.5px solid ${type === t.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: type === t.value ? 'var(--color-primary)' : 'var(--color-surface)',
                color: type === t.value ? '#fff' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <Loader text="Searching..." />
      ) : !results ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-text">Type something to search rides and drivers</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <p className="empty-state-text">No results found for "{query}"</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Ride results */}
          {results.rides?.length > 0 && (
            <div className="card">
              <h4 style={{ marginBottom: 14 }}>
                🚗 Rides <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>({results.rides.length})</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {results.rides.map((ride) => (
                  <div
                    key={ride._id}
                    style={{
                      padding: '12px 14px',
                      background: 'var(--color-surface-2)',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                        <Badge status={ride.status} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {formatDateTime(ride.createdAt)}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        📍 {ride.pickup?.address} → {ride.destination?.address}
                      </p>
                      {ride.riderId?.name && (
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 3 }}>
                          👤 {ride.riderId.name}
                        </p>
                      )}
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem', flexShrink: 0 }}>
                      {formatCurrency(ride.finalFare || ride.fare)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Driver results */}
          {results.drivers?.length > 0 && (
            <div className="card">
              <h4 style={{ marginBottom: 14 }}>
                🧑‍✈️ Drivers <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>({results.drivers.length})</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {results.drivers.map((driver) => (
                  <div
                    key={driver._id}
                    style={{
                      padding: '12px 14px',
                      background: 'var(--color-surface-2)',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10,
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                        {driver.userId?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{driver.userId?.name}</p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {driver.licenseNumber} · ⭐ {driver.rating || 'N/A'} · {driver.totalRides} rides
                        </p>
                        {driver.vehicle && (
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            🚗 {driver.vehicle.vehicleModel} · {driver.vehicle.vehicleNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: driver.availability ? '#dcfce7' : '#f1f5f9',
                          color: driver.availability ? '#166534' : '#64748b',
                        }}
                      >
                        {driver.availability ? '🟢 Online' : '🔴 Offline'}
                      </span>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: driver.isApproved ? '#dbeafe' : '#fef3c7',
                          color: driver.isApproved ? '#1e40af' : '#92400e',
                        }}
                      >
                        {driver.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;