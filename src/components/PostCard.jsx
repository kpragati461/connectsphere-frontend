import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toggleLike, toggleBookmark, getComments, addComment, deleteComment } from '../api/postApi';
import { Heart, MessageCircle, Trash2, Send, Bookmark, Share2 } from 'lucide-react';
import ShareModal from './ShareModal';

const isVideoUrl = (url) => {
  if (!url) return false;
  return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url) || url.includes('/video/upload/');
};

export default function PostCard({ post, currentUser, onDelete }) {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(post.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [bookmarked, setBookmarked] = useState(post.bookmarkedByCurrentUser);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLike = async () => {
    try {
      const res = await toggleLike(post.id);
      setLiked(res.data.liked);
      setLikeCount(prev => res.data.liked ? prev + 1 : prev - 1);
    } catch {}
  };

  const handleBookmark = async () => {
    try {
      const res = await toggleBookmark(post.id);
      setBookmarked(res.data.saved);
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

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      setCommentCount(prev => prev - 1);
    } catch {
      console.error('Failed to delete comment');
    }
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
  width: '42px', height: '42px', fontSize: '16px', overflow: 'hidden',
  background: post.profilePhoto ? 'transparent' : `hsl(${post.username?.charCodeAt(0) * 10}, 65%, 55%)`
}}>
  {post.profilePhoto ? (
    <img src={post.profilePhoto} alt={post.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  ) : (
    post.username?.charAt(0).toUpperCase()
  )}
</div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>
              @{post.username}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{timeAgo(post.createdAt)} ago</div>
          </div>
        </div>
        {onDelete && post.username === currentUser && (
          <button onClick={() => onDelete(post.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--border)', padding: '4px', borderRadius: '6px',
            display: 'flex', alignItems: 'center'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--border)'}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Post content */}
      {post.content && (
        <div style={{ padding: '0 16px 14px', fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
          {post.content}
        </div>
      )}

      {/* Post media */}
      {post.mediaUrl && (
        <div style={{ padding: post.content ? '0 0 14px' : '0' }}>
          {isVideoUrl(post.mediaUrl) ? (
            <video
              src={post.mediaUrl}
              controls
              style={{ width: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block', background: '#000' }}
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt="post media"
              style={{ width: '100%', maxHeight: '480px', objectFit: 'contain', display: 'block', background: 'var(--bg-secondary)' }}
            />
          )}
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border-light)', margin: '0 16px' }} />

      {/* Actions */}
      <div style={{ padding: '8px 8px', display: 'flex', gap: '4px' }}>
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 12px', borderRadius: '8px', border: 'none',
          background: 'none', cursor: 'pointer', fontSize: '13px',
          color: liked ? 'var(--danger)' : 'var(--text-muted)', fontWeight: liked ? '600' : '400',
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Heart size={17} fill={liked ? 'var(--danger)' : 'none'} />
          <span>{likeCount}</span>
        </button>

        <button onClick={handleShowComments} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 12px', borderRadius: '8px', border: 'none',
          background: showComments ? 'var(--accent-light)' : 'none', cursor: 'pointer',
          fontSize: '13px', color: showComments ? 'var(--accent)' : 'var(--text-muted)',
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => { if (!showComments) e.currentTarget.style.background = 'var(--accent-light)'; }}
        onMouseLeave={e => { if (!showComments) e.currentTarget.style.background = 'none'; }}
        >
          <MessageCircle size={17} />
          <span>{commentCount}</span>
        </button>

        <button onClick={handleBookmark} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 12px', borderRadius: '8px', border: 'none',
          background: 'none', cursor: 'pointer', fontSize: '13px',
          color: bookmarked ? '#f59e0b' : 'var(--text-muted)', fontWeight: bookmarked ? '600' : '400',
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Bookmark size={17} fill={bookmarked ? '#f59e0b' : 'none'} />
          <span>Save</span>
        </button>

        <button onClick={() => setShowShareModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 12px', borderRadius: '8px', border: 'none',
          background: 'none', cursor: 'pointer', fontSize: '13px',
          color: 'var(--text-muted)', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Share2 size={17} />
          <span>Share</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ borderTop: '1px solid var(--border-light)', padding: '12px 16px', background: 'var(--bg-secondary)' }}>
          {comments.map((c) => (
            <div key={c.id} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <div className="avatar" style={{
  width: '28px', height: '28px', fontSize: '11px', flexShrink: 0,
  background: `hsl(${c.username?.charCodeAt(0) * 10}, 65%, 55%)`
}}>
  {c.username?.charAt(0).toUpperCase()}
</div>
              <div style={{
                background: 'var(--bg-card)', borderRadius: '10px', padding: '8px 12px',
                flex: 1, border: '1px solid var(--border-light)'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600' }}>@{c.username}</div>
                  {c.username === currentUser && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--border)', padding: '0 2px', display: 'flex', alignItems: 'center'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--border)'}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.content}</div>
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
                border: '1px solid var(--border)', fontSize: '13px',
                outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)'
              }}
            />
            <button type="submit" style={{
              background: 'var(--accent)', border: 'none', borderRadius: '50%',
              width: '34px', height: '34px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              color: 'white', flexShrink: 0
            }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {showShareModal && (
        <ShareModal post={post} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}