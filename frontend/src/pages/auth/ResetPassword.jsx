import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuth();

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    const { password, confirmPassword } = formData;
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      if (password.length < 8) newErrors.password = 'Minimum 8 characters required';
      else if (!/[A-Z]/.test(password)) newErrors.password = 'Must contain at least one uppercase letter';
      else if (!/[a-z]/.test(password)) newErrors.password = 'Must contain at least one lowercase letter';
      else if (!/\d/.test(password)) newErrors.password = 'Must contain at least one number';
      else if (!/[@$!%*?&]/.test(password)) newErrors.password = 'Must contain at least one special character';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await resetPassword(token, formData.password);

    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setServerError(result.error);
    }
  };

  return (
    <AuthLayout>
      <div style={{ width: '100%', maxWidth: 440, animation: 'fadeIn 0.4s ease' }}>
        <div className="card" style={{ borderRadius: 20, padding: 32, boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
          {successMsg ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
              <h3 style={{ marginBottom: 10 }}>Password Reset!</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: 24, color: 'var(--color-text-secondary)' }}>
                {successMsg}. Redirecting to login...
              </p>
              <Link to="/login" className="btn btn-primary btn-full">
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}>
                  🔑
                </div>
                <h2 style={{ marginBottom: 6, letterSpacing: '-0.75px' }}>Reset Password</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  Enter your new secure password
                </p>
              </div>

              {serverError && (
                <div style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.875rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⚠️ {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 16 }}>
                  <Input
                    label="New Password"
                    name="password"
                    type="password"
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                  />
                  <PasswordStrengthIndicator password={formData.password} />
                </div>

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                />

                <Button type="submit" variant="primary" fullWidth loading={loading} style={{ marginTop: 12 }}>
                  Reset Password →
                </Button>
              </form>

              <hr className="divider" />
              <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  ← Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
