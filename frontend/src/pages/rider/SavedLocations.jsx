import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { addSavedLocationApi, removeSavedLocationApi } from '../../api/userApi';
import { MapPin, Home, Briefcase, Dumbbell, GraduationCap, Trash2 } from '../../components/common/Icons';

const LABEL_OPTIONS = ['Home', 'Work', 'Gym', 'College', 'Other'];

const SavedLocations = () => {
  const { user, updateUser } = useAuth();
  const locations = user?.savedLocations || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ label: 'Home', address: '', lat: '', lng: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.label.trim()) errs.label = 'Label is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.lat || isNaN(form.lat)) errs.lat = 'Valid latitude required';
    if (!form.lng || isNaN(form.lng)) errs.lng = 'Valid longitude required';
    return errs;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await addSavedLocationApi({
        label: form.label,
        address: form.address,
        coordinates: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) },
      });
      updateUser({ savedLocations: res.data.data.savedLocations });
      setIsModalOpen(false);
      setForm({ label: 'Home', address: '', lat: '', lng: '' });
    } catch (err) {
      setErrors({ address: err.response?.data?.error || 'Failed to add location' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index) => {
    setDeleteLoading(index);
    try {
      const res = await removeSavedLocationApi(index);
      updateUser({ savedLocations: res.data.data.savedLocations });
    } catch {
      // handle silently
    } finally {
      setDeleteLoading(null);
    }
  };

  const locationIcons = {
    Home: <Home size={18} style={{ color: 'var(--color-primary)' }} />,
    Work: <Briefcase size={18} style={{ color: 'var(--color-primary)' }} />,
    Gym: <Dumbbell size={18} style={{ color: 'var(--color-primary)' }} />,
    College: <GraduationCap size={18} style={{ color: 'var(--color-primary)' }} />,
    Other: <MapPin size={18} style={{ color: 'var(--color-primary)' }} />,
  };

  return (
    <div>
      {/* Header */}
      <div
        className="page-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <h2 className="page-title">Saved Locations</h2>
          <p className="page-subtitle">Quick access to your favourite places</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Add Location
        </Button>
      </div>

      {/* Locations grid */}
      {locations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-text-muted)', marginBottom: 12 }}>
            <MapPin size={36} strokeWidth={1.5} />
          </div>
          <p className="empty-state-text">No saved locations yet.</p>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className=""
            style={{ marginTop: 16 }}
          >
            Add Your First Location
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {locations.map((loc, index) => (
            <div
              key={index}
              className="card"
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'var(--color-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    flexShrink: 0,
                  }}
                >
                  {locationIcons[loc.label] || <MapPin size={18} style={{ color: 'var(--color-primary)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {loc.label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      color: 'var(--color-text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {loc.address}
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} style={{ color: 'var(--color-text-muted)' }} />
                <span>{loc.coordinates?.lat?.toFixed(4)}, {loc.coordinates?.lng?.toFixed(4)}</span>
              </div>

              <button
                onClick={() => handleDelete(index)}
                disabled={deleteLoading === index}
                style={{
                  alignSelf: 'flex-end',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-danger)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 6,
                  opacity: deleteLoading === index ? 0.5 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {deleteLoading === index ? 'Removing...' : (
                  <>
                    <Trash2 size={12} /> Remove
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Location Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setErrors({}); }}
        title="Add Saved Location"
      >
        <form onSubmit={handleAdd} noValidate>
          {/* Label selector */}
          <div className="form-group">
            <label className="input-label">Label <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LABEL_OPTIONS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, label: l }))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: `1.5px solid ${form.label === l ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: form.label === l ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: form.label === l ? '#fff' : 'var(--color-text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', color: form.label === l ? '#fff' : 'var(--color-primary)' }}>
                    {locationIcons[l]}
                  </span>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Full address"
            name="address"
            placeholder="123 MG Road, Ahmedabad"
            value={form.address}
            onChange={handleChange}
            error={errors.address}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Latitude"
              name="lat"
              type="number"
              placeholder="23.0225"
              value={form.lat}
              onChange={handleChange}
              error={errors.lat}
              required
            />
            <Input
              label="Longitude"
              name="lng"
              type="number"
              placeholder="72.5714"
              value={form.lng}
              onChange={handleChange}
              error={errors.lng}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => { setIsModalOpen(false); setErrors({}); }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Save Location
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SavedLocations;