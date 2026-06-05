import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Rider pages
import RiderLayout from '../layouts/RiderLayout';
import RiderDashboard from '../pages/rider/RiderDashboard';
import RideHistory from '../pages/rider/RideHistory';
import Profile from '../pages/rider/Profile';
import SavedLocations from '../pages/rider/SavedLocations';

// 404
import NotFound from '../pages/NotFound';

// Role-based root redirect
import useAuth from '../hooks/useAuth';
import BookRide from '../pages/rider/BookRide';

const RoleRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user?.role}`} replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route path="/" element={<RoleRedirect />} />

        {/* Public only */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Rider routes */}
        <Route
          path="/rider"
          element={
            <ProtectedRoute allowedRoles={['rider']}>
              <RiderLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RiderDashboard />} />
          <Route path="history" element={<RideHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="locations" element={<SavedLocations />} />
          <Route path="book" element={<BookRide />} />
        </Route>

        {/* Driver routes — Phase 10 */}
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

        {/* Admin routes — Phase 15 */}
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