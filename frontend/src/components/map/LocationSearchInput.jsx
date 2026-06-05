import { useState, useRef, useEffect } from 'react';
import { searchLocations } from '../../utils/mapHelpers';

const LocationSearchInput = ({
  label,
  placeholder,
  value,
  onPlaceSelected,
  onClear,
  required = false,
  icon = '📍',
}) => {
  const [query, setQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync external value
  useEffect(() => {
    if (value?.address) setQuery(value.address);
    else if (!value) setQuery('');
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchLocations(val);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSearching(false);
    }, 500);
  };

  const handleSelect = (place) => {
    setQuery(place.address);
    setSuggestions([]);
    setShowSuggestions(false);
    onPlaceSelected(place);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onClear();
  };

  return (
    <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
      {label && (
        <label className="input-label">
          {label}
          {required && (
            <span style={{ color: 'var(--color-danger)', marginLeft: 3 }}>*</span>
          )}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1rem',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {searching ? (
            <span
              className="spinner"
              style={{ width: 14, height: 14, borderWidth: 2, display: 'inline-block' }}
            />
          ) : (
            icon
          )}
        </span>

        <input
          className="input"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          style={{ paddingLeft: 38, paddingRight: value ? 36 : 14 }}
          autoComplete="off"
        />

        {/* Clear button */}
        {(query || value) && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              fontSize: '1.1rem',
              lineHeight: 1,
              padding: 2,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 8,
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            listStyle: 'none',
            padding: '4px 0',
            margin: 0,
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {suggestions.map((place, i) => (
            <li
              key={i}
              onClick={() => handleSelect(place)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: 'var(--color-text-primary)',
                borderBottom:
                  i < suggestions.length - 1
                    ? '1px solid var(--color-border)'
                    : 'none',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'var(--color-surface-2)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              <span style={{ flexShrink: 0, marginTop: 1 }}>📍</span>
              <span style={{ lineHeight: 1.4 }}>{place.address}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearchInput;