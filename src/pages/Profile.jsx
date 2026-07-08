import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, getUserProfile, updateMyProfile, toggleFollow } from '../api/userApi';
import { getUserPosts } from '../api/postApi';
import { useParams, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();

  const isOwnProfile = !username || username === user?.username;
  const profileUsername = username || user?.username;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = isOwnProfile
          ? await getMyProfile()
          : await getUserProfile(profileUsername);
        setProfile(res.data);
        setBio(res.data.bio || '');
        setFollowing(res.data.followedByCurrentUser);
        setFollowerCount(res.data.followerCount);
      } catch {
        setError('Failed to load profile');
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await getUserPosts(profileUsername);
        setPosts(res.data);
      } catch {
        console.error('Failed to load posts');
      }
    };

    fetchProfile();
    fetchPosts();
  }, [profileUsername]);

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

  const handleFollow = async () => {
    try {
      const res = await toggleFollow(profileUsername);
      setFollowing(res.data.followed);
      setFollowerCount((prev) => res.data.followed ? prev + 1 : prev - 1);
    } catch {
      setError('Failed to follow user');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  if (!profile) return (
    <p style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</p>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '1rem' }}>

      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#6366f1', marginBottom: '1rem', fontSize: '14px'
      }}>← Back</button>

      {/* Profile header */}
      <div style={{
        background: 'white', border: '1px solid #e5e7eb',
        borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#6366f1', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.8rem', color: 'white', fontWeight: 'bold'
            }}>
              {profile.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>@{profile.username}</h3>
              <p style={{ margin: '2px 0', color: '#9ca3af', fontSize: '13px' }}>
                {profile.email}
              </p>
              <span style={{
                fontSize: '11px', background: '#e0e7ff', color: '#4338ca',
                padding: '2px 8px', borderRadius: '99px'
              }}>
                {profile.role}
              </span>
            </div>
          </div>

          {/* Follow / Edit button */}
          {isOwnProfile ? (
            <button onClick={() => setEditing(!editing)} style={{
              padding: '8px 16px', background: '#f3f4f6',
              border: '1px solid #d1d5db', borderRadius: '8px',
              cursor: 'pointer', fontSize: '13px'
            }}>
              Edit Profile
            </button>
          ) : (
            <button onClick={handleFollow} style={{
              padding: '8px 16px',
              background: following ? '#f3f4f6' : '#6366f1',
              color: following ? '#374151' : 'white',
              border: following ? '1px solid #d1d5db' : 'none',
              borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
            }}>
              {following ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        {/* Follow stats */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>{posts.length}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Posts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>{followerCount}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Followers</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>{profile.followingCount}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Following</div>
          </div>
        </div>

        {/* Bio */}
        <div style={{ marginTop: '1rem' }}>
          {editing ? (
            <div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell people about yourself..."
                style={{
                  width: '100%', padding: '8px', borderRadius: '6px',
                  border: '1px solid #d1d5db', boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={handleUpdate} style={{
                  padding: '6px 16px', background: '#6366f1',
                  color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
                }}>Save</button>
                <button onClick={() => setEditing(false)} style={{
                  padding: '6px 16px', background: '#f3f4f6',
                  border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer'
                }}>Cancel</button>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, color: profile.bio ? '#374151' : '#9ca3af', fontSize: '14px' }}>
              {profile.bio || 'No bio yet.'}
            </p>
          )}
        </div>

        {message && <p style={{ color: 'green', marginTop: '8px' }}>{message}</p>}
        {error && <p style={{ color: 'red', marginTop: '8px' }}>{error}</p>}
      </div>

      {/* User posts */}
      <h4 style={{ marginBottom: '12px' }}>Posts</h4>
      {posts.length === 0 && (
        <p style={{ color: '#9ca3af', textAlign: 'center' }}>No posts yet.</p>
      )}
      {posts.map((post) => (
        <div key={post.id} style={{
          background: 'white', border: '1px solid #e5e7eb',
          borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
        }}>
          <p style={{ margin: '0 0 8px', fontSize: '15px' }}>{post.content}</p>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            {formatDate(post.createdAt)} · ❤️ {post.likeCount} · 💬 {post.commentCount}
          </div>
        </div>
      ))}
    </div>
  );
}