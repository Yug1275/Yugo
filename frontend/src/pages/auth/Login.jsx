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
      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeIn 0.4s ease' }}>
        {/* Form card */}
        <div
          className="card"
          style={{
            borderRadius: 20,
            padding: 32,
            boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                margin: '0 auto 16px',
                boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
              }}
            >
              🚀
            </div>
            <h2 style={{ marginBottom: 6, letterSpacing: '-0.75px' }}>Welcome back</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Sign in to your YUGO account
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div
              style={{
                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: '0.875rem',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              ⚠️ {serverError}
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
                style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}
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
              Sign In →
            </Button>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;