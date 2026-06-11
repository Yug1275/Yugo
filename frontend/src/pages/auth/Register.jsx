import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';

const ROLE_OPTIONS = [
  {
    role: 'rider',
    emoji: '🧑',
    label: 'Book Rides',
    desc: 'I want to travel',
  },
  {
    role: 'driver',
    emoji: '🚗',
    label: 'Drive & Earn',
    desc: 'I want to drive',
  },
];

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
      <div style={{ width: '100%', maxWidth: 480, animation: 'fadeIn 0.4s ease' }}>
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
              ✨
            </div>
            <h2 style={{ marginBottom: 6, letterSpacing: '-0.75px' }}>Create an account</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Join YUGO — it only takes a minute
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

          {/* Role selector — premium toggle cards */}
          <div className="form-group">
            <label className="input-label">I want to</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {ROLE_OPTIONS.map((opt) => {
                const isSelected = formData.role === opt.role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: opt.role }))}
                    style={{
                      padding: '14px 12px',
                      borderRadius: 12,
                      border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: isSelected
                        ? 'var(--gradient-primary)'
                        : 'var(--color-surface)',
                      color: isSelected ? '#fff' : 'var(--color-text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'translateY(-1px)' : 'translateY(0)',
                      boxShadow: isSelected
                        ? '0 4px 14px rgba(37,99,235,0.3)'
                        : 'none',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{opt.emoji}</div>
                    <div>{opt.label}</div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        opacity: isSelected ? 0.8 : 0.6,
                        marginTop: 2,
                        fontWeight: 500,
                      }}
                    >
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
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
              Create Account →
            </Button>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;