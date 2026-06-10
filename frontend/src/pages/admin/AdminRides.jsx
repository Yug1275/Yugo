import { useEffect, useState, useRef } from 'react';
import { getAllRidesAdminApi, exportRidesApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const STATUS_OPTIONS = ['all', 'pending', 'accepted', 'en_route', 'started', 'completed', 'cancelled'];

const AdminRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [exporting, setExporting] = useState(false);
  const debounceRef = useRef(null);

  const fetchRides = async (p = 1, q = '', status = 'all') => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10, q };
      if (status !== 'all') params.status = status;
      const res = await getAllRidesAdminApi(params);
      setRides(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRides(page, search, statusFilter); }, [page, statusFilter]);

  const handleSearch = (val) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); fetchRides(1, val, statusFilter); }, 400);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await exportRidesApi(params);
      const data = res.data.data;
      if (!data || data.length === 0) {
        alert('No rides found matching filters to export.');
        return;
      }
      
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const val = row[header] === null || row[header] === undefined ? '' : row[header];
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
          }).join(',')
        )
      ];

      const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `yugo_rides_${statusFilter}_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export rides CSV: ' + (err.response?.data?.error || err.message));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 className="page-title">Ride Records</h2>
          <p className="page-subtitle">View and monitor platform rides and routes</p>
        </div>
        <Button variant="secondary" onClick={handleExportCSV} loading={exporting} size="sm">
          📥 Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔍</span>
            <input
              className="input"
              placeholder="Search pickup/destination address..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ width: 'auto', minWidth: 150, textTransform: 'capitalize' }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <Loader text="Loading ride history..." />
      ) : rides.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛣️</div>
          <p className="empty-state-text">No rides found.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--color-surface)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Ride ID</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Rider</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Driver</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Route Details</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Fare</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
                <tr key={ride._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.1s' }}>
                  {/* Ride ID */}
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    {ride._id.toString().slice(-6).toUpperCase()}
                  </td>
                  
                  {/* Rider */}
                  <td style={{ padding: '14px 18px' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text-primary)' }}>{ride.riderId?.name || 'Deleted Rider'}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{ride.riderId?.email || ''}</p>
                  </td>

                  {/* Driver */}
                  <td style={{ padding: '14px 18px' }}>
                    {ride.driverId?.userId ? (
                      <>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text-primary)' }}>{ride.driverId.userId.name}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{ride.driverId.userId.email}</p>
                      </>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>

                  {/* Route details */}
                  <td style={{ padding: '14px 18px', maxWidth: 280 }}>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      📍 <strong>From:</strong> {ride.pickup?.address}
                    </p>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      🏁 <strong>To:</strong> {ride.destination?.address}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {ride.distanceKm ? `${ride.distanceKm} km` : ''} {ride.durationMin ? `· ${Math.round(ride.durationMin)} mins` : ''}
                    </p>
                  </td>

                  {/* Fare */}
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {formatCurrency(ride.finalFare || ride.fare || 0)}
                  </td>

                  {/* Date */}
                  <td style={{ padding: '14px 18px', color: 'var(--color-text-muted)' }}>
                    {formatDateTime(ride.createdAt)}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 18px' }}>
                    <span className={`badge badge-${ride.status}`}>
                      {ride.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 24 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Page {page} of {pagination.pages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default AdminRides;
