import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFeed, createPost, deletePost } from '../api/postApi';
import { uploadPostMedia } from '../api/MediaApi';
import { Image, X } from 'lucide-react';
import PostCard from '../components/PostCard';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image');
    const isVideo = file.type.startsWith('video');
    if (!isImage && !isVideo) {
      setError('Only image or video files are allowed');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('File too large (max 25MB)');
      return;
    }

    setError('');
    setMediaFile(file);
    setMediaPreview({ url: URL.createObjectURL(file), type: isVideo ? 'video' : 'image' });
  };

  const clearMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview.url);
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) return;

    setError('');
    try {
      let mediaUrl = null;

      if (mediaFile) {
        setUploading(true);
        const res = await uploadPostMedia(mediaFile);
        mediaUrl = res.data.url;
      }

      await createPost({ content, mediaUrl });
      setContent('');
      clearMedia();
      loadFeed();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setUploading(false);
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
          <div className="avatar" style={{ width: '42px', height: '42px', fontSize: '16px', flexShrink: 0, overflow: 'hidden' }}>
  {user?.profilePhoto ? (
    <img src={user.profilePhoto} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  ) : (
    user?.username?.charAt(0).toUpperCase()
  )}
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

            {mediaPreview && (
              <div style={{ position: 'relative', marginTop: '10px', display: 'inline-block' }}>
                {mediaPreview.type === 'video' ? (
                  <video
                    src={mediaPreview.url}
                    controls
                    style={{ maxHeight: '220px', borderRadius: '10px', display: 'block' }}
                  />
                ) : (
                  <img
                    src={mediaPreview.url}
                    alt="preview"
                    style={{ maxHeight: '220px', borderRadius: '10px', display: 'block' }}
                  />
                )}
                <button
                  type="button"
                  onClick={clearMedia}
                  style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                    width: '24px', height: '24px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: 'white'
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'none', border: 'none', color: '#9ca3af',
                cursor: 'pointer', fontSize: '13px', padding: '4px 8px', borderRadius: '6px'
              }}>
                <Image size={16} /> Photo/Video
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                type="submit"
                className="btn-primary"
                disabled={uploading || (!content.trim() && !mediaFile)}
                style={{ padding: '7px 20px', opacity: uploading ? 0.6 : 1 }}
              >
                {uploading ? 'Posting…' : 'Post'}
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