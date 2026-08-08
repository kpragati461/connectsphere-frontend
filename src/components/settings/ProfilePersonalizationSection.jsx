import { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile } from '../../api/UserApi';

export default function ProfilePersonalizationSection() {
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((res) => setBio(res.data.bio || ''))
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateMyProfile({ bio });
      setMessage('Profile updated.');
    } catch {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading…</div>;

  return (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
        Profile
      </h3>

      <label style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
        Bio
      </label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={4}
        placeholder="Tell people about yourself..."
        style={{
          width: '100%', maxWidth: '400px', padding: '10px 12px', borderRadius: '8px',
          border: '1px solid var(--border)', fontSize: '14px', resize: 'none',
          outline: 'none', boxSizing: 'border-box',
          background: 'var(--bg-secondary)', color: 'var(--text-primary)'
        }}
      />

      {error && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{error}</div>}
      {message && <div style={{ color: 'var(--success)', fontSize: '13px', marginTop: '8px' }}>{message}</div>}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          marginTop: '12px', padding: '9px 18px', borderRadius: '8px', border: 'none',
          background: 'var(--accent)', color: 'white', fontSize: '14px', fontWeight: '600',
          cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1
        }}
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
}