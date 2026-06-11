import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications';
import { formatDateTime } from '../../utils/helpers';

const TYPE_ICONS = {
  ride_update: '🚗',
  payment:     '💳',
  promo:       '🎉',
  system:      '🔔',
};

const TYPE_COLORS = {
  ride_update: 'var(--color-primary)',
  payment:     '#22c55e',
  promo:       '#f59e0b',
  system:      '#8b5cf6',
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, deleteOne, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    if (!notif.read) markRead(notif._id);
    setOpen(false);

    if (notif.type === 'ride_update' && notif.relatedId) {
      navigate(`/rider/tracking/${notif.relatedId}`);
    } else if (notif.type === 'payment') {
      navigate('/rider/payments');
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: 'relative',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
          width: 36,
          height: 36,
          cursor: 'pointer',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
        title="Notifications"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            className="badge-pulse"
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: 'var(--gradient-primary)',
              color: '#fff',
              borderRadius: '50%',
              width: 18,
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--color-surface)',
              boxShadow: '0 2px 6px rgba(37,99,235,0.4)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="notif-dropdown"
          style={{
            position: 'absolute',
            top: 44,
            right: 0,
            width: 340,
            maxHeight: 480,
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid var(--color-border)',
              flexShrink: 0,
              background: 'var(--color-surface-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'var(--gradient-primary)',
                    color: '#fff',
                    borderRadius: 20,
                    padding: '1px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  padding: '2px 6px',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔔</div>
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 15).map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--color-border)',
                    borderLeft: notif.read ? '3px solid transparent' : `3px solid ${TYPE_COLORS[notif.type] || 'var(--color-primary)'}`,
                    background: notif.read ? 'transparent' : 'var(--color-primary-50)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    alignItems: 'flex-start',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'var(--color-surface-2)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = notif.read
                      ? 'transparent'
                      : 'var(--color-primary-50)')
                  }
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: `${TYPE_COLORS[notif.type] || 'var(--color-primary)'}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0,
                      border: `1px solid ${TYPE_COLORS[notif.type] || 'var(--color-primary)'}30`,
                    }}
                  >
                    {TYPE_ICONS[notif.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        fontWeight: notif.read ? 500 : 700,
                        color: 'var(--color-text-primary)',
                        lineHeight: 1.3,
                      }}
                    >
                      {notif.title}
                    </p>
                    <p
                      style={{
                        margin: '3px 0 0',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {notif.message}
                    </p>
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: '0.68rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {formatDateTime(notif.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot + delete */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    {!notif.read && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'var(--gradient-primary)',
                          boxShadow: '0 0 0 2px rgba(37,99,235,0.2)',
                        }}
                      />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteOne(notif._id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                        fontSize: '1rem',
                        padding: 2,
                        lineHeight: 1,
                        opacity: 0.6,
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              style={{
                padding: '10px 14px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                flexShrink: 0,
                background: 'var(--color-surface-2)',
              }}
            >
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/rider/notifications');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                }}
              >
                View all →
              </button>
              <button
                onClick={clearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
