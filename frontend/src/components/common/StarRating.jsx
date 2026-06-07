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
    sm: { star: '1.2rem', gap: 2 },
    md: { star: '1.8rem', gap: 4 },
    lg: { star: '2.4rem', gap: 6 },
  };

  const s = sizes[size] || sizes.md;

  const labels = {
    1: 'Terrible',
    2: 'Poor',
    3: 'Average',
    4: 'Good',
    5: 'Excellent',
  };

  const displayValue = hovered || value;

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
            style={{
              background: 'none',
              border: 'none',
              cursor: readonly ? 'default' : 'pointer',
              padding: 2,
              fontSize: s.star,
              lineHeight: 1,
              transition: 'transform 0.1s ease',
              transform: !readonly && hovered >= star ? 'scale(1.2)' : 'scale(1)',
              filter: displayValue >= star ? 'none' : 'grayscale(100%) opacity(0.3)',
            }}
            title={readonly ? '' : labels[star]}
          >
            ⭐
          </button>
        ))}

        {/* Numeric value */}
        {readonly && value > 0 && (
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)', marginLeft: 4 }}>
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