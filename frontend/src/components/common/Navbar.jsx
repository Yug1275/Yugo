import { Link } from 'react-router-dom';
import useTheme from '../../hooks/useTheme';
import useAuth from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';
import Logo from './Logo';
import { ChevronDown, Sun, Moon } from './Icons';

const Navbar = ({ onProfileClick, onMenuClick, sidebarOpen }) => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();

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
            ? 'rgba(30, 41, 59, 0.95)'
            : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 16px 0 12px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 3,
          zIndex: 150,
          boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
          marginTop: 3,
          gap: 8,
        }}
      >
        {/* Left: Hamburger + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAuthenticated && (
            <button
              onClick={onMenuClick}
              title={sidebarOpen ? 'Close menu' : 'Open menu'}
              aria-label="Toggle navigation menu"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: sidebarOpen ? 'var(--color-primary-50)' : 'transparent',
                border: `1.5px solid ${sidebarOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                flexShrink: 0,
                transition: 'all 0.2s ease',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                if (!sidebarOpen) {
                  e.currentTarget.style.background = 'var(--color-surface-2)';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!sidebarOpen) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }
              }}
            >
              {/* Animated hamburger lines */}
              <span style={{
                display: 'block',
                width: 16,
                height: 2,
                borderRadius: 2,
                background: sidebarOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                transform: sidebarOpen ? 'translateY(6px) rotate(45deg)' : 'none',
                transition: 'all 0.25s ease',
              }} />
              <span style={{
                display: 'block',
                width: 16,
                height: 2,
                borderRadius: 2,
                background: sidebarOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                opacity: sidebarOpen ? 0 : 1,
                transition: 'all 0.25s ease',
              }} />
              <span style={{
                display: 'block',
                width: 16,
                height: 2,
                borderRadius: 2,
                background: sidebarOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                transform: sidebarOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
                transition: 'all 0.25s ease',
              }} />
            </button>
          )}
          <Logo size="sm" linkTo={isAuthenticated ? `/${user?.role}` : '/'} />
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* Clickable profile pill */}
              <button
                onClick={onProfileClick}
                title="Open profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'transparent',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 24,
                  padding: '4px 10px 4px 4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-surface-2)';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                    letterSpacing: '0.5px',
                  }}
                >
                  {initials}
                </div>

                {/* Name — hidden on small screens */}
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

                {/* Chevron */}
                <ChevronDown size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              </button>
            </>
          ) : (
            <>
              {/* Theme toggle for unauthenticated */}
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
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