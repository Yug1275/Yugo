import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'Enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthLayout>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="card">
          {!submitted ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔒</div>
                <h2 style={{ marginBottom: 6 }}>Forgot password?</h2>
                <p style={{ fontSize: '0.9rem' }}>
                  Enter your registered email address and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  error={error}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                >
                  Send Reset Link
                </Button>
              </form>

              <hr className="divider" />

              <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  ← Back to login
                </Link>
              </p>
            </>
          ) : (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📧</div>
              <h3 style={{ marginBottom: 10 }}>Check your inbox</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: 24 }}>
                If an account exists for <strong>{email}</strong>, a password reset
                link has been sent. Check your spam folder too.
              </p>
              <Link to="/login" className="btn btn-primary btn-full">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;