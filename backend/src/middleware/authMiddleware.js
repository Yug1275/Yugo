const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');
const asyncHandler = require('../utils/asyncHandler');

// ─── Protect: verify JWT, attach user to req ──────────────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Not authorized. No token provided.', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated.', 403));
  }

  req.user = user;
  next();
});

// ─── Role-based access control ────────────────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${roles.join(' or ')}`,
          403
        )
      );
    }
    next();
  };
};

// ─── Shorthand role middlewares ───────────────────────────────────────────
const adminOnly = authorize('admin');
const driverOnly = authorize('driver');
const riderOnly = authorize('rider');
const riderOrAdmin = authorize('rider', 'admin');
const driverOrAdmin = authorize('driver', 'admin');

module.exports = {
  protect,
  authorize,
  adminOnly,
  driverOnly,
  riderOnly,
  riderOrAdmin,
  driverOrAdmin,
};