import { useState } from 'react';

const StarRating = ({
  value = 0,
  onChange,
  size = 'md',
  readonly = false,
  showLabel = true,
}) => {
  const [hovered, setHovered] = useState(0);

  const sizes = {
    sm: { star: '1.3rem', gap: 2 },
    md: { star: '2rem', gap: 4 },
    lg: { star: '2.6rem', gap: 6 },
  };

  const s = sizes[size] || sizes.md;

  const labels = {
    1: 'Terrible',
    2: 'Poor',
    3: 'Average',
    4: 'Good',
    5: 'Excellent ✨',
  };

  const displayValue = hovered || value;
  const isFiveStars = !readonly && (hovered === 5 || value === 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: s.gap, alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange && onChange(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`star-btn ${displayValue >= star ? 'selected' : ''} ${isFiveStars && displayValue >= star ? 'star-sparkle' : ''}`}
            style={{
              fontSize: s.star,
              cursor: readonly ? 'default' : 'pointer',
              filter: displayValue >= star
                ? 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.6))'
                : 'grayscale(100%) opacity(0.3)',
              transform: !readonly && hovered >= star ? 'scale(1.25)' : 'scale(1)',
              transition: 'transform 0.15s ease, filter 0.15s ease',
            }}
            title={readonly ? '' : labels[star]}
          >
            ⭐
          </button>
        ))}

        {/* Numeric value */}
        {readonly && value > 0 && (
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginLeft: 4,
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {value.toFixed(1)}
          </span>
        )}
      </div>

      {/* Label */}
      {showLabel && !readonly && displayValue > 0 && (
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
          }}
        >
          {labels[displayValue]}
        </p>
      )}
    </div>
  );
};

export default StarRating;