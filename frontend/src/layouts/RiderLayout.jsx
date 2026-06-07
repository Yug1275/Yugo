import { useState } from 'react';
import { Navigate, Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import useAuth from '../hooks/useAuth';

const riderLinks = [
  { to: '/rider',           end: true, icon: '🏠', label: 'Home'      },
  { to: '/rider/book',               icon: '🚗', label: 'Book'      },
  { to: '/rider/history',            icon: '🕒', label: 'History'   },
  { to: '/rider/payments',           icon: '💳', label: 'Payments' },
  { to: '/rider/reviews',            icon: '⭐', label: 'Reviews'  },
  { to: '/rider/search',             icon: '🔍', label: 'Search'    },
  { to: '/rider/profile',            icon: '👤', label: 'Profile'   },
  { to: '/rider/locations',          icon: '📍', label: 'Saved'     },
];

const RiderLayout = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'rider') return <Navigate to={`/${user?.role}`} replace />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />

      <div style={{ display: 'flex' }}>

        {/* ── Desktop Sidebar ─────────────────────────────────── */}
        <aside
          style={{
            width: 220,
            minHeight: 'calc(100vh - 64px)',
            background: 'var(--color-surface)',
            borderRight: '1px solid var(--color-border)',
            padding: '20px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            position: 'sticky',
            top: 64,
            flexShrink: 0,
          }}
          className="desktop-sidebar"
        >
          {/* User info */}
          <div
            style={{
              padding: '0 16px 16px',
              borderBottom: '1px solid var(--color-border)',
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
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
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Rider
            </p>
          </div>

          {riderLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
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

        {/* ── Main Content ─────────────────────────────────────── */}
        <main
          style={{ flex: 1, padding: '24px 28px', overflowX: 'hidden' }}
          className="rider-main"
        >
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Bottom Nav ────────────────────────────────── */}
      <nav className="mobile-bottom-nav">
        {riderLinks.map((link) => (
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
            <span style={{ fontSize: '1.3rem' }}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default RiderLayout;