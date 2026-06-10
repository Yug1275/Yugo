import { Navigate, Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import useAuth from '../hooks/useAuth';

const adminLinks = [
  { to: '/admin',           end: true, icon: '📊', label: 'Dashboard'  },
  { to: '/admin/users',               icon: '👥', label: 'Users'      },
  { to: '/admin/drivers',             icon: '🚗', label: 'Drivers'    },
  { to: '/admin/rides',               icon: '🛣️', label: 'Rides'      },
  { to: '/admin/payments',            icon: '💳', label: 'Payments'   },
  { to: '/admin/analytics',           icon: '📈', label: 'Analytics'  },
];

const AdminLayout = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to={`/${user?.role}`} replace />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>

        {/* Sidebar */}
        <aside
          className="desktop-sidebar"
          style={{
            width: 230,
            minHeight: 'calc(100vh - 64px)',
            background: 'var(--color-secondary)',
            padding: '20px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            position: 'sticky',
            top: 64,
            flexShrink: 0,
          }}
        >
          {/* Admin badge */}
          <div
            style={{
              padding: '0 16px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              marginBottom: 8,
            }}
          >
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
                fontSize: '1rem',
                marginBottom: 8,
              }}
            >
              🛡️
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
              Admin Panel
            </p>
          </div>

          {adminLinks.map((link) => (
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
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? 'rgba(37,99,235,0.3)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </aside>

        {/* Main */}
        <main
          className="admin-main"
          style={{ flex: 1, padding: '24px 28px', overflowX: 'hidden' }}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        {adminLinks.map((link) => (
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
              fontSize: '0.55rem',
              fontWeight: 600,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              textDecoration: 'none',
            })}
          >
            <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminLayout;
