import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Avatar from './Avatar';

/**
 * AppSidebar — a sliding left-drawer used by all role layouts.
 *
 * Props:
 *   isOpen   {boolean}  — whether the drawer is visible
 *   onClose  {fn}       — close callback (backdrop click / Escape)
 *   links    {Array}    — nav link objects: { to, end, icon, label }
 *   accentDark {boolean} — if true, uses the dark admin palette
 */
const AppSidebar = ({ isOpen, onClose, links = [], accentDark = false }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close when route changes (link was clicked)
  useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const bg = accentDark ? '#0f172a' : 'var(--color-surface)';
  const borderColor = accentDark ? 'rgba(255,255,255,0.08)' : 'var(--color-border)';
  const linkColor = accentDark ? '#94a3b8' : 'var(--color-text-secondary)';
  const linkActiveColor = accentDark ? '#fff' : 'var(--color-primary)';
  const linkActiveBg = accentDark ? 'rgba(37,99,235,0.25)' : 'var(--color-primary-light)';
  const headerBg = accentDark
    ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
    : 'var(--gradient-primary)';

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 190,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity 0.3s ease',
        }}
        aria-hidden="true"
      />

      {/* ── Sidebar Drawer ───────────────────────────────── */}
      <aside
        aria-label="Navigation sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 260,
          maxWidth: '85vw',
          zIndex: 191,
          display: 'flex',
          flexDirection: 'column',
          background: bg,
          borderRight: `1px solid ${borderColor}`,
          boxShadow: isOpen ? '4px 0 32px rgba(0,0,0,0.18)' : 'none',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* ── Gradient header ──────────────────────────── */}
        <div
          style={{
            background: headerBg,
            padding: '20px 16px 18px',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Subtle diagonal pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 18px, rgba(255,255,255,0.03) 18px, rgba(255,255,255,0.03) 36px)',
            pointerEvents: 'none',
          }} />

          {/* Close button (top-right of header) */}
          <button
            onClick={onClose}
            aria-label="Close navigation"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
              zIndex: 1,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            ✕
          </button>

          {/* Avatar + user info */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar user={user} size={46} online={true} borderColor="rgba(255,255,255,0.5)" />
            <div style={{ minWidth: 0 }}>
              <p style={{
                margin: 0,
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#fff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.name}
              </p>
              <p style={{
                margin: 0,
                fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.72)',
                textTransform: 'capitalize',
              }}>
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* ── Section label ─────────────────────────────── */}
        <div style={{
          padding: '14px 20px 6px',
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.8px',
          color: accentDark ? '#475569' : 'var(--color-text-muted)',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}>
          Navigation
        </div>

        {/* ── Nav links ─────────────────────────────────── */}
        <nav style={{ flex: 1, paddingBottom: 16 }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 20px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? linkActiveColor : linkColor,
                background: isActive ? linkActiveBg : 'transparent',
                borderLeft: isActive
                  ? '3px solid var(--color-primary)'
                  : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
              onMouseEnter={(e) => {
                // Check if not active by looking for active class or border
                const isActive = e.currentTarget.style.borderLeftColor?.includes('#2563') ||
                  e.currentTarget.getAttribute('aria-current') === 'page';
                if (!isActive) {
                  e.currentTarget.style.background = accentDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'var(--color-surface-2)';
                  e.currentTarget.style.color = accentDark ? '#e2e8f0' : 'var(--color-text-primary)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }
              }}
              onMouseLeave={(e) => {
                const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = linkColor;
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── Footer hint ───────────────────────────────── */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${borderColor}`,
          fontSize: '0.7rem',
          color: accentDark ? '#334155' : 'var(--color-text-muted)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span>Press</span>
          <kbd style={{
            padding: '2px 6px',
            borderRadius: 5,
            border: `1px solid ${accentDark ? '#334155' : 'var(--color-border)'}`,
            fontSize: '0.65rem',
            fontFamily: 'monospace',
            background: accentDark ? 'rgba(255,255,255,0.04)' : 'var(--color-surface-2)',
            color: accentDark ? '#64748b' : 'var(--color-text-muted)',
          }}>Esc</kbd>
          <span>to close</span>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
