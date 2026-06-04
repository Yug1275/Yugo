import { Navigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import useAuth from '../hooks/useAuth';

const DashboardLayout = ({ children, sidebarLinks = [], requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar links={sidebarLinks} />
        <main style={{ flex: 1, padding: '28px 32px', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;