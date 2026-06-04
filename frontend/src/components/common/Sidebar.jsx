import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ links = [] }) => {
  const { user } = useAuth();

  return (
    <aside
      style={{
        width: 240,
        minHeight: 'calc(100vh - 64px)',
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        position: 'sticky',
        top: 64,
        flexShrink: 0,
      }}
    >
      {/* User info */}
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--color-border)', marginBottom: 8 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            marginBottom: 8,
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          {user?.name}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, textTransform: 'capitalize' }}>
          {user?.role}
        </p>
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
            fontWeight: 500,
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            background: isActive ? 'var(--color-primary-light)' : 'transparent',
            borderRight: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          })}
        >
          <span>{link.icon}</span>
          <span>{link.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;