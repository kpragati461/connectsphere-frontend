import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, updateMyProfile } from '../api/userApi';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        setProfile(res.data);
        setBio(res.data.bio || '');
      })
      .catch(() => setError('Failed to load profile'));
  }, []);

  const handleUpdate = async () => {
    try {
      const res = await updateMyProfile({ bio });
      setProfile(res.data);
      setEditing(false);
      setMessage('Profile updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setError('Failed to update profile');
    }
  };

  if (!profile) return <p style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', padding: '2rem' }}>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: '#6366f1', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '2rem', color: 'white'
        }}>
          {profile.username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: 0 }}>@{profile.username}</h2>
          <p style={{ margin: '4px 0', color: '#888' }}>{profile.email}</p>
          <span style={{
            fontSize: '12px', background: '#e0e7ff', color: '#4338ca',
            padding: '2px 8px', borderRadius: '99px'
          }}>
            {profile.role}
          </span>
        </div>
      </div>

      {/* Bio section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '8px' }}>Bio</h4>
        {editing ? (
          <div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell people about yourself..."
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button onClick={handleUpdate} style={{
                padding: '8px 16px', background: '#6366f1',
                color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
              }}>
                Save
              </button>
              <button onClick={() => setEditing(false)} style={{
                padding: '8px 16px', background: '#e5e7eb',
                border: 'none', borderRadius: '6px', cursor: 'pointer'
              }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: profile.bio ? '#333' : '#aaa' }}>
              {profile.bio || 'No bio yet.'}
            </p>
            <button onClick={() => setEditing(true)} style={{
              padding: '6px 14px', background: '#f3f4f6',
              border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer'
            }}>
              Edit Bio
            </button>
          </div>
        )}
      </div>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

    </div>
  );
}