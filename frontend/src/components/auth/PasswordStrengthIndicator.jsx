import { useState, useEffect } from 'react';

const PasswordStrengthIndicator = ({ password }) => {
  const [strength, setStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    score: 0,
  });

  useEffect(() => {
    const p = password || '';
    const length = p.length >= 8;
    const uppercase = /[A-Z]/.test(p);
    const lowercase = /[a-z]/.test(p);
    const number = /[0-9]/.test(p);
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(p);

    let score = 0;
    if (length) score += 1;
    if (uppercase || lowercase) score += 1;
    if (number) score += 1;
    if (special) score += 1;
    
    // Scale up to 4 points max if all 5 are met
    let finalScore = 0;
    const checksMet = [length, uppercase, lowercase, number, special].filter(Boolean).length;
    
    if (checksMet === 0) finalScore = 0;
    else if (checksMet <= 2) finalScore = 1; // Weak
    else if (checksMet === 3) finalScore = 2; // Fair
    else if (checksMet === 4) finalScore = 3; // Good
    else if (checksMet === 5) finalScore = 4; // Strong

    setStrength({ length, uppercase, lowercase, number, special, score: finalScore });
  }, [password]);

  const getStrengthColor = (level) => {
    if (strength.score < level) return 'var(--color-border)';
    if (strength.score === 1) return '#ef4444'; // Red
    if (strength.score === 2) return '#f97316'; // Orange
    if (strength.score === 3) return '#eab308'; // Yellow
    if (strength.score === 4) return '#22c55e'; // Green
    return 'var(--color-border)';
  };

  const getStrengthLabel = () => {
    if (strength.score === 0) return '';
    if (strength.score === 1) return 'Weak';
    if (strength.score === 2) return 'Fair';
    if (strength.score === 3) return 'Good';
    if (strength.score === 4) return 'Strong';
    return '';
  };

  const activeColor = strength.score > 0 ? getStrengthColor(strength.score) : 'var(--color-text-secondary)';

  return (
    <div style={{ marginTop: '12px', fontSize: '0.85rem' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            style={{
              height: '4px',
              flex: 1,
              borderRadius: '2px',
              backgroundColor: getStrengthColor(level),
              transition: 'background-color 0.3s ease'
            }}
          />
        ))}
      </div>
      
      {strength.score > 0 && (
        <div style={{ textAlign: 'right', marginBottom: '12px', fontWeight: 700, color: activeColor, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {getStrengthLabel()}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
        <div style={{ color: strength.length ? 'var(--color-success)' : 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {strength.length ? '✓' : '×'} At least 8 characters
        </div>
        <div style={{ color: strength.uppercase ? 'var(--color-success)' : 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {strength.uppercase ? '✓' : '×'} Contains uppercase letter (A-Z)
        </div>
        <div style={{ color: strength.lowercase ? 'var(--color-success)' : 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {strength.lowercase ? '✓' : '×'} Contains lowercase letter (a-z)
        </div>
        <div style={{ color: strength.number ? 'var(--color-success)' : 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {strength.number ? '✓' : '×'} Contains a number (0-9)
        </div>
        <div style={{ color: strength.special ? 'var(--color-success)' : 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {strength.special ? '✓' : '×'} Contains a special character (!@#$%^&*)
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
