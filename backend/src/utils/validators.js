const { AppError } = require('../middleware/errorHandler');

const validateFields = (fields) => (req, res, next) => {
  const missing = fields.filter(
    (field) => req.body[field] === undefined || req.body[field] === ''
  );
  if (missing.length > 0) {
    return next(new AppError(`Missing required fields: ${missing.join(', ')}`, 400));
  }
  next();
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password) => {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
};

module.exports = { validateFields, isValidEmail, isValidPassword };