import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import AppSidebar from '../components/common/AppSidebar';
import ProfileSidebar from '../components/common/ProfileSidebar';
import useAuth from '../hooks/useAuth';

import { Home, Car, Wallet, Bell } from '../components/common/Icons';

const driverLinks = [
  { to: '/driver',               end: true, icon: <Home size={18} />, label: 'Dashboard'    },
  { to: '/driver/rides',                   icon: <Car size={18} />, label: 'My Rides'     },
  { to: '/driver/earnings',                icon: <Wallet size={18} />, label: 'Earnings'     },
  { to: '/driver/notifications',           icon: <Bell size={18} />, label: 'Notifications'},
];

const DriverLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'driver') return <Navigate to={`/${user?.role}`} replace />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Navbar with hamburger */}
      <Navbar
        onMenuClick={() => setSidebarOpen((o) => !o)}
        onProfileClick={() => setProfileOpen(true)}
        sidebarOpen={sidebarOpen}
      />

      {/* Sliding left sidebar */}
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        links={driverLinks}
        accentDark={false}
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

export default DriverLayout;