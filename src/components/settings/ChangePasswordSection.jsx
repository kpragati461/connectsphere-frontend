import { useState } from 'react';
import { verifyPassword, changePassword } from '../../api/UserApi';

export default function ChangePasswordSection() {
  const [step, setStep] = useState('verify'); // 'verify' | 'set'
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--border)', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
    background: 'var(--bg-secondary)', color: 'var(--text-primary)'
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await verifyPassword(currentPassword);
      setStep('set');
    } catch (err) {
      setError(err.response?.data?.error || 'Current password is incorrect');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setMessage('Password updated successfully.');
      setStep('verify');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
      // if the current password was somehow rejected on final submit
      // (e.g. changed in another tab), send them back to step 1
      if (err.response?.status === 400 && /current password/i.test(err.response?.data?.error || '')) {
        setStep('verify');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep('verify');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
        Change Password
      </h3>

      {step === 'verify' && (
        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '360px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Enter your current password to continue
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoFocus
              style={inputStyle}
            />
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '13px' }}>{error}</div>}

          <button
            type="submit"
            disabled={submitting || !currentPassword}
            style={{
              padding: '10px 16px', borderRadius: '8px', border: 'none',
              background: 'var(--accent)', color: 'white', fontSize: '14px',
              fontWeight: '600', cursor: submitting ? 'default' : 'pointer',
              opacity: submitting || !currentPassword ? 0.6 : 1, marginTop: '4px'
            }}
          >
            {submitting ? 'Checking…' : 'Continue'}
          </button>
        </form>
      )}

      {step === 'set' && (
        <form onSubmit={handleSetNewPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '360px' }}>
          <div style={{
            fontSize: '13px', color: 'var(--success)', padding: '8px 12px',
            background: 'var(--bg-hover)', borderRadius: '8px'
          }}>
            Password verified. Choose a new password below.
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoFocus
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '13px' }}>{error}</div>}
          {message && <div style={{ color: 'var(--success)', fontSize: '13px' }}>{message}</div>}

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 16px', borderRadius: '8px', border: 'none',
                background: 'var(--accent)', color: 'white', fontSize: '14px',
                fontWeight: '600', cursor: submitting ? 'default' : 'pointer',
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? 'Saving…' : 'Save New Password'}
            </button>
            <button
              type="button"
              onClick={handleBack}
              style={{
                padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
}