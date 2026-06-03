const User = require('../models/User');
const Driver = require('../models/Driver');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { AppError } = require('../middleware/errorHandler');
const { isValidEmail, isValidPassword } = require('../utils/validators');
const { sendSuccess } = require('../utils/responseHelper');

// ─── @desc    Register a new user (rider or driver)
// ─── @route   POST /api/auth/register
// ─── @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return next(new AppError('Name, email and password are required', 400));
  }

  if (!isValidEmail(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  if (!isValidPassword(password)) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  const allowedRoles = ['rider', 'driver'];
  const userRole = role && allowedRoles.includes(role) ? role : 'rider';

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('An account with this email already exists', 409));
  }

  // Create user (password hashed by pre-save hook in User model)
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: userRole,
    phone: phone || null,
  });

  // If registering as driver, create a Driver profile as well
  if (userRole === 'driver') {
    await Driver.create({ userId: user._id });
  }

  const token = generateToken(user._id, user.role);

  return sendSuccess(res, 201, {
    token,
    user: user.toSafeObject(),
  }, 'Account created successfully');
});

// ─── @desc    Login user
// ─── @route   POST /api/auth/login
// ─── @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  // Select password explicitly (it's select:false in schema)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Contact support.', 403));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = generateToken(user._id, user.role);

  return sendSuccess(res, 200, {
    token,
    user: user.toSafeObject(),
  }, 'Login successful');
});

// ─── @desc    Get current logged-in user profile
// ─── @route   GET /api/auth/profile
// ─── @access  Private
const getProfile = asyncHandler(async (req, res, next) => {
  // req.user is already attached by protect middleware
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // If user is a driver, also return driver profile
  let driverProfile = null;
  if (user.role === 'driver') {
    driverProfile = await Driver.findOne({ userId: user._id });
  }

  return sendSuccess(res, 200, {
    user: user.toSafeObject(),
    ...(driverProfile && { driverProfile }),
  });
});

// ─── @desc    Update current user profile
// ─── @route   PUT /api/auth/profile
// ─── @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, profileImage } = req.body;

  // Only allow these fields to be updated here
  const updateData = {};
  if (name) updateData.name = name.trim();
  if (phone !== undefined) updateData.phone = phone;
  if (profileImage !== undefined) updateData.profileImage = profileImage;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  return sendSuccess(res, 200, { user: user.toSafeObject() }, 'Profile updated successfully');
});

// ─── @desc    Change password
// ─── @route   PUT /api/auth/change-password
// ─── @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Current password and new password are required', 400));
  }

  if (!isValidPassword(newPassword)) {
    return next(new AppError('New password must be at least 6 characters', 400));
  }

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword; // pre-save hook will hash it
  await user.save();

  return sendSuccess(res, 200, {}, 'Password changed successfully');
});

// ─── @desc    Logout (client-side token removal — stateless JWT)
// ─── @route   POST /api/auth/logout
// ─── @access  Private
const logout = asyncHandler(async (req, res, next) => {
  res.clearCookie('token');
  return sendSuccess(res, 200, {}, 'Logged out successfully');
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
};