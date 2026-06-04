import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const from = location.state?.from?.pathname || null;

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const role = result.user.role;
      const destination = from && from !== '/login' ? from : `/${role}`;
      navigate(destination, { replace: true });
    } else {
      setServerError(result.error);
    }
  };

  return (
    <AuthLayout>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="card">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ marginBottom: 6 }}>Welcome back</h2>
            <p style={{ fontSize: '0.9rem' }}>Sign in to your YUGO account</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: '0.875rem',
                color: '#991b1b',
              }}
            >
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            {/* Forgot password link */}
            <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 20 }}>
              <Link
                to="/forgot-password"
                style={{ fontSize: '0.82rem', color: 'var(--color-primary)' }}
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;