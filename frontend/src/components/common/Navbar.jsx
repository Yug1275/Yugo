import { Link } from 'react-router-dom';
import useTheme from '../../hooks/useTheme';
import useAuth from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';
import Logo from './Logo';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      {/* Top brand accent line */}
      <div className="navbar-brand-line" />

      <nav
        style={{
          background: isDark
            ? 'rgba(30, 41, 59, 0.92)'
            : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 20px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 3,
          zIndex: 50,
          boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
          marginTop: 3,
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
                  borderRadius: 10,
                  width: 36,
                  height: 36,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {/* Avatar with initials */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                  letterSpacing: '0.5px',
                }}
              >
                {initials}
              </div>

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

              {/* Logout */}
              <button
                className="btn btn-ghost btn-sm"
                onClick={logout}
                style={{ flexShrink: 0, gap: 6 }}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              {/* Theme toggle for unauth */}
              <button
                onClick={toggleTheme}
                title="Toggle theme"
                style={{
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
                }}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;