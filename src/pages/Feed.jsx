import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFeed, createPost, deletePost } from '../api/postApi';
import { Image } from 'lucide-react';
import PostCard from '../components/PostCard';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    try {
      const res = await getFeed();
      setPosts(res.data);
    } catch {
      setError('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFeed(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await createPost({ content });
      setContent('');
      loadFeed();
    } catch {
      setError('Failed to create post');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch {
      setError('Failed to delete post');
    }
  };

  return (
    <div>
      {/* Create post card */}
      <div className="card" style={{ padding: '16px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div className="avatar" style={{ width: '42px', height: '42px', fontSize: '16px', flexShrink: 0 }}>
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <form onSubmit={handlePost} style={{ flex: 1 }}>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              style={{
                width: '100%', padding: '10px 14px',
                borderRadius: '10px', border: '1px solid #e5e7eb',
                fontSize: '14px', resize: 'none', outline: 'none',
                background: '#f9fafb', boxSizing: 'border-box',
                lineHeight: '1.5', color: '#111827',
                transition: 'border-color 0.15s'
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <button type="button" style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'none', border: 'none', color: '#9ca3af',
                cursor: 'pointer', fontSize: '13px', padding: '4px 8px', borderRadius: '6px'
              }}>
                <Image size={16} /> Photo
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '7px 20px' }}>
                Post
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && <p style={{ color: 'red', marginBottom: '10px', fontSize: '13px' }}>{error}</p>}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          Loading feed...
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>👋</div>
          <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Your feed is empty</div>
          <div style={{ color: '#9ca3af', fontSize: '14px' }}>
            Follow some users to see their posts here
          </div>
        </div>
      )}

      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={user?.username}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}