import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullPage />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to={`/${user?.role}`} replace />;
  }

  return children;
};

export default ProtectedRoute;