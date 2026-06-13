const User = require('../models/User');
const Driver = require('../models/Driver');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { AppError } = require('../middleware/errorHandler');
const { isValidEmail, isValidPassword } = require('../utils/validators');
const crypto = require('crypto');
const { sendSuccess } = require('../utils/responseHelper');
const sendEmail = require('../utils/sendEmail');

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
    return next(new AppError('Password must meet strength requirements (min 8 chars, uppercase, lowercase, number, special char)', 400));
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
  // TEMP FIX — auto approve for development:
if (userRole === 'driver') {
  await Driver.create({
    userId: user._id,
    isApproved: true,   // ← add this
  });
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
    return next(new AppError('New password must meet strength requirements', 400));
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

// ─── @desc    Forgot password
// ─── @route   POST /api/auth/forgot-password
// ─── @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() });

  if (!user) {
    // Return success to prevent email enumeration attacks
    return sendSuccess(res, 200, {}, 'If an account with that email exists, we have sent a password reset link.');
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
      <p style="margin-top: 20px; font-size: 0.9em; color: #666;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
      html,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (error) {
    console.error(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email could not be sent', 500));
  }
});

// ─── @desc    Reset password
// ─── @route   PUT /api/auth/reset-password/:token
// ─── @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid token or token has expired', 400));
  }

  // Validate new password
  if (!isValidPassword(req.body.password)) {
    return next(new AppError('Password must meet strength requirements', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(user._id, user.role);

  return sendSuccess(res, 200, {
    token,
    user: user.toSafeObject(),
  }, 'Password reset successful');
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
};