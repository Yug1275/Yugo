import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <div style={{ fontSize: '5rem', marginBottom: 16 }}>🚗</div>
      <h1 style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: 8 }}>404</h1>
      <h2 style={{ marginBottom: 12 }}>Page Not Found</h2>
      <p style={{ marginBottom: 28, maxWidth: 400 }}>
        Looks like this route took a wrong turn. Let's get you back on track.
      </p>
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;