import { useEffect, useState } from 'react';
import { getBlockedUsers, toggleBlock } from '../api/UserApi';

export default function BlockedUsers() {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);

  useEffect(() => {
    fetchBlocked();
  }, []);

  const fetchBlocked = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBlockedUsers();
      setBlocked(res.data);
    } catch (err) {
      setError('Failed to load blocked users');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (username) => {
    setPendingUser(username);
    try {
      await toggleBlock(username);
      setBlocked((prev) => prev.filter((u) => u !== username));
    } catch (err) {
      setError('Failed to unblock user');
    } finally {
      setPendingUser(null);
    }
  };

  if (loading) return <div style={{ padding: '24px', color: 'var(--text-muted)' }}>Loading…</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '480px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
        Blocked Users
      </h2>

      {error && (
        <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '13px' }}>{error}</div>
      )}

      {blocked.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>You haven't blocked anyone.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {blocked.map((username) => (
            <div key={username} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: '10px',
              border: '1px solid var(--border)', background: 'var(--bg-card)'
            }}>
              <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>@{username}</span>
              <button
                onClick={() => handleUnblock(username)}
                disabled={pendingUser === username}
                style={{
                  fontSize: '13px', padding: '6px 14px', borderRadius: '8px',
                  border: 'none', background: 'var(--accent)', color: 'var(--bg-card)',
                  cursor: pendingUser === username ? 'default' : 'pointer',
                  opacity: pendingUser === username ? 0.6 : 1
                }}
              >
                {pendingUser === username ? 'Unblocking…' : 'Unblock'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}