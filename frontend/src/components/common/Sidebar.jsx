import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Avatar from './Avatar';

const Sidebar = ({ links = [] }) => {
  const { user } = useAuth();

  return (
    <>
    <aside
      className="desktop-sidebar responsive-sticky"
      style={{
        width: 240,
        minHeight: 'calc(100vh - 67px)',
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        position: 'sticky',
        top: 67,
        flexShrink: 0,
      }}
    >
      {/* User info — gradient header */}
      <div
        style={{
          margin: '0 12px 16px',
          background: 'var(--gradient-primary)',
          borderRadius: 12,
          padding: '14px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.04) 20px, rgba(255,255,255,0.04) 40px)',
            borderRadius: 12,
          }}
        />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Avatar with online indicator */}
          <Avatar user={user} size={40} online={true} borderColor="rgba(255,255,255,0.4)" />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            fontSize: '0.875rem',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            background: isActive
              ? 'linear-gradient(90deg, var(--color-primary-50), transparent)'
              : 'transparent',
            borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
            transform: 'translateX(0)',
          })}
          onMouseEnter={(e) => {
            if (!e.currentTarget.style.borderLeftColor?.includes('#2563')) {
              e.currentTarget.style.transform = 'translateX(2px)';
              e.currentTarget.style.background = 'var(--color-surface-2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.style.borderLeftColor?.includes('#2563')) {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
          <span>{link.label}</span>
        </NavLink>
      ))}
    </aside>

    {/* Mobile bottom nav */}
    <nav className="mobile-bottom-nav">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            padding: '8px 0',
            flex: 1,
            fontSize: '0.6rem',
            fontWeight: 600,
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
            textDecoration: 'none',
            transition: 'color 0.15s ease',
          })}
        >
          <span style={{ fontSize: '1.2rem' }}>{link.icon}</span>
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
    </>
  );
};

export default Sidebar;