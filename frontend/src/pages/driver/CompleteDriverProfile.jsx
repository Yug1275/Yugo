import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { completeDriverProfileApi } from '../../api/driverApi';
import { Car } from '../../components/common/Icons';

const VEHICLE_TYPES = ['sedan', 'suv', 'hatchback', 'auto'];

const CompleteDriverProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    licenseNumber: '',
    vehicleType: 'sedan',
    vehicleNumber: '',
    vehicleModel: '',
    vehicleColor: '',
    vehicleYear: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.licenseNumber.trim()) errs.licenseNumber = 'License number is required';
    if (!form.vehicleNumber.trim()) errs.vehicleNumber = 'Vehicle number is required';
    if (!form.vehicleModel.trim()) errs.vehicleModel = 'Vehicle model is required';
    if (form.vehicleYear && (isNaN(form.vehicleYear) || form.vehicleYear < 2000)) {
      errs.vehicleYear = 'Enter a valid year (2000 or later)';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await completeDriverProfileApi({
        ...form,
        vehicleYear: form.vehicleYear ? parseInt(form.vehicleYear) : null,
      });
      navigate('/driver', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to save profile. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div className="card">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: 12 }}>
              <Car size={40} strokeWidth={1.5} />
            </div>
            <h2 style={{ marginBottom: 6 }}>Complete Your Driver Profile</h2>
            <p style={{ fontSize: '0.9rem' }}>
              Add your license and vehicle details to start accepting rides.
            </p>
          </div>

          {serverError && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: '0.875rem',
                color: '#991b1b',
              }}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <h4 style={{ marginBottom: 14, color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              License Details
            </h4>

            <Input
              label="Driving License Number"
              name="licenseNumber"
              placeholder="e.g. GJ01-20201234567"
              value={form.licenseNumber}
              onChange={handleChange}
              error={errors.licenseNumber}
              required
            />

            <h4 style={{ marginBottom: 14, marginTop: 8, color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Vehicle Details
            </h4>

            {/* Vehicle type selector */}
            <div className="form-group">
              <label className="input-label">
                Vehicle Type <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {VEHICLE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, vehicleType: type }))}
                    style={{
                      padding: '12px 6px',
                      borderRadius: 8,
                      border: `2px solid ${form.vehicleType === type ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: form.vehicleType === type ? 'var(--color-primary-light)' : 'var(--color-surface)',
                      color: form.vehicleType === type ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Vehicle Number"
              name="vehicleNumber"
              placeholder="e.g. GJ-01-AB-1234"
              value={form.vehicleNumber}
              onChange={handleChange}
              error={errors.vehicleNumber}
              required
            />

            <Input
              label="Vehicle Model"
              name="vehicleModel"
              placeholder="e.g. Maruti Swift"
              value={form.vehicleModel}
              onChange={handleChange}
              error={errors.vehicleModel}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Color (optional)"
                name="vehicleColor"
                placeholder="e.g. White"
                value={form.vehicleColor}
                onChange={handleChange}
              />
              <Input
                label="Year (optional)"
                name="vehicleYear"
                type="number"
                placeholder="e.g. 2020"
                value={form.vehicleYear}
                onChange={handleChange}
                error={errors.vehicleYear}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Save & Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteDriverProfile;