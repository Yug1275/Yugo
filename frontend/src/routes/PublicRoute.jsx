import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};

export default PublicRoute;