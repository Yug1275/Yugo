import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import useAuth from '../hooks/useAuth';

// Auth
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Rider
import RiderLayout from '../layouts/RiderLayout';
import RiderDashboard from '../pages/rider/RiderDashboard';
import BookRide from '../pages/rider/BookRide';
import RideTracking from '../pages/rider/RideTracking';
import RideHistory from '../pages/rider/RideHistory';
import Profile from '../pages/rider/Profile';
import SavedLocations from '../pages/rider/SavedLocations';
import SearchPage from '../pages/rider/SearchPage';

// Driver
import DriverLayout from '../layouts/DriverLayout';
import DriverDashboard from '../pages/driver/DriverDashboard';
import DriverRides from '../pages/driver/DriverRides';
import DriverEarnings from '../pages/driver/DriverEarnings';
import DriverProfile from '../pages/driver/DriverProfile';
import CompleteDriverProfile from '../pages/driver/CompleteDriverProfile';

// 404
import NotFound from '../pages/NotFound';

import Payment from '../pages/rider/Payment';
import PaymentSuccess from '../pages/rider/PaymentSuccess';
import PaymentHistory from '../pages/rider/PaymentHistory';

import ReviewDriver from '../pages/rider/ReviewDriver';
import MyReviews from '../pages/rider/MyReviews';

const RoleRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user?.role}`} replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />

        {/* Auth */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Driver complete profile (no layout, standalone) */}
        <Route
          path="/driver/complete-profile"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <CompleteDriverProfile />
            </ProtectedRoute>
          }
        />

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
          <Route path="book" element={<BookRide />} />
          <Route path="tracking/:rideId" element={<RideTracking />} />
          <Route path="history" element={<RideHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="locations" element={<SavedLocations />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="payment/:rideId" element={<Payment />} />
          <Route path="payment-success/:rideId" element={<PaymentSuccess />} />
          <Route path="payments" element={<PaymentHistory />} />
          <Route path="review/:rideId" element={<ReviewDriver />} />
          <Route path="reviews" element={<MyReviews />} />
        </Route>

        {/* Driver routes */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DriverDashboard />} />
          <Route path="rides" element={<DriverRides />} />
          <Route path="earnings" element={<DriverEarnings />} />
          <Route path="profile" element={<DriverProfile />} />
        </Route>

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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;