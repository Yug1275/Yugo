import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title = '', children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidths = { sm: 400, md: 560, lg: 760 };

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: maxWidths[size] || 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: '0 16px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          {title && <h3 style={{ margin: 0 }}>{title}</h3>}
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              marginLeft: 'auto',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;