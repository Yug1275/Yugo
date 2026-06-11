import { Navigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';

const STAT_CARDS = [
  { icon: '🚗', value: '10,000+', label: 'Rides Daily' },
  { icon: '⭐', value: '4.9', label: 'Avg Rating' },
  { icon: '🧑‍✈️', value: '500+', label: 'Active Drivers' },
];

const AuthLayout = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {/* ─── LEFT PANEL (desktop only) ──────────────────────── */}
      <div
        className="auth-split-left"
        style={{
          width: '45%',
          minHeight: '100vh',
          background: 'var(--gradient-auth-left)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated blobs */}
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />

        {/* Grid pattern overlay */}
        <div className="auth-pattern" />

        {/* Top: YUGO logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              🚀
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: '#fff',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '-1px',
                  lineHeight: 1,
                }}
              >
                YUGO
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginTop: 2 }}>
                Move smarter. Arrive better.
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Headline */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            India's Premium Ride Platform
          </p>
          <h1
            style={{
              fontSize: '2.6rem',
              fontWeight: 800,
              color: '#fff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1.15,
              letterSpacing: '-1.5px',
              marginBottom: 20,
            }}
          >
            Your ride,<br />
            your way.
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 320 }}>
            Book rides in seconds, track drivers in real-time, and pay effortlessly.
          </p>

          {/* Stat cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 36 }}>
            {STAT_CARDS.map((stat, i) => (
              <div
                key={i}
                className="auth-stat-card"
                style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
              >
                <span style={{ fontSize: '1.3rem' }}>{stat.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Social proof */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex' }}>
              {['🧑', '👩', '🧔', '👧', '🧓'].map((e, i) => (
                <div
                  key={i}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    marginLeft: i > 0 ? -8 : 0,
                  }}
                >
                  {e}
                </div>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
              Trusted by <strong style={{ color: '#fff' }}>50,000+</strong> riders
            </p>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (form) ──────────────────────────────── */}
      <div
        className="auth-split-right"
        style={{
          flex: 1,
          minHeight: '100vh',
          background: 'var(--color-bg)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
          }}
        >
          {/* Logo (shown only on mobile when left panel is hidden) */}
          <div style={{ display: 'none' }} className="auth-mobile-logo">
            <Logo size="sm" showTagline={false} />
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              width: 38,
              height: 38,
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Centered form */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px 40px',
          }}
        >
          {children}
        </div>

        {/* Bottom social proof (mobile) */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
            padding: '0 16px 24px',
          }}
        >
          🔒 Trusted by 50,000+ riders · Secure · Reliable
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;