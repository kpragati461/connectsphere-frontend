import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFeed, createPost, deletePost } from '../api/postApi';

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

  useEffect(() => {
    loadFeed();
  }, []);

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
      setPosts(posts.filter((p) => p.id !== postId));
    } catch {
      setError('Failed to delete post');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '1rem' }}>

      {/* Create post box */}
      <div style={{
        background: '#f9fafb', border: '1px solid #e5e7eb',
        borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem'
      }}>
        <form onSubmit={handlePost}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px',
              border: '1px solid #d1d5db', fontSize: '14px',
              resize: 'none', boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="submit" style={{
              padding: '8px 20px', background: '#6366f1',
              color: 'white', border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontSize: '14px'
            }}>
              Post
            </button>
          </div>
        </form>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p style={{ textAlign: 'center' }}>Loading feed...</p>}

      {/* Posts */}
      {posts.map((post) => (
        <div key={post.id} style={{
          background: 'white', border: '1px solid #e5e7eb',
          borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
        }}>
          {/* Post header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#6366f1', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px'
              }}>
                {post.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>@{post.username}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(post.createdAt)}</div>
              </div>
            </div>
            {/* Delete button — only for post owner */}
            {post.username === user?.username && (
              <button onClick={() => handleDelete(post.id)} style={{
                background: 'none', border: 'none', color: '#ef4444',
                cursor: 'pointer', fontSize: '13px'
              }}>
                Delete
              </button>
            )}
          </div>

          {/* Post content */}
          <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>{post.content}</p>

          {/* Expires indicator */}
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#d1d5db' }}>
            Expires: {formatDate(post.feedExpiresAt)}
          </div>
        </div>
      ))}

      {!loading && posts.length === 0 && (
        <p style={{ textAlign: 'center', color: '#9ca3af' }}>No posts yet. Be the first to post!</p>
      )}
    </div>
  );
}