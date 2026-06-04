import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Placeholder dashboards — replaced phase by phase
import NotFound from '../pages/NotFound';

// Role-based default redirect
import useAuth from '../hooks/useAuth';

const RoleRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user?.role}`} replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root → redirect based on auth state */}
        <Route path="/" element={<RoleRedirect />} />

        {/* Public only — redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected stubs — pages added per phase */}
        <Route
          path="/rider/*"
          element={
            <ProtectedRoute allowedRoles={['rider']}>
              <div className="page-container" style={{ paddingTop: 40 }}>
                <h2>Rider Dashboard — Coming in Phase 7</h2>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/*"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <div className="page-container" style={{ paddingTop: 40 }}>
                <h2>Driver Dashboard — Coming in Phase 10</h2>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="page-container" style={{ paddingTop: 40 }}>
                <h2>Admin Dashboard — Coming in Phase 15</h2>
              </div>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;