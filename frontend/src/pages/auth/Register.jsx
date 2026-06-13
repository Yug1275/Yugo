import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';

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
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password' && !passwordTouched) setPasswordTouched(true);
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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) newErrors.password = 'Minimum 8 characters required';
      else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Must contain at least one uppercase letter';
      else if (!/[a-z]/.test(formData.password)) newErrors.password = 'Must contain at least one lowercase letter';
      else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Must contain at least one number';
      else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) newErrors.password = 'Must contain at least one special character';
    }

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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--color-bg)',
      backgroundImage: 'radial-gradient(var(--color-border) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      position: 'relative',
      padding: '40px 24px'
    }}>
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/')} 
        style={{ 
          position: 'absolute', 
          top: '24px', 
          left: '24px', 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          padding: '8px 16px', 
          borderRadius: '99px', 
          cursor: 'pointer', 
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        ← Home
      </button>

      <div style={{ 
        width: '100%', 
        maxWidth: '440px', 
        background: 'var(--color-surface)', 
        borderRadius: '20px', 
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)', 
        padding: '40px',
        animation: 'fadeIn 0.4s ease' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px', marginBottom: '16px' }}>
            YUGO
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', letterSpacing: '-0.5px', color: 'var(--color-text-primary)' }}>Create your account</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Join YUGO in just a few steps</p>
        </div>

        {serverError && (
          <div style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', fontSize: '0.875rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ {serverError}
          </div>
        )}

        {/* Premium Segmented Control for Role */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>I want to</label>
          <div style={{ 
            display: 'flex', 
            background: 'var(--color-surface-2)', 
            padding: '4px', 
            borderRadius: '12px', 
            position: 'relative'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '4px', 
              bottom: '4px', 
              width: 'calc(50% - 4px)', 
              background: 'var(--color-surface)', 
              borderRadius: '8px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: formData.role === 'rider' ? 'translateX(0)' : 'translateX(100%)',
              zIndex: 1
            }} />
            
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'rider' }))}
              style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', cursor: 'pointer', zIndex: 2, fontSize: '0.95rem', fontWeight: formData.role === 'rider' ? 700 : 500, color: formData.role === 'rider' ? 'var(--color-primary)' : 'var(--color-text-secondary)', transition: 'color 0.3s' }}
            >
              🧑 Ride
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'driver' }))}
              style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', cursor: 'pointer', zIndex: 2, fontSize: '0.95rem', fontWeight: formData.role === 'driver' ? 700 : 500, color: formData.role === 'driver' ? 'var(--color-primary)' : 'var(--color-text-secondary)', transition: 'color 0.3s' }}
            >
              🚗 Drive
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '16px' }}>
            <Input label="Full name" name="name" type="text" placeholder="Yug Mehta" value={formData.name} onChange={handleChange} error={errors.name} required />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Input label="Email address" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} error={errors.email} required />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <Input label="Phone number (optional)" name="phone" type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} error={errors.phone} />
          </div>

          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '34px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </button>
            <div style={{
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              opacity: passwordTouched ? 1 : 0,
              maxHeight: passwordTouched ? '300px' : '0px'
            }}>
              <PasswordStrengthIndicator password={formData.password} />
            </div>
          </div>

          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <Input
              label="Confirm password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: 'absolute', right: '12px', top: '34px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}
              title={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
            </button>
            
            {/* Match Indicator */}
            {formData.confirmPassword && formData.password && (
               <div style={{ marginTop: '8px', fontSize: '0.8rem', color: formData.password === formData.confirmPassword ? 'var(--color-success)' : 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 {formData.password === formData.confirmPassword ? '✓ Passwords match' : '× Passwords do not match'}
               </div>
            )}
          </div>

          <Button type="submit" variant="primary" fullWidth loading={loading} style={{ padding: '14px', fontSize: '1rem', borderRadius: '12px' }}>
            Create Account →
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>or continue with</div>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        </div>

        <button 
          type="button" 
          onClick={() => { /* Google OAuth trigger placeholder */ }}
          style={{ width: '100%', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: 500, color: '#0f172a', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;