import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import AppSidebar from '../components/common/AppSidebar';
import ProfileSidebar from '../components/common/ProfileSidebar';
import useAuth from '../hooks/useAuth';

import { Home, Car, History, CreditCard, Star, Bell, Search, MapPin } from '../components/common/Icons';

const riderLinks = [
  { to: '/rider',               end: true, icon: <Home size={18} />, label: 'Home'          },
  { to: '/rider/book',                     icon: <Car size={18} />, label: 'Book a Ride'   },
  { to: '/rider/history',                  icon: <History size={18} />, label: 'Ride History'  },
  { to: '/rider/payments',                 icon: <CreditCard size={18} />, label: 'Payments'      },
  { to: '/rider/reviews',                  icon: <Star size={18} />, label: 'My Reviews'    },
  { to: '/rider/notifications',            icon: <Bell size={18} />, label: 'Notifications' },
  { to: '/rider/search',                   icon: <Search size={18} />, label: 'Search'        },
  { to: '/rider/locations',                icon: <MapPin size={18} />, label: 'Saved Places'  },
];

const RiderLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'rider') return <Navigate to={`/${user?.role}`} replace />;

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
        links={riderLinks}
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

export default RiderLayout;