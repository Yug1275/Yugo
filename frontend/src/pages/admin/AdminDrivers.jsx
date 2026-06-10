import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getAllDriversApi,
  approveDriverApi,
  suspendDriverApi,
  unsuspendDriverApi,
} from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { formatDateTime } from '../../utils/helpers';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'suspended'];

const AdminDrivers = () => {
  const [searchParams] = useSearchParams();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [suspendModal, setSuspendModal] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const debounceRef = useRef(null);

  const fetchDrivers = async (p = 1, q = '', status = 'all') => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10, q };
      if (status !== 'all') params.status = status;
      const res = await getAllDriversApi(params);
      setDrivers(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(page, search, statusFilter); }, [page, statusFilter]);

  const handleSearch = (val) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); fetchDrivers(1, val, statusFilter); }, 400);
  };

  const handleApprove = async (driverId) => {
    setActionLoading(driverId + '_approve');
    try {
      await approveDriverApi(driverId);
      setDrivers((prev) => prev.map((d) => d._id === driverId ? { ...d, isApproved: true, isSuspended: false } : d));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async () => {
    if (!suspendModal) return;
    setActionLoading(suspendModal + '_suspend');
    try {
      await suspendDriverApi(suspendModal, suspendReason);
      setDrivers((prev) => prev.map((d) => d._id === suspendModal ? { ...d, isSuspended: true, availability: false } : d));
      setSuspendModal(null);
      setSuspendReason('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to suspend');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsuspend = async (driverId) => {
    setActionLoading(driverId + '_unsuspend');
    try {
      await unsuspendDriverApi(driverId);
      setDrivers((prev) => prev.map((d) => d._id === driverId ? { ...d, isSuspended: false } : d));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to unsuspend');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Driver Management</h2>
        <p className="page-subtitle">Approve, suspend and manage drivers</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔍</span>
            <input
              className="input"
              placeholder="Search by name, email, license..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setStatusFilter(f); setPage(1); }}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                border: `1.5px solid ${statusFilter === f ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: statusFilter === f ? 'var(--color-primary)' : 'var(--color-surface)',
                color: statusFilter === f ? '#fff' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Driver cards */}
      {loading ? (
        <Loader text="Loading drivers..." />
      ) : drivers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚗</div>
          <p className="empty-state-text">No drivers found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {drivers.map((driver) => (
            <div
              key={driver._id}
              className="card"
              style={{
                padding: '16px 20px',
                opacity: driver.isSuspended ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>

                {/* Left: driver info */}
                <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 220 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      background: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    {driver.userId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{driver.userId?.name}</p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {driver.userId?.email}
                    </p>
                    {driver.licenseNumber && (
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        🪪 {driver.licenseNumber}
                      </p>
                    )}
                    {driver.vehicle && (
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        🚗 {driver.vehicle.vehicleModel} · {driver.vehicle.vehicleNumber}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      <span>⭐ {driver.rating || 0}</span>
                      <span>🚗 {driver.totalRides || 0} rides</span>
                      <span>📅 {formatDateTime(driver.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: status + actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  {/* Status badges */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: driver.isApproved ? '#dcfce7' : '#fef3c7',
                        color: driver.isApproved ? '#166534' : '#92400e',
                      }}
                    >
                      {driver.isApproved ? '✅ Approved' : '⏳ Pending'}
                    </span>
                    {driver.isSuspended && (
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, background: '#fee2e2', color: '#991b1b' }}>
                        ⛔ Suspended
                      </span>
                    )}
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: driver.availability ? '#dcfce7' : '#f1f5f9',
                        color: driver.availability ? '#166534' : '#64748b',
                      }}
                    >
                      {driver.availability ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {!driver.isApproved && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(driver._id)}
                        loading={actionLoading === driver._id + '_approve'}
                      >
                        Approve
                      </Button>
                    )}
                    {driver.isApproved && !driver.isSuspended && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setSuspendModal(driver._id)}
                        disabled={actionLoading === driver._id + '_suspend'}
                      >
                        Suspend
                      </Button>
                    )}
                    {driver.isSuspended && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUnsuspend(driver._id)}
                        loading={actionLoading === driver._id + '_unsuspend'}
                      >
                        Unsuspend
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
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

      {/* Suspend Reason Modal */}
      <Modal
        isOpen={!!suspendModal}
        onClose={() => { setSuspendModal(null); setSuspendReason(''); }}
        title="Suspend Driver Account"
      >
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="input-label">Reason for Suspension</label>
          <textarea
            className="input"
            rows={3}
            placeholder="Please enter the reason for suspending this driver..."
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" size="sm" onClick={() => { setSuspendModal(null); setSuspendReason(''); }}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleSuspend}
            disabled={!suspendReason.trim()}
            loading={actionLoading === suspendModal + '_suspend'}
          >
            Suspend Driver
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDrivers;
