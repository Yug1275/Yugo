const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRideAnalytics,
  getRevenueAnalytics,
  getAllUsers,
  updateUserStatus,
  getAllDrivers,
  approveDriver,
  suspendDriver,
  unsuspendDriver,
  getAllRides,
  getAllPayments,
  exportRides,
  exportPayments,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/stats',               getDashboardStats);
router.get('/analytics/rides',     getRideAnalytics);
router.get('/analytics/revenue',   getRevenueAnalytics);

router.get('/users',               getAllUsers);
router.put('/users/:id/status',    updateUserStatus);

router.get('/drivers',             getAllDrivers);
router.put('/drivers/:id/approve', approveDriver);
router.put('/drivers/:id/suspend', suspendDriver);
router.put('/drivers/:id/unsuspend', unsuspendDriver);

router.get('/rides',               getAllRides);
router.get('/payments',            getAllPayments);

router.get('/export/rides',        exportRides);
router.get('/export/payments',     exportPayments);

module.exports = router;
