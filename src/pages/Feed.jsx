import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getFeed, createPost, deletePost, toggleLike, getComments, addComment } from '../api/postApi';
import { Heart, MessageCircle, Trash2, Send, Image } from 'lucide-react';

function PostCard({ post, currentUser, onDelete }) {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(post.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  const handleLike = async () => {
    try {
      const res = await toggleLike(post.id);
      setLiked(res.data.liked);
      setLikeCount(prev => res.data.liked ? prev + 1 : prev - 1);
    } catch {}
  };

  const handleShowComments = async () => {
    if (!showComments) {
      const res = await getComments(post.id);
      setComments(res.data);
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await addComment(post.id, { content: newComment });
      setComments([...comments, res.data]);
      setCommentCount(prev => prev + 1);
      setNewComment('');
    } catch {}
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className="card" style={{ marginBottom: '12px', overflow: 'hidden' }}>
      {/* Post header */}
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          onClick={() => navigate(`/profile/${post.username}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div className="avatar" style={{
            width: '42px', height: '42px', fontSize: '16px',
            background: `hsl(${post.username?.charCodeAt(0) * 10}, 65%, 55%)`
          }}>
            {post.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
              @{post.username}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{timeAgo(post.createdAt)} ago</div>
          </div>
        </div>
        {post.username === currentUser && (
          <button onClick={() => onDelete(post.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#d1d5db', padding: '4px', borderRadius: '6px',
            display: 'flex', alignItems: 'center'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Post content */}
      <div style={{ padding: '0 16px 14px', fontSize: '15px', color: '#111827', lineHeight: '1.6' }}>
        {post.content}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #f3f4f6', margin: '0 16px' }} />

      {/* Actions */}
      <div style={{ padding: '8px 8px', display: 'flex', gap: '4px' }}>
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 12px', borderRadius: '8px', border: 'none',
          background: 'none', cursor: 'pointer', fontSize: '13px',
          color: liked ? '#ef4444' : '#6b7280', fontWeight: liked ? '600' : '400',
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Heart size={17} fill={liked ? '#ef4444' : 'none'} />
          <span>{likeCount}</span>
        </button>

        <button onClick={handleShowComments} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 12px', borderRadius: '8px', border: 'none',
          background: showComments ? '#eef2ff' : 'none', cursor: 'pointer',
          fontSize: '13px', color: showComments ? '#6366f1' : '#6b7280',
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => { if (!showComments) e.currentTarget.style.background = '#f5f3ff'; }}
        onMouseLeave={e => { if (!showComments) e.currentTarget.style.background = 'none'; }}
        >
          <MessageCircle size={17} />
          <span>{commentCount}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 16px', background: '#fafafa' }}>
          {comments.map((c) => (
            <div key={c.id} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <div className="avatar" style={{
                width: '28px', height: '28px', fontSize: '11px', flexShrink: 0,
                background: `hsl(${c.username?.charCodeAt(0) * 10}, 65%, 55%)`
              }}>
                {c.username?.charAt(0).toUpperCase()}
              </div>
              <div style={{
                background: 'white', borderRadius: '10px', padding: '8px 12px',
                flex: 1, border: '1px solid #f3f4f6'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '2px' }}>@{c.username}</div>
                <div style={{ fontSize: '13px', color: '#374151' }}>{c.content}</div>
              </div>
            </div>
          ))}

          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '20px',
                border: '1px solid #e5e7eb', fontSize: '13px',
                outline: 'none', background: 'white'
              }}
            />
            <button type="submit" style={{
              background: '#6366f1', border: 'none', borderRadius: '50%',
              width: '34px', height: '34px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              color: 'white', flexShrink: 0
            }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

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