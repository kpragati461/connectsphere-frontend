import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFeed, createPost, deletePost, toggleLike, getComments, addComment } from '../api/postApi';
import { useNavigate } from 'react-router-dom';

function PostCard({ post, currentUser, onDelete, onLike }) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(post.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const navigate = useNavigate();

  const handleLike = async () => {
    try {
      const res = await toggleLike(post.id);
      setLiked(res.data.liked);
      setLikeCount((prev) => res.data.liked ? prev + 1 : prev - 1);
    } catch {
      console.error('Like failed');
    }
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
      setCommentCount((prev) => prev + 1);
      setNewComment('');
    } catch {
      console.error('Comment failed');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div style={{
      background: 'white', border: '1px solid #e5e7eb',
      borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
    }}>
      {/* Header */}
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
            <div
                 onClick={() => navigate(`/profile/${post.username}`)}
                 style={{ fontWeight: '500', fontSize: '14px', cursor: 'pointer', color: '#6366f1' }}>@{post.username}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(post.createdAt)}</div>
          </div>
        </div>
        {post.username === currentUser && (
          <button onClick={() => onDelete(post.id)} style={{
            background: 'none', border: 'none', color: '#ef4444',
            cursor: 'pointer', fontSize: '13px'
          }}>Delete</button>
        )}
      </div>

      {/* Content */}
      <p style={{ margin: '0 0 12px', fontSize: '15px', lineHeight: '1.6' }}>
        {post.content}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
        <button onClick={handleLike} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: liked ? '#ef4444' : '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          {liked ? '❤️' : '🤍'} {likeCount}
        </button>
        <button onClick={handleShowComments} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          💬 {commentCount}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{ marginTop: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
          {comments.map((c) => (
            <div key={c.id} style={{
              display: 'flex', gap: '8px', marginBottom: '8px'
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#818cf8', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white', fontSize: '12px', flexShrink: 0
              }}>
                {c.username?.charAt(0).toUpperCase()}
              </div>
              <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '6px 10px', flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '500' }}>@{c.username}</div>
                <div style={{ fontSize: '13px' }}>{c.content}</div>
              </div>
            </div>
          ))}

          {/* Add comment */}
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              style={{
                flex: 1, padding: '6px 10px', borderRadius: '20px',
                border: '1px solid #d1d5db', fontSize: '13px'
              }}
            />
            <button type="submit" style={{
              padding: '6px 14px', background: '#6366f1',
              color: 'white', border: 'none', borderRadius: '20px',
              cursor: 'pointer', fontSize: '13px'
            }}>Send</button>
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

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '1rem' }}>

      {/* Create post */}
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
            }}>Post</button>
          </div>
        </form>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p style={{ textAlign: 'center' }}>Loading feed...</p>}

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={user?.username}
          onDelete={handleDelete}
        />
      ))}

      {!loading && posts.length === 0 && (
        <p style={{ textAlign: 'center', color: '#9ca3af' }}>No posts yet. Be the first to post!</p>
      )}
    </div>
  );
}