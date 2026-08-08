import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyProfile, getUserProfile, updateMyProfile, toggleFollow, toggleBlock, getBlockStatus } from '../api/UserApi';
import { getUserPosts, getSavedPosts, deletePost } from '../api/postApi';
import { Edit3, Check, X, Bookmark } from 'lucide-react';
import PostCard from '../components/PostCard';
import FollowListModal from '../components/FollowListModal';

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
  const [blocked, setBlocked] = useState(false);
  const [postsBlocked, setPostsBlocked] = useState(false);
  const [openList, setOpenList] = useState(null); // 'followers' | 'following' | null

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

        if (!isOwnProfile) {
          const blockRes = await getBlockStatus(profileUsername);
          setBlocked(blockRes.data.blocked);
        }
      } catch {
        setError('Failed to load profile');
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await getUserPosts(profileUsername);
        setPosts(res.data);
        setPostsBlocked(false);
      } catch (err) {
        if (err.response?.status === 403) {
          setPostsBlocked(true);
          setPosts([]);
        }
      }
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

  const handleBlock = async () => {
    try {
      const res = await toggleBlock(profileUsername);
      setBlocked(res.data.blocked);
      if (res.data.blocked) {
        setFollowing(false);
        setPostsBlocked(true);
        setPosts([]);
      } else {
        setPostsBlocked(false);
        const res2 = await getUserPosts(profileUsername);
        setPosts(res2.data);
      }
    } catch {
      setError('Failed to update block status');
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

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleFollow} style={{
                  padding: '7px 20px', borderRadius: '8px',
                  background: following ? 'var(--bg-card)' : '#6366f1',
                  color: following ? 'var(--text-secondary)' : 'white',
                  border: following ? '1px solid var(--border)' : 'none',
                  fontWeight: '600', fontSize: '13px', cursor: 'pointer'
                }}>
                  {following ? 'Following' : 'Follow'}
                </button>
                <button onClick={handleBlock} style={{
                  padding: '7px 14px', borderRadius: '8px', border: 'none',
                  background: blocked ? '#fee2e2' : 'var(--bg-hover)',
                  color: blocked ? '#dc2626' : 'var(--text-muted)',
                  fontWeight: '500', fontSize: '13px', cursor: 'pointer'
                }}>
                  {blocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            )}
          </div>

          {/* Name + info */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: '700', fontSize: '20px', marginBottom: '2px', color: 'var(--text-primary)' }}>
              @{profile.username}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {profile.email}
            </div>
            <span style={{
              fontSize: '11px', background: 'var(--accent-light)', color: 'var(--accent)',
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
                  border: '1px solid var(--accent)', fontSize: '14px',
                  resize: 'none', outline: 'none', boxSizing: 'border-box',
                  background: 'var(--bg-secondary)', color: 'var(--text-primary)'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={handleUpdate} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', background: 'var(--accent)', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
                }}>
                  <Check size={14} /> Save
                </button>
                <button onClick={() => setEditing(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', background: 'var(--bg-card)',
                  color: 'var(--text-secondary)', border: '1px solid var(--border)',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
                }}>
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p style={{
              fontSize: '14px',
              color: profile.bio ? 'var(--text-secondary)' : 'var(--text-muted)',
              marginBottom: '12px', lineHeight: '1.6'
            }}>
              {profile.bio || 'No bio yet.'}
            </p>
          )}

          {message && <p style={{ color: 'var(--success)', fontSize: '13px', marginBottom: '8px' }}>{message}</p>}
          {error && <p style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '8px' }}>{error}</p>}

          {/* Stats */}
          <div style={{
            display: 'flex', gap: '24px', paddingTop: '12px',
            borderTop: '1px solid var(--border-light)'
          }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-primary)' }}>
                {posts?.length ?? 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Posts</div>
            </div>

            <div onClick={() => setOpenList('followers')} style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-primary)' }}>
                {followerCount}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Followers</div>
            </div>

            <div onClick={() => setOpenList('following')} style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-primary)' }}>
                {profile.followingCount}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved posts — only on own profile */}
      {isOwnProfile && savedPosts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontWeight: '600', fontSize: '15px', marginBottom: '10px',
            color: 'var(--text-secondary)'
          }}>
            <Bookmark size={16} /> Saved Posts
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
      <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '10px', color: 'var(--text-secondary)' }}>
        Posts
      </div>

      {postsBlocked ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚫</div>
          <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '6px', color: 'var(--text-primary)' }}>
            Content not available
          </div>
          <div style={{ fontSize: '13px' }}>
            You cannot view this user's posts
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No posts yet.
        </div>
      ) : (
        posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={user?.username}
            onDelete={handleDeletePost}
          />
        ))
      )}

      {/* Followers / Following modal */}
      {openList && (
        <FollowListModal
          username={profileUsername}
          type={openList}
          onClose={() => setOpenList(null)}
        />
      )}
    </div>
  );
}
