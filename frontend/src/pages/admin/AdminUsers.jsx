import { useEffect, useState, useRef } from 'react';
import { getAllUsersApi, updateUserStatusApi } from '../../api/adminApi';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/helpers';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('rider');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const debounceRef = useRef(null);

  const fetchUsers = async (p = 1, q = '', role = 'rider') => {
    setLoading(true);
    try {
      const res = await getAllUsersApi({ page: p, limit: 12, q, role });
      setUsers(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(page, search, roleFilter); }, [page, roleFilter]);

  const handleSearch = (val) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, val, roleFilter);
    }, 400);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setActionLoading(userId);
    try {
      await updateUserStatusApi(userId, !currentStatus);
      setUsers((prev) =>
        prev.map((u) => u._id === userId ? { ...u, isActive: !currentStatus } : u)
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">User Management</h2>
        <p className="page-subtitle">Manage all riders and drivers</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔍</span>
            <input
              className="input"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          {['rider', 'driver', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: `1.5px solid ${roleFilter === r ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: roleFilter === r ? 'var(--color-primary)' : 'var(--color-surface)',
                color: roleFilter === r ? '#fff' : 'var(--color-text-secondary)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {r}s
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader text="Loading users..." />
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-text">No users found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map((user) => (
            <div
              key={user._id}
              className="card"
              style={{
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
                opacity: user.isActive ? 1 : 0.6,
              }}
            >
              {/* Left */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: user.role === 'admin' ? '#7c3aed' : user.role === 'driver' ? '#0f172a' : 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    flexShrink: 0,
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {user.email} · {user.phone || 'No phone'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    Joined {formatDateTime(user.createdAt)}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    background: user.isActive ? '#dcfce7' : '#fee2e2',
                    color: user.isActive ? '#166534' : '#991b1b',
                  }}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>

                {user.role !== 'admin' && (
                  <button
                    onClick={() => handleToggleStatus(user._id, user.isActive)}
                    disabled={actionLoading === user._id}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: `1px solid ${user.isActive ? '#fecaca' : '#bbf7d0'}`,
                      background: user.isActive ? '#fee2e2' : '#dcfce7',
                      color: user.isActive ? '#991b1b' : '#166534',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      cursor: actionLoading === user._id ? 'not-allowed' : 'pointer',
                      opacity: actionLoading === user._id ? 0.6 : 1,
                    }}
                  >
                    {actionLoading === user._id ? '...' : user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                )}
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
    </div>
  );
};

export default AdminUsers;
