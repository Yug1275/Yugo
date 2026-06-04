import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import useAuth from '../hooks/useAuth';

const riderLinks = [
  { to: '/rider', end: true, icon: '🏠', label: 'Dashboard' },
  { to: '/rider/book',       icon: '🚗', label: 'Book a Ride' },
  { to: '/rider/history',    icon: '🕒', label: 'Ride History' },
  { to: '/rider/profile',    icon: '👤', label: 'My Profile' },
  { to: '/rider/locations',  icon: '📍', label: 'Saved Locations' },
];

const RiderLayout = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'rider') return <Navigate to={`/${user?.role}`} replace />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar links={riderLinks} />
        <main style={{ flex: 1, padding: '28px 32px', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RiderLayout;