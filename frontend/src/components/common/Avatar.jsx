import { getInitials } from '../../utils/helpers';

const Avatar = ({ user, name, src, size = 40, role, online = false, borderColor, style, isClickable = false }) => {
  const avatarSrc = src || user?.profileImage;
  const displayName = name || user?.name || '';
  const displayRole = role || user?.role || 'rider';

  const initials = getInitials(displayName) || '?';

  // Determine background color/gradient based on role
  let bgGradient = 'var(--gradient-primary)'; // default for rider (blue gradient)
  if (displayRole === 'driver') {
    bgGradient = 'var(--gradient-dark)'; // slate/dark gradient
  } else if (displayRole === 'admin') {
    bgGradient = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'; // very dark slate
  }

  // Calculate font size relative to avatar size
  const fontSize = `${size * 0.38}px`;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        transition: 'all 0.2s ease',
        cursor: isClickable ? 'pointer' : 'default',
        ...style,
      }}
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={displayName}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            border: borderColor ? `2px solid ${borderColor}` : '1.5px solid var(--color-border)',
            display: 'block',
          }}
          onError={(e) => {
            // Fallback gracefully to initials if image fails to load
            e.target.style.display = 'none';
            const fallbackEl = e.target.nextSibling;
            if (fallbackEl) {
              fallbackEl.style.display = 'flex';
            }
          }}
        />
      ) : null}

      <div
        className="avatar-fallback"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: bgGradient,
          display: avatarSrc ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: fontSize,
          border: borderColor ? `2px solid ${borderColor}` : 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}
      >
        {initials}
      </div>

      {/* Online status indicator */}
      {online && (
        <div
          style={{
            position: 'absolute',
            bottom: size > 40 ? 1 : 0,
            right: size > 40 ? 1 : 0,
            width: size * 0.22 > 10 ? 10 : Math.max(6, size * 0.22),
            height: size * 0.22 > 10 ? 10 : Math.max(6, size * 0.22),
            borderRadius: '50%',
            background: '#4ade80',
            border: '2px solid var(--color-surface)',
            boxShadow: '0 0 0 2px rgba(74,222,128,0.2)',
          }}
        />
      )}
    </div>
  );
};

export default Avatar;
