import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'rider',
    phone: '',
  });
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
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.trim().length < 2)
      newErrors.name = 'Name must be at least 2 characters';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const { confirmPassword, ...payload } = formData;
    const result = await register(payload);

    if (result.success) {
      navigate(`/${result.user.role}`, { replace: true });
    } else {
      setServerError(result.error);
    }
  };

  return (
    <AuthLayout>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div className="card">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ marginBottom: 6 }}>Create an account</h2>
            <p style={{ fontSize: '0.9rem' }}>Join YUGO — it only takes a minute</p>
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

          {/* Role selector */}
          <div className="form-group">
            <label className="input-label">I want to</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {['rider', 'driver'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: r }))}
                  style={{
                    padding: '12px',
                    borderRadius: 8,
                    border: `2px solid ${
                      formData.role === r
                        ? 'var(--color-primary)'
                        : 'var(--color-border)'
                    }`,
                    background:
                      formData.role === r
                        ? 'var(--color-primary-light)'
                        : 'var(--color-surface)',
                    color:
                      formData.role === r
                        ? 'var(--color-primary)'
                        : 'var(--color-text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {r === 'rider' ? '🧑 Book Rides' : '🚗 Drive & Earn'}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Full name"
              name="name"
              type="text"
              placeholder="Yug Mehta"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

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
              label="Phone number"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210 (optional)"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;