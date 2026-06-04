import { Navigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';

const AuthLayout = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
        }}
      >
        <Logo size="sm" showTagline={false} />
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            width: 38,
            height: 38,
            cursor: 'pointer',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Centered form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;