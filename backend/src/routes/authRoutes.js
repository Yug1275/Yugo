const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// ─── Public routes ────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);

// ─── Private routes (require valid JWT) ──────────────────────────────────
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;