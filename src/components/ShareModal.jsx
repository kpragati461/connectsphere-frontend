import { useState, useEffect, useRef } from 'react';
import { getFollowing, searchUsers } from '../api/UserApi';
import { startConversation, sharePostToConversation } from '../api/chatApi';
import { X, Search, Check, Link2 } from 'lucide-react';

export default function ShareModal({ post, onClose }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState(new Set());
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const searchTimeout = useRef(null);

  useEffect(() => {
    loadFollowing();
    return () => clearTimeout(searchTimeout.current);
  }, []);

  const loadFollowing = async () => {
    setLoading(true);
    try {
      const res = await getFollowing();
      setPeople(res.data);
    } catch {
      setError('Failed to load people to share with');
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      if (!value.trim()) {
        loadFollowing();
        return;
      }
      try {
        const res = await searchUsers(value.trim());
        setPeople(res.data);
      } catch {}
    }, 300);
  };

  const toggleSelect = (username) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  };

  const handleSend = async () => {
    if (selected.size === 0 || sending) return;
    setSending(true);
    setError('');

    const results = await Promise.allSettled(
      Array.from(selected).map(async (username) => {
        const convRes = await startConversation(username);
        await sharePostToConversation(convRes.data.conversationId, post.id);
        return username;
      })
    );

    const succeeded = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
    const failedCount = results.length - succeeded.length;

    setSentTo(new Set(succeeded));
    setSelected(new Set());
    setSending(false);

    if (failedCount > 0) {
      setError(`Sent to ${succeeded.length}, but ${failedCount} failed. Try again?`);
    } else {
      setTimeout(onClose, 900);
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/profile/${post.username}`;
    const shareText = post.content ? `"${post.content}" — @${post.username}` : `Post by @${post.username}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopyStatus('Link copied!');
        setTimeout(() => setCopyStatus(''), 2000);
      } else if (navigator.share) {
        await navigator.share({ title: 'ConnectSphere post', text: shareText, url: shareUrl });
      } else {
        setCopyStatus('Copying not supported on this browser');
      }
    } catch (err) {
      if (err?.name !== 'AbortError') setCopyStatus('Could not copy link');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: '16px', width: '100%', maxWidth: '380px',
          maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px', borderBottom: '1px solid var(--border-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Share post</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-hover)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '8px 12px'
          }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="Search people..."
              style={{ border: 'none', outline: 'none', background: 'none', fontSize: '13px', flex: 1, color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* People list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px', minHeight: '160px' }}>
          {loading && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading...
            </div>
          )}

          {!loading && people.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {query ? 'No users found' : "You're not following anyone yet — try searching"}
            </div>
          )}

          {!loading && people.map(person => {
            const isSelected = selected.has(person.username);
            const isSent = sentTo.has(person.username);
            return (
              <div
                key={person.username}
                onClick={() => !isSent && !sending && toggleSelect(person.username)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 8px', borderRadius: '10px',
                  cursor: isSent ? 'default' : 'pointer',
                  opacity: isSent ? 0.6 : 1,
                  background: isSelected ? 'var(--accent-light)' : 'transparent'
                }}
              >
                <div className="avatar" style={{
                  width: '38px', height: '38px', fontSize: '14px', flexShrink: 0,
                  background: `hsl(${person.username?.charCodeAt(0) * 10}, 65%, 55%)`
                }}>
                  {person.username?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>
                    @{person.username}
                  </div>
                  {isSent && (
                    <div style={{ fontSize: '11px', color: 'var(--success)' }}>Sent</div>
                  )}
                </div>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  border: (isSelected || isSent) ? 'none' : '1.5px solid var(--border)',
                  background: (isSelected || isSent) ? 'var(--accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {(isSelected || isSent) && <Check size={13} color="white" />}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{ padding: '4px 16px 0', color: 'var(--danger)', fontSize: '12px' }}>{error}</div>
        )}

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-light)' }}>
          <button
            onClick={handleSend}
            disabled={selected.size === 0 || sending}
            style={{
              width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
              background: selected.size === 0 || sending ? 'var(--bg-hover)' : 'var(--accent)',
              color: selected.size === 0 || sending ? 'var(--text-muted)' : 'white',
              fontWeight: '600', fontSize: '14px',
              cursor: selected.size === 0 || sending ? 'default' : 'pointer'
            }}
          >
            {sending ? 'Sending...' : selected.size > 0 ? `Send to ${selected.size}` : 'Send'}
          </button>

          <button
            onClick={handleCopyLink}
            style={{
              width: '100%', marginTop: '8px', padding: '9px', borderRadius: '10px',
              border: 'none', background: 'none', color: 'var(--accent)',
              fontWeight: '500', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <Link2 size={14} /> {copyStatus || 'Copy link instead'}
          </button>
        </div>
      </div>
    </div>
  );
}
