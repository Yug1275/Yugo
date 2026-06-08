import { Link } from 'react-router-dom';
import Logo from './Logo';
import useTheme from '../../hooks/useTheme';
import useAuth from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 20px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Logo */}
      <Logo size="sm" linkTo={isAuthenticated ? `/${user?.role}` : '/'} />

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

        {isAuthenticated ? (
          <>
            {/* Notification Bell */}
            <NotificationBell />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                width: 36,
                height: 36,
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Name */}
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                maxWidth: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              className="nav-username"
            >
              {user?.name}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={logout}
              style={{ flexShrink: 0 }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;