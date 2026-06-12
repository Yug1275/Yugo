import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import { updateProfileApi, changePasswordApi } from '../../api/userApi';
import { getInitials } from '../../utils/helpers';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna'
];

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) setProfileErrors((prev) => ({ ...prev, [name]: '' }));
    if (profileSuccess) setProfileSuccess('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!profileForm.name.trim()) errors.name = 'Name is required';
    if (Object.keys(errors).length > 0) { setProfileErrors(errors); return; }

    setProfileLoading(true);
    try {
      const res = await updateProfileApi(profileForm);
      updateUser(res.data.data.user);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileErrors({ name: err.response?.data?.error || 'Update failed' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
    if (pwErrors[name]) setPwErrors((prev) => ({ ...prev, [name]: '' }));
    if (pwSuccess) setPwSuccess('');
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!pwForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!pwForm.newPassword) errors.newPassword = 'New password is required';
    else if (pwForm.newPassword.length < 6) errors.newPassword = 'At least 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) { setPwErrors(errors); return; }

    setPwLoading(true);
    try {
      await changePasswordApi({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwErrors({ currentPassword: err.response?.data?.error || 'Failed to change password' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">My Profile</h2>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      <div className="responsive-grid-auto-fit" style={{ gap: 20, ['--grid-min']: '300px' }}>

        {/* Profile card */}
        <div className="card">
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <Avatar user={user} size={64} />
            <div>
              <h4 style={{ margin: 0 }}>{user?.name}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                {user?.role} · {user?.email}
              </p>
            </div>
          </div>

          <hr className="divider" />
          <h4 style={{ marginBottom: 16 }}>Edit Profile</h4>

          {profileSuccess && (
            <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.875rem', color: '#166534' }}>
              {profileSuccess}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} noValidate>
            <Input
              label="Full name"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              error={profileErrors.name}
              required
            />
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={profileForm.phone}
              onChange={handleProfileChange}
              error={profileErrors.phone}
            />
            
            <div className="form-group">
              <Input
                label="Profile Image URL"
                name="profileImage"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={profileForm.profileImage}
                onChange={handleProfileChange}
                error={profileErrors.profileImage}
              />
              
              <label className="input-label" style={{ fontSize: '0.8rem', marginTop: 4, marginBottom: 8, color: 'var(--color-text-secondary)' }}>
                Or choose a curated preset:
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => {
                      setProfileForm(p => ({ ...p, profileImage: url }));
                      if (profileErrors.profileImage) {
                        setProfileErrors(prev => ({ ...prev, profileImage: '' }));
                      }
                    }}
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
              <label className="input-label">Email address</label>
              <input className="input" value={user?.email} disabled />
              <span className="input-error" style={{ color: 'var(--color-text-muted)' }}>
                Email cannot be changed
              </span>
            </div>
            <Button type="submit" variant="primary" loading={profileLoading} fullWidth>
              Save Changes
            </Button>
          </form>
        </div>

        {/* Change password card */}
        <div className="card">
          <h4 style={{ marginBottom: 4 }}>Change Password</h4>
          <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>
            Use a strong password with at least 6 characters.
          </p>

          {pwSuccess && (
            <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.875rem', color: '#166534' }}>
              {pwSuccess}
            </div>
          )}

          <form onSubmit={handlePwSubmit} noValidate>
            <Input
              label="Current password"
              name="currentPassword"
              type="password"
              placeholder="Enter current password"
              value={pwForm.currentPassword}
              onChange={handlePwChange}
              error={pwErrors.currentPassword}
              required
            />
            <Input
              label="New password"
              name="newPassword"
              type="password"
              placeholder="At least 6 characters"
              value={pwForm.newPassword}
              onChange={handlePwChange}
              error={pwErrors.newPassword}
              required
            />
            <Input
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter new password"
              value={pwForm.confirmPassword}
              onChange={handlePwChange}
              error={pwErrors.confirmPassword}
              required
            />
            <Button type="submit" variant="primary" loading={pwLoading} fullWidth>
              Change Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;