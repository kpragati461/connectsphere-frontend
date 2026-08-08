import { useState, useEffect, useRef } from 'react';
import { getMyProfile, updateMyProfile } from '../../api/UserApi';
import { uploadAvatar } from '../../api/MediaApi';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePersonalizationSection() {
  const { refreshUser } = useAuth();
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        setBio(res.data.bio || '');
        setProfilePhoto(res.data.profilePhoto || '');
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image')) {
      setError('Profile picture must be an image');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('File too large (max 25MB)');
      return;
    }

    setError('');
    setMessage('');
    setUploadingAvatar(true);
    try {
      const uploadRes = await uploadAvatar(file);
      const url = uploadRes.data.url;
      await updateMyProfile({ bio, profilePhoto: url });
      setProfilePhoto(url);
      setMessage('Profile picture updated.');
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateMyProfile({ bio, profilePhoto });
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

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden',
          background: 'var(--accent)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'white', fontSize: '26px', fontWeight: '700',
          flexShrink: 0
        }}>
          {profilePhoto ? (
            <img src={profilePhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            'U'
          )}
        </div>
        <div>
          <label style={{
            display: 'inline-block', padding: '7px 14px', borderRadius: '8px',
            border: '1px solid var(--border)', fontSize: '13px', cursor: 'pointer',
            color: 'var(--text-primary)', background: 'var(--bg-hover)'
          }}>
            {uploadingAvatar ? 'Uploading…' : 'Change Picture'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              disabled={uploadingAvatar}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

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