import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NotFound from '../pages/NotFound';

// Auth pages (Phase 6)
// import Login from '../pages/auth/Login';
// import Register from '../pages/auth/Register';

// Rider pages (Phase 7)
// import RiderDashboard from '../pages/rider/RiderDashboard';

// Driver pages (Phase 10)
// import DriverDashboard from '../pages/driver/DriverDashboard';

// Admin pages (Phase 15)
// import AdminDashboard from '../pages/admin/AdminDashboard';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes — uncommented in Phase 6 */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}

        {/* Dashboard routes — uncommented per phase */}
        {/* <Route path="/rider/*" element={<RiderDashboard />} /> */}
        {/* <Route path="/driver/*" element={<DriverDashboard />} /> */}
        {/* <Route path="/admin/*" element={<AdminDashboard />} /> */}

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;