import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import AppSidebar from '../components/common/AppSidebar';
import ProfileSidebar from '../components/common/ProfileSidebar';
import useAuth from '../hooks/useAuth';

import { LayoutDashboard, Users, Car, Route, CreditCard, TrendingUp } from '../components/common/Icons';

const adminLinks = [
  { to: '/admin',           end: true, icon: <LayoutDashboard size={18} />, label: 'Dashboard'  },
  { to: '/admin/users',               icon: <Users size={18} />, label: 'Users'      },
  { to: '/admin/drivers',             icon: <Car size={18} />, label: 'Drivers'    },
  { to: '/admin/rides',               icon: <Route size={18} />, label: 'Rides'      },
  { to: '/admin/payments',            icon: <CreditCard size={18} />, label: 'Payments'   },
  { to: '/admin/analytics',           icon: <TrendingUp size={18} />, label: 'Analytics'  },
];

const AdminLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to={`/${user?.role}`} replace />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Navbar with hamburger */}
      <Navbar
        onMenuClick={() => setSidebarOpen((o) => !o)}
        onProfileClick={() => setProfileOpen(true)}
        sidebarOpen={sidebarOpen}
      />

      {/* Sliding left sidebar (dark admin palette) */}
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        links={adminLinks}
        accentDark={true}
      />

      {/* Main content — always full width */}
      <main
        className="app-main"
        style={{
          minHeight: 'calc(100vh - 67px)',
          padding: '24px 28px',
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </main>

      {/* Right profile sidebar */}
      <ProfileSidebar
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
};

export default AdminLayout;
