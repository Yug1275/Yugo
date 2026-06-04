const Loader = ({ size = 'md', fullPage = false, text = '' }) => {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <span className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />
      {text && (
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{text}</p>
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
        {spinner}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      {spinner}
    </div>
  );
};

export default Loader;