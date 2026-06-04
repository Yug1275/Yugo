import { Link } from 'react-router-dom';

const Logo = ({ size = 'md', linkTo = '/', showTagline = false }) => {
  const sizes = {
    sm: { icon: 28, text: '1.1rem', gap: 8 },
    md: { icon: 36, text: '1.4rem', gap: 10 },
    lg: { icon: 48, text: '1.9rem', gap: 12 },
  };

  const s = sizes[size] || sizes.md;

  return (
    <Link
      to={linkTo}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        textDecoration: 'none',
      }}
    >

      {/* Wordmark */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            fontSize: s.text,
            fontWeight: 800,
            color: 'var(--color-primary)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.5px',
          }}
        >
          YUGO
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--color-text-muted)',
              fontWeight: 500,
              letterSpacing: '0.3px',
              marginTop: 2,
            }}
          >
            Move smarter. Arrive better.
          </span>
        )}
      </div>
    </Link>
  );
};

export default Logo;