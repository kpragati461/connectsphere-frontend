import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { getFollowers, getFollowingList, toggleFollow } from '../api/UserApi';

export default function FollowListModal({ username, type, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchList();
  }, [username, type]);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = type === 'followers'
        ? await getFollowers(username)
        : await getFollowingList(username);
      setList(res.data);
    } catch (err) {
      console.error('Follow list fetch failed:', err.response?.status, err.response?.data);
      setError(`Failed to load (${err.response?.status || 'network error'})`);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async (targetUsername) => {
    setPending(targetUsername);
    try {
      await toggleFollow(targetUsername);
      setList((prev) =>
        prev.map((u) =>
          u.username === targetUsername
            ? { ...u, followedByCurrentUser: !u.followedByCurrentUser }
            : u
        )
      );
    } catch (err) {
      console.error('Toggle follow failed:', err.response?.status, err.response?.data);
    } finally {
      setPending(null);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '360px', maxHeight: '460px', background: 'var(--bg-card)',
          borderRadius: '14px', border: '1px solid var(--border)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}
      >
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)' }}>
            {type === 'followers' ? 'Followers' : 'Following'}
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
          }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '8px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading…
            </div>
          ) : error ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444', fontSize: '13px' }}>
              {error}
            </div>
          ) : list.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {type === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
            </div>
          ) : (
            list.map((u) => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px', borderRadius: '10px'
              }}>
                <div
                  onClick={() => { onClose(); navigate(`/profile/${u.username}`); }}
                  className="avatar"
                  style={{ width: '36px', height: '36px', fontSize: '14px', cursor: 'pointer', flexShrink: 0 }}
                >
                  {u.username?.charAt(0).toUpperCase()}
                </div>
                <div
                  onClick={() => { onClose(); navigate(`/profile/${u.username}`); }}
                  style={{ flex: 1, cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}
                >
                  @{u.username}
                </div>
                <button
                  onClick={() => handleToggleFollow(u.username)}
                  disabled={pending === u.username}
                  style={{
                    fontSize: '12px', padding: '5px 12px', borderRadius: '8px',
                    border: u.followedByCurrentUser ? '1px solid var(--border)' : 'none',
                    background: u.followedByCurrentUser ? 'transparent' : 'var(--accent)',
                    color: u.followedByCurrentUser ? 'var(--text-primary)' : 'var(--bg-card)',
                    cursor: pending === u.username ? 'default' : 'pointer',
                    opacity: pending === u.username ? 0.6 : 1
                  }}
                >
                  {u.followedByCurrentUser ? 'Following' : 'Follow'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}