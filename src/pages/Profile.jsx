import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyProfile, getUserProfile, updateMyProfile, toggleFollow } from '../api/UserApi';
import { getUserPosts, getSavedPosts, deletePost } from '../api/postApi';
import { MapPin, Calendar, Users, Edit3, Check, X, Bookmark } from 'lucide-react';
import PostCard from '../components/PostCard';

export default function Profile() {
  const { user } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();

  const isOwnProfile = !username || username === user?.username;
  const profileUsername = username || user?.username;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
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
      } catch {}
    };

    const fetchSavedPosts = async () => {
      if (!isOwnProfile) return;
      try {
        const res = await getSavedPosts();
        setSavedPosts(res.data);
      } catch {}
    };

    fetchProfile();
    fetchPosts();
    fetchSavedPosts();
  }, [profileUsername, isOwnProfile]);

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
      setFollowerCount(prev => res.data.followed ? prev + 1 : prev - 1);
    } catch {
      setError('Failed to follow user');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setSavedPosts(prev => prev.filter(p => p.id !== postId));
    } catch {
      setError('Failed to delete post');
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
      Loading profile...
    </div>
  );

  return (
    <div>
      {/* Profile card */}
      <div className="card" style={{ marginBottom: '12px', overflow: 'hidden' }}>

        {/* Cover */}
        <div style={{
          height: '100px',
          background: `linear-gradient(135deg, hsl(${profile.username?.charCodeAt(0) * 10}, 65%, 55%), #6366f1)`,
        }} />

        {/* Avatar + actions */}
        <div style={{ padding: '0 20px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div className="avatar" style={{
  width: '80px', height: '80px', fontSize: '28px',
  border: '4px solid white', marginTop: '-40px',
  background: `hsl(${profile.username?.charCodeAt(0) * 10}, 65%, 55%)`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  position: 'relative', zIndex: 1
}}>
              {profile.username?.charAt(0).toUpperCase()}
            </div>

            {isOwnProfile ? (
              <button onClick={() => setEditing(!editing)} className="btn-secondary" style={{
                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '7px 14px'
              }}>
                <Edit3 size={14} /> Edit Profile
              </button>
            ) : (
              <button onClick={handleFollow} style={{
                padding: '7px 20px', borderRadius: '8px', border: 'none',
                background: following ? 'white' : '#6366f1',
                color: following ? '#374151' : 'white',
                border: following ? '1px solid #d1d5db' : 'none',
                fontWeight: '600', fontSize: '13px', cursor: 'pointer'
              }}>
                {following ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Name + info */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: '700', fontSize: '20px', marginBottom: '2px' }}>
              @{profile.username}
            </div>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
              {profile.email}
            </div>
            <span style={{
              fontSize: '11px', background: '#eef2ff', color: '#6366f1',
              padding: '2px 10px', borderRadius: '99px', fontWeight: '600'
            }}>
              {profile.role}
            </span>
          </div>

          {/* Bio */}
          {editing ? (
            <div style={{ marginBottom: '12px' }}>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                placeholder="Tell people about yourself..."
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid #6366f1', fontSize: '14px',
                  resize: 'none', outline: 'none', boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={handleUpdate} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', background: '#6366f1', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
                }}>
                  <Check size={14} /> Save
                </button>
                <button onClick={() => setEditing(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', background: 'white', color: '#374151',
                  border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
                }}>
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p style={{
              fontSize: '14px', color: profile.bio ? '#374151' : '#9ca3af',
              marginBottom: '12px', lineHeight: '1.6'
            }}>
              {profile.bio || 'No bio yet.'}
            </p>
          )}

          {message && <p style={{ color: '#10b981', fontSize: '13px', marginBottom: '8px' }}>{message}</p>}
          {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '8px' }}>{error}</p>}

          {/* Stats */}
          <div style={{
            display: 'flex', gap: '24px', paddingTop: '12px',
            borderTop: '1px solid #f3f4f6'
          }}>
            {[
              { label: 'Posts', value: posts.length },
              { label: 'Followers', value: followerCount },
              { label: 'Following', value: profile.followingCount },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontWeight: '700', fontSize: '18px' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Saved posts */}
      {isOwnProfile && savedPosts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '15px', marginBottom: '10px', color: '#374151' }}>
            <Bookmark size={16} />
            Saved Posts
          </div>
          {savedPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={user?.username}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      )}

      {/* Posts */}
      <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '10px', color: '#374151' }}>
        Posts
      </div>

      {posts.length === 0 && (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
          No posts yet.
        </div>
      )}

      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={user?.username}
          onDelete={handleDeletePost}
        />
      ))}
    </div>
  );
}