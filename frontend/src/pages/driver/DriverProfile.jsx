import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDriverProfileApi, completeDriverProfileApi } from '../../api/driverApi';
import { setDriverProfile } from '../../store/driverSlice';
import { updateProfileApi, changePasswordApi } from '../../api/userApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import Avatar from '../../components/common/Avatar';
import { getInitials } from '../../utils/helpers';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna'
];

const VEHICLE_TYPES = ['sedan', 'suv', 'hatchback', 'auto'];

const DriverProfile = () => {
  const dispatch = useDispatch();
  const { user, updateUser } = useAuth();
  const { profile, vehicle } = useSelector((s) => s.driver);

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', profileImage: user?.profileImage || '' });
  const [vehicleForm, setVehicleForm] = useState({
    licenseNumber: '',
    vehicleType: 'sedan',
    vehicleNumber: '',
    vehicleModel: '',
    vehicleColor: '',
    vehicleYear: '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const [profileLoading, setProfileLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [vehicleSuccess, setVehicleSuccess] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [vehicleErr, setVehicleErr] = useState('');
  const [pwErr, setPwErr] = useState({});

  // Populate vehicle form when data loads
  useEffect(() => {
    if (profile && vehicle) {
      setVehicleForm({
        licenseNumber: profile.licenseNumber || '',
        vehicleType: vehicle.vehicleType || 'sedan',
        vehicleNumber: vehicle.vehicleNumber || '',
        vehicleModel: vehicle.vehicleModel || '',
        vehicleColor: vehicle.vehicleColor || '',
        vehicleYear: vehicle.vehicleYear ? String(vehicle.vehicleYear) : '',
      });
    }
  }, [profile, vehicle]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { setProfileErr('Name is required'); return; }
    setProfileLoading(true);
    try {
      const res = await updateProfileApi(profileForm);
      updateUser(res.data.data.user);
      setProfileSuccess('Profile updated!');
      setProfileErr('');
    } catch (err) {
      setProfileErr(err.response?.data?.error || 'Failed to update');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleForm.licenseNumber || !vehicleForm.vehicleNumber || !vehicleForm.vehicleModel) {
      setVehicleErr('License, vehicle number and model are required');
      return;
    }
    setVehicleLoading(true);
    try {
      const res = await completeDriverProfileApi({
        ...vehicleForm,
        vehicleYear: vehicleForm.vehicleYear ? parseInt(vehicleForm.vehicleYear) : null,
      });
      dispatch(setDriverProfile(res.data.data));
      setVehicleSuccess('Vehicle details updated!');
      setVehicleErr('');
    } catch (err) {
      setVehicleErr(err.response?.data?.error || 'Failed to update vehicle');
    } finally {
      setVehicleLoading(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Required';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) errs.newPassword = 'Min 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length > 0) { setPwErr(errs); return; }
    setPwLoading(true);
    try {
      await changePasswordApi({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSuccess('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErr({});
    } catch (err) {
      setPwErr({ currentPassword: err.response?.data?.error || 'Failed' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Driver Profile</h2>
        <p className="page-subtitle">Manage your account and vehicle details</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

        {/* Personal info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <Avatar user={user} size={56} />
            <div>
              <h4 style={{ margin: 0 }}>{user?.name}</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{user?.email}</p>
            </div>
          </div>

          <hr className="divider" />
          <h4 style={{ marginBottom: 14 }}>Personal Info</h4>

          {profileSuccess && <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, padding: '9px 12px', marginBottom: 12, fontSize: '0.85rem', color: '#166534' }}>{profileSuccess}</div>}
          {profileErr && <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', marginBottom: 12, fontSize: '0.85rem', color: '#991b1b' }}>{profileErr}</div>}

          <form onSubmit={handleProfileSubmit} noValidate>
            <Input label="Full name" name="name" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} required />
            <Input label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
            
            <div className="form-group">
              <Input
                label="Profile Image URL"
                name="profileImage"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={profileForm.profileImage}
                onChange={(e) => setProfileForm((p) => ({ ...p, profileImage: e.target.value }))}
                error={profileErr && profileErr.includes('image') ? profileErr : ''}
              />
              
              <label className="input-label" style={{ fontSize: '0.8rem', marginTop: 4, marginBottom: 8, color: 'var(--color-text-secondary)' }}>
                Or choose a curated preset:
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setProfileForm(p => ({ ...p, profileImage: url }))}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      border: `2px solid ${profileForm.profileImage === url ? 'var(--color-primary)' : 'transparent'}`,
                      padding: 2,
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      transform: profileForm.profileImage === url ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </button>
                ))}
                {profileForm.profileImage && (
                  <button
                    type="button"
                    onClick={() => setProfileForm(p => ({ ...p, profileImage: '' }))}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Email</label>
              <input className="input" value={user?.email} disabled />
            </div>
            <Button type="submit" variant="primary" fullWidth loading={profileLoading}>Save Changes</Button>
          </form>
        </div>

        {/* Vehicle details */}
        <div className="card">
          <h4 style={{ marginBottom: 4 }}>License & Vehicle</h4>
          <p style={{ fontSize: '0.85rem', marginBottom: 16 }}>Update your driving license and vehicle information.</p>

          {vehicleSuccess && <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, padding: '9px 12px', marginBottom: 12, fontSize: '0.85rem', color: '#166534' }}>{vehicleSuccess}</div>}
          {vehicleErr && <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', marginBottom: 12, fontSize: '0.85rem', color: '#991b1b' }}>{vehicleErr}</div>}

          <form onSubmit={handleVehicleSubmit} noValidate>
            <Input label="License Number" name="licenseNumber" placeholder="GJ01-20201234567" value={vehicleForm.licenseNumber} onChange={(e) => setVehicleForm((p) => ({ ...p, licenseNumber: e.target.value }))} required />

            <div className="form-group">
              <label className="input-label">Vehicle Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {VEHICLE_TYPES.map((type) => (
                  <button key={type} type="button"
                    onClick={() => setVehicleForm((p) => ({ ...p, vehicleType: type }))}
                    style={{ padding: '8px 4px', borderRadius: 7, border: `2px solid ${vehicleForm.vehicleType === type ? 'var(--color-primary)' : 'var(--color-border)'}`, background: vehicleForm.vehicleType === type ? 'var(--color-primary-light)' : 'var(--color-surface)', color: vehicleForm.vehicleType === type ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer', textTransform: 'capitalize' }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <Input label="Vehicle Number" name="vehicleNumber" placeholder="GJ-01-AB-1234" value={vehicleForm.vehicleNumber} onChange={(e) => setVehicleForm((p) => ({ ...p, vehicleNumber: e.target.value }))} required />
            <Input label="Vehicle Model" name="vehicleModel" placeholder="Maruti Swift" value={vehicleForm.vehicleModel} onChange={(e) => setVehicleForm((p) => ({ ...p, vehicleModel: e.target.value }))} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Input label="Color" name="vehicleColor" placeholder="White" value={vehicleForm.vehicleColor} onChange={(e) => setVehicleForm((p) => ({ ...p, vehicleColor: e.target.value }))} />
              <Input label="Year" name="vehicleYear" type="number" placeholder="2020" value={vehicleForm.vehicleYear} onChange={(e) => setVehicleForm((p) => ({ ...p, vehicleYear: e.target.value }))} />
            </div>
            <Button type="submit" variant="primary" fullWidth loading={vehicleLoading}>Update Vehicle</Button>
          </form>
        </div>

        {/* Change password */}
        <div className="card">
          <h4 style={{ marginBottom: 4 }}>Change Password</h4>
          <p style={{ fontSize: '0.85rem', marginBottom: 16 }}>Use a strong password of at least 6 characters.</p>

          {pwSuccess && <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, padding: '9px 12px', marginBottom: 12, fontSize: '0.85rem', color: '#166534' }}>{pwSuccess}</div>}

          <form onSubmit={handlePwSubmit} noValidate>
            <Input label="Current password" name="currentPassword" type="password" placeholder="Enter current password" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} error={pwErr.currentPassword} required />
            <Input label="New password" name="newPassword" type="password" placeholder="At least 6 characters" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} error={pwErr.newPassword} required />
            <Input label="Confirm new password" name="confirmPassword" type="password" placeholder="Re-enter new password" value={pwForm.confirmPassword} onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))} error={pwErr.confirmPassword} required />
            <Button type="submit" variant="primary" fullWidth loading={pwLoading}>Change Password</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;