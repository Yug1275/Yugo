import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import Input from './Input';
import Button from './Button';
import { updateProfileApi, changePasswordApi } from '../../api/userApi';
import { completeDriverProfileApi } from '../../api/driverApi';
import { setDriverProfile } from '../../store/driverSlice';
import { Edit, Lock, ChevronDown, ChevronUp, X, Sun, Moon, LogOut, Car } from './Icons';

/* ─── Rider tabs ─── */
const RiderContent = ({ user, updateUser }) => {
  const [active, setActive] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErrors, setPwErrors] = useState({});

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');
    try {
      const res = await updateProfileApi(profileForm);
      updateUser(res.data.data.user);
      setProfileMsg('✅ Profile updated!');
    } catch (err) {
      setProfileMsg('❌ ' + (err.response?.data?.error || 'Update failed'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!pwForm.currentPassword) errors.currentPassword = 'Required';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6)
      errors.newPassword = 'At least 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) { setPwErrors(errors); return; }
    setPwLoading(true);
    setPwMsg('');
    try {
      await changePasswordApi({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg('✅ Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
    } catch (err) {
      setPwMsg('❌ ' + (err.response?.data?.error || 'Failed'));
    } finally {
      setPwLoading(false);
    }
  };

  const tabs = [
    { key: 'editProfile', icon: <Edit size={16} />, label: 'Edit Profile' },
    { key: 'changePassword', icon: <Lock size={16} />, label: 'Change Password' },
  ];

  return (
    <div>
      {tabs.map((tab) => (
        <div key={tab.key}>
          <button
            onClick={() => setActive(active === tab.key ? null : tab.key)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              background: active === tab.key ? 'var(--color-primary-50)' : 'transparent',
              border: 'none',
              borderLeft: active === tab.key ? '3px solid var(--color-primary)' : '3px solid transparent',
              cursor: 'pointer',
              color: active === tab.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: active === tab.key ? 600 : 500,
              fontSize: '0.875rem',
              transition: 'all 0.15s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (active !== tab.key) {
                e.currentTarget.style.background = 'var(--color-surface-2)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (active !== tab.key) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>{tab.icon}</span>
              {tab.label}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', opacity: 0.6 }}>
              {active === tab.key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          {/* Edit Profile Form */}
          {active === 'editProfile' && tab.key === 'editProfile' && (
            <div style={{ padding: '16px 20px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
              {profileMsg && (
                <div style={{
                  padding: '8px 12px', borderRadius: 8, marginBottom: 12,
                  fontSize: '0.82rem', fontWeight: 500,
                  background: profileMsg.startsWith('✅') ? '#dcfce7' : '#fee2e2',
                  color: profileMsg.startsWith('✅') ? '#166534' : '#991b1b',
                  border: `1px solid ${profileMsg.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`,
                }}>
                  {profileMsg}
                </div>
              )}
              <form onSubmit={handleProfileSubmit} noValidate>
                <Input label="Full name" name="name" value={profileForm.name}
                  onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))} required />
                <Input label="Phone" name="phone" type="tel" placeholder="+91 98765 43210"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                <div className="form-group">
                  <label className="input-label">Email</label>
                  <input className="input" value={user?.email} disabled />
                </div>
                <Button type="submit" variant="primary" loading={profileLoading} fullWidth>Save Changes</Button>
              </form>
            </div>
          )}

          {/* Change Password Form */}
          {active === 'changePassword' && tab.key === 'changePassword' && (
            <div style={{ padding: '16px 20px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
              {pwMsg && (
                <div style={{
                  padding: '8px 12px', borderRadius: 8, marginBottom: 12,
                  fontSize: '0.82rem', fontWeight: 500,
                  background: pwMsg.startsWith('✅') ? '#dcfce7' : '#fee2e2',
                  color: pwMsg.startsWith('✅') ? '#166534' : '#991b1b',
                  border: `1px solid ${pwMsg.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`,
                }}>
                  {pwMsg}
                </div>
              )}
              <form onSubmit={handlePwSubmit} noValidate>
                <Input label="Current password" name="currentPassword" type="password"
                  placeholder="Enter current password" value={pwForm.currentPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                  error={pwErrors.currentPassword} required />
                <Input label="New password" name="newPassword" type="password"
                  placeholder="At least 6 characters" value={pwForm.newPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  error={pwErrors.newPassword} required />
                <Input label="Confirm new password" name="confirmPassword" type="password"
                  placeholder="Re-enter new password" value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  error={pwErrors.confirmPassword} required />
                <Button type="submit" variant="primary" loading={pwLoading} fullWidth>Change Password</Button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ─── Driver tabs ─── */
const VEHICLE_TYPES = ['sedan', 'suv', 'hatchback', 'auto'];

const DriverContent = ({ user, updateUser }) => {
  const dispatch = useDispatch();
  const { profile, vehicle } = useSelector((s) => s.driver);
  const [active, setActive] = useState(null);

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [vehicleForm, setVehicleForm] = useState({
    licenseNumber: '', vehicleType: 'sedan', vehicleNumber: '',
    vehicleModel: '', vehicleColor: '', vehicleYear: '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const [profileLoading, setProfileLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [vehicleMsg, setVehicleMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErrors, setPwErrors] = useState({});

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
    setProfileLoading(true); setProfileMsg('');
    try {
      const res = await updateProfileApi(profileForm);
      updateUser(res.data.data.user);
      setProfileMsg('✅ Profile updated!');
    } catch (err) {
      setProfileMsg('❌ ' + (err.response?.data?.error || 'Failed'));
    } finally { setProfileLoading(false); }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleForm.licenseNumber || !vehicleForm.vehicleNumber || !vehicleForm.vehicleModel) {
      setVehicleMsg('❌ License, vehicle number and model are required');
      return;
    }
    setVehicleLoading(true); setVehicleMsg('');
    try {
      const res = await completeDriverProfileApi({
        ...vehicleForm,
        vehicleYear: vehicleForm.vehicleYear ? parseInt(vehicleForm.vehicleYear) : null,
      });
      dispatch(setDriverProfile(res.data.data));
      setVehicleMsg('✅ Vehicle updated!');
    } catch (err) {
      setVehicleMsg('❌ ' + (err.response?.data?.error || 'Failed'));
    } finally { setVehicleLoading(false); }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!pwForm.currentPassword) errors.currentPassword = 'Required';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) errors.newPassword = 'Min 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) { setPwErrors(errors); return; }
    setPwLoading(true); setPwMsg('');
    try {
      await changePasswordApi({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg('✅ Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
    } catch (err) {
      setPwMsg('❌ ' + (err.response?.data?.error || 'Failed'));
    } finally { setPwLoading(false); }
  };

  const tabs = [
    { key: 'editProfile', icon: <Edit size={16} />, label: 'Edit Profile' },
    { key: 'vehicleDetails', icon: <Car size={16} />, label: 'Vehicle Details' },
    { key: 'changePassword', icon: <Lock size={16} />, label: 'Change Password' },
  ];

  const msgBox = (msg) => msg ? (
    <div style={{
      padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: '0.82rem', fontWeight: 500,
      background: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2',
      color: msg.startsWith('✅') ? '#166534' : '#991b1b',
      border: `1px solid ${msg.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`,
    }}>{msg}</div>
  ) : null;

  return (
    <div>
      {tabs.map((tab) => (
        <div key={tab.key}>
          <button
            onClick={() => setActive(active === tab.key ? null : tab.key)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px',
              background: active === tab.key ? 'var(--color-primary-50)' : 'transparent',
              border: 'none',
              borderLeft: active === tab.key ? '3px solid var(--color-primary)' : '3px solid transparent',
              cursor: 'pointer',
              color: active === tab.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: active === tab.key ? 600 : 500,
              fontSize: '0.875rem', transition: 'all 0.15s ease', textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (active !== tab.key) {
                e.currentTarget.style.background = 'var(--color-surface-2)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (active !== tab.key) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>{tab.icon}</span>
              {tab.label}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', opacity: 0.6 }}>
              {active === tab.key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          {active === 'editProfile' && tab.key === 'editProfile' && (
            <div style={{ padding: '16px 20px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
              {msgBox(profileMsg)}
              <form onSubmit={handleProfileSubmit} noValidate>
                <Input label="Full name" name="name" value={profileForm.name}
                  onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))} required />
                <Input label="Phone" name="phone" type="tel" placeholder="+91 98765 43210"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                <div className="form-group">
                  <label className="input-label">Email</label>
                  <input className="input" value={user?.email} disabled />
                </div>
                <Button type="submit" variant="primary" loading={profileLoading} fullWidth>Save Changes</Button>
              </form>
            </div>
          )}

          {active === 'vehicleDetails' && tab.key === 'vehicleDetails' && (
            <div style={{ padding: '16px 20px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
              {msgBox(vehicleMsg)}
              <form onSubmit={handleVehicleSubmit} noValidate>
                <Input label="License Number" name="licenseNumber" placeholder="GJ01-20201234567"
                  value={vehicleForm.licenseNumber}
                  onChange={(e) => setVehicleForm(p => ({ ...p, licenseNumber: e.target.value }))} required />
                <div className="form-group">
                  <label className="input-label">Vehicle Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
                    {VEHICLE_TYPES.map((type) => (
                      <button key={type} type="button"
                        onClick={() => setVehicleForm(p => ({ ...p, vehicleType: type }))}
                        style={{
                          padding: '7px 4px', borderRadius: 7,
                          border: `2px solid ${vehicleForm.vehicleType === type ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: vehicleForm.vehicleType === type ? 'var(--color-primary-light)' : 'var(--color-surface)',
                          color: vehicleForm.vehicleType === type ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                          fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer', textTransform: 'capitalize',
                        }}
                      >{type}</button>
                    ))}
                  </div>
                </div>
                <Input label="Vehicle Number" name="vehicleNumber" placeholder="GJ-01-AB-1234"
                  value={vehicleForm.vehicleNumber}
                  onChange={(e) => setVehicleForm(p => ({ ...p, vehicleNumber: e.target.value }))} required />
                <Input label="Vehicle Model" name="vehicleModel" placeholder="Maruti Swift"
                  value={vehicleForm.vehicleModel}
                  onChange={(e) => setVehicleForm(p => ({ ...p, vehicleModel: e.target.value }))} required />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Input label="Color" name="vehicleColor" placeholder="White"
                    value={vehicleForm.vehicleColor}
                    onChange={(e) => setVehicleForm(p => ({ ...p, vehicleColor: e.target.value }))} />
                  <Input label="Year" name="vehicleYear" type="number" placeholder="2020"
                    value={vehicleForm.vehicleYear}
                    onChange={(e) => setVehicleForm(p => ({ ...p, vehicleYear: e.target.value }))} />
                </div>
                <Button type="submit" variant="primary" loading={vehicleLoading} fullWidth>Update Vehicle</Button>
              </form>
            </div>
          )}

          {active === 'changePassword' && tab.key === 'changePassword' && (
            <div style={{ padding: '16px 20px', background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
              {msgBox(pwMsg)}
              <form onSubmit={handlePwSubmit} noValidate>
                <Input label="Current password" name="currentPassword" type="password"
                  placeholder="Enter current password" value={pwForm.currentPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                  error={pwErrors.currentPassword} required />
                <Input label="New password" name="newPassword" type="password"
                  placeholder="At least 6 characters" value={pwForm.newPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  error={pwErrors.newPassword} required />
                <Input label="Confirm new password" name="confirmPassword" type="password"
                  placeholder="Re-enter new password" value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  error={pwErrors.confirmPassword} required />
                <Button type="submit" variant="primary" loading={pwLoading} fullWidth>Change Password</Button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ─── Admin tabs ─── */
const AdminContent = ({ user, updateUser }) => {
  const [active, setActive] = useState(null);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErrors, setPwErrors] = useState({});

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true); setProfileMsg('');
    try {
      const res = await updateProfileApi(profileForm);
      updateUser(res.data.data.user);
      setProfileMsg('✅ Profile updated!');
    } catch (err) {
      setProfileMsg('❌ ' + (err.response?.data?.error || 'Failed'));
    } finally { setProfileLoading(false); }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!pwForm.currentPassword) errors.currentPassword = 'Required';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) errors.newPassword = 'Min 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) { setPwErrors(errors); return; }
    setPwLoading(true); setPwMsg('');
    try {
      await changePasswordApi({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg('✅ Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
    } catch (err) {
      setPwMsg('❌ ' + (err.response?.data?.error || 'Failed'));
    } finally { setPwLoading(false); }
  };

  const msgBox = (msg) => msg ? (
    <div style={{
      padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: '0.82rem', fontWeight: 500,
      background: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2',
      color: msg.startsWith('✅') ? '#166534' : '#991b1b',
      border: `1px solid ${msg.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`,
    }}>{msg}</div>
  ) : null;

  const tabs = [
    { key: 'editProfile', icon: <Edit size={16} />, label: 'Edit Profile' },
    { key: 'changePassword', icon: <Lock size={16} />, label: 'Change Password' },
  ];

  return (
    <div>
      {tabs.map((tab) => (
        <div key={tab.key}>
          <button
            onClick={() => setActive(active === tab.key ? null : tab.key)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px',
              background: active === tab.key ? 'rgba(37,99,235,0.12)' : 'transparent',
              border: 'none',
              borderLeft: active === tab.key ? '3px solid var(--color-primary)' : '3px solid transparent',
              cursor: 'pointer',
              color: active === tab.key ? '#93c5fd' : '#94a3b8',
              fontWeight: active === tab.key ? 600 : 500,
              fontSize: '0.875rem', transition: 'all 0.15s ease', textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (active !== tab.key) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = '#e2e8f0';
              }
            }}
            onMouseLeave={(e) => {
              if (active !== tab.key) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
              }
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>{tab.icon}</span>
              {tab.label}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', opacity: 0.5 }}>
              {active === tab.key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          {active === 'editProfile' && tab.key === 'editProfile' && (
            <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {msgBox(profileMsg)}
              <form onSubmit={handleProfileSubmit} noValidate>
                <Input label="Full name" name="name" value={profileForm.name}
                  onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))} required />
                <Input label="Phone" name="phone" type="tel" placeholder="+91 98765 43210"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                <div className="form-group">
                  <label className="input-label" style={{ color: '#94a3b8' }}>Email</label>
                  <input className="input" value={user?.email} disabled />
                </div>
                <Button type="submit" variant="primary" loading={profileLoading} fullWidth>Save Changes</Button>
              </form>
            </div>
          )}

          {active === 'changePassword' && tab.key === 'changePassword' && (
            <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {msgBox(pwMsg)}
              <form onSubmit={handlePwSubmit} noValidate>
                <Input label="Current password" name="currentPassword" type="password"
                  placeholder="Enter current password" value={pwForm.currentPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                  error={pwErrors.currentPassword} required />
                <Input label="New password" name="newPassword" type="password"
                  placeholder="At least 6 characters" value={pwForm.newPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  error={pwErrors.newPassword} required />
                <Input label="Confirm new password" name="confirmPassword" type="password"
                  placeholder="Re-enter new password" value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  error={pwErrors.confirmPassword} required />
                <Button type="submit" variant="primary" loading={pwLoading} fullWidth>Change Password</Button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   Main ProfileSidebar component
═══════════════════════════════════════════════════ */
const ProfileSidebar = ({ isOpen, onClose }) => {
  const { user, logout, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const isAdmin = user?.role === 'admin';

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Sidebar Panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 360,
          maxWidth: '100vw',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          background: isAdmin ? '#0f172a' : 'var(--color-surface)',
          borderLeft: isAdmin
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid var(--color-border)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
        }}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div
          style={{
            padding: '20px',
            background: isAdmin
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
              : 'var(--gradient-primary)',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Background pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px)',
          }} />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
              zIndex: 1,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <X size={18} />
          </button>

          {/* Avatar & info */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: '2.5px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '1.1rem',
                backdropFilter: 'blur(8px)',
              }}>
                {initials}
              </div>
              {/* Online dot */}
              <div style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 10, height: 10, borderRadius: '50%',
                background: '#4ade80',
                border: '2px solid rgba(255,255,255,0.5)',
              }} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>
                {user?.role} · {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* ── Quick actions bar ───────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: isAdmin ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--color-border)',
          background: isAdmin ? 'rgba(255,255,255,0.03)' : 'var(--color-surface-2)',
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px',
            color: isAdmin ? '#64748b' : 'var(--color-text-muted)',
            textTransform: 'uppercase',
          }}>
            Quick Actions
          </span>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            style={{
              background: isAdmin ? 'rgba(255,255,255,0.07)' : 'var(--color-surface)',
              border: isAdmin ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--color-border)',
              borderRadius: 8, width: 34, height: 34,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
              color: isAdmin ? '#94a3b8' : 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* ── Role-based tabs ─────────────────────────────── */}
        <div style={{ flexShrink: 0, paddingTop: 8, paddingBottom: 4 }}>
          {user?.role === 'rider' && (
            <RiderContent user={user} updateUser={updateUser} />
          )}
          {user?.role === 'driver' && (
            <DriverContent user={user} updateUser={updateUser} />
          )}
          {user?.role === 'admin' && (
            <AdminContent user={user} updateUser={updateUser} />
          )}
        </div>

        {/* ── Spacer ──────────────────────────────────────── */}
        <div style={{ flex: 1 }} />

        {/* ── Logout button ───────────────────────────────── */}
        <div style={{
          padding: '16px 20px',
          borderTop: isAdmin ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 16px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none', borderRadius: 10,
              color: '#fff', fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.1)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(239,68,68,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,68,68,0.3)';
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;
