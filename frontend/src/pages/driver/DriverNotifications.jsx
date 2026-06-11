import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import useNotifications from '../../hooks/useNotifications';
import { getNotificationsApi } from '../../api/notificationApi';
import { setNotifications, setUnreadCount } from '../../store/notificationSlice';
import Loader from '../../components/common/Loader';
import { Bell, Car, Wallet, Sparkles, Check, Trash2, X } from '../../components/common/Icons';

const TYPE_ICONS = {
  ride_update: <Car size={18} style={{ color: 'var(--color-primary)' }} />,
  payment:     <Wallet size={18} style={{ color: '#22c55e' }} />,
  promo:       <Sparkles size={18} style={{ color: '#f59e0b' }} />,
  system:      <Bell size={18} style={{ color: '#64748b' }} />,
};

const DriverNotifications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    deleteOne,
    clearAll,
  } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await getNotificationsApi({ page, limit: 15 });
        dispatch(setNotifications(res.data.data || []));
        dispatch(setUnreadCount(res.data.unreadCount || 0));
        setPagination(res.data.pagination || {});
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [page, dispatch]);

  const handleClick = (notif) => {
    if (!notif.read) markRead(notif._id);
    if (notif.type === 'ride_update' && notif.relatedId) {
      navigate('/driver/rides');
    } else if (notif.type === 'payment') {
      navigate('/driver/earnings');
    }
  };

  return (
    <div>
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div>
          <h2 className="page-title">Notifications</h2>
          <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {unreadCount > 0 ? `${unreadCount} unread` : (
              <>
                All caught up! <Sparkles size={14} style={{ color: '#f59e0b' }} />
              </>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={markAllRead}>
              <Check size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className="btn btn-sm"
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                padding: '6px 14px',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
              onClick={clearAll}
            >
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <Loader text="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-text-muted)', marginBottom: 12 }}>
            <Bell size={36} strokeWidth={1.5} />
          </div>
          <p className="empty-state-text">No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleClick(notif)}
              style={{
                display: 'flex',
                gap: 14,
                padding: '14px 18px',
                background: notif.read ? 'var(--color-surface)' : 'rgba(34,197,94,0.08)',
                border: `1px solid ${notif.read ? 'var(--color-border)' : '#22c55e'}`,
                borderRadius: 10,
                cursor: 'pointer',
                alignItems: 'flex-start',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Icon */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--color-surface-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {TYPE_ICONS[notif.type] || <Bell size={18} style={{ color: 'var(--color-text-secondary)' }} />}
                  </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: notif.read ? 500 : 700,
                    fontSize: '0.875rem',
                    color: 'var(--color-text-primary)',
                    marginBottom: 3,
                  }}
                >
                  {notif.title}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.4,
                  }}
                >
                  {notif.message}
                </p>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: '0.7rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {formatDateTime(notif.createdAt)}
                </p>
              </div>

              {/* Unread indicator + delete */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {!notif.read && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#22c55e',
                    }}
                  />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteOne(notif._id); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    padding: 2,
                    opacity: 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                  title="Delete"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            marginTop: 24,
          }}
        >
          <button
            className="btn btn-ghost btn-sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Page {page} of {pagination.pages}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page === pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default DriverNotifications;
