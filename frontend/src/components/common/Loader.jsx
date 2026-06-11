import Logo from './Logo';

const Loader = ({ size = 'md', fullPage = false, text = '' }) => {
  const dots = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      {fullPage && (
        <div
          style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-1px',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 4,
            animation: 'fadeIn 0.4s ease',
          }}
        >
          YUGO
        </div>
      )}
      <div className="dot-loader">
        <span />
        <span />
        <span />
      </div>
      {text && (
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
          zIndex: 9999,
        }}
      >
        {dots}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      {dots}
    </div>
  );
};

export default Loader;