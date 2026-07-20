import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount, getNotifications, markAllAsRead } from '../api/notificationApi';
import { searchUsers } from '../api/userApi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    // poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch {
      console.error('Failed to fetch unread count');
    }
  };
  const handleSearch = async (e) => {
  const query = e.target.value;
  setSearchQuery(query);
  if (query.trim().length < 2) {
    setSearchResults([]);
    setShowSearch(false);
    return;
  }
  try {
    const res = await searchUsers(query);
    setSearchResults(res.data);
    setShowSearch(true);
  } catch {
    console.error('Search failed');
  }
};

  const handleBellClick = async () => {
    if (!showDropdown) {
      try {
        const res = await getNotifications();
        setNotifications(res.data);
        await markAllAsRead();
        setUnreadCount(0);
      } catch {
        console.error('Failed to load notifications');
      }
    }
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'white', borderBottom: '1px solid #e5e7eb',
      padding: '0 1.5rem', height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      {/* Logo */}
      <Link to="/feed" style={{
        fontWeight: '700', fontSize: '18px',
        color: '#6366f1', textDecoration: 'none'
      }}>
        ConnectSphere
      </Link>
      {/* Search bar */}
<div style={{ position: 'relative', flex: 1, maxWidth: '300px', margin: '0 20px' }}>
  <input
    value={searchQuery}
    onChange={handleSearch}
    onBlur={() => setTimeout(() => setShowSearch(false), 200)}
    placeholder="Search users..."
    style={{
      width: '100%', padding: '6px 12px', borderRadius: '20px',
      border: '1px solid #d1d5db', fontSize: '13px',
      outline: 'none', boxSizing: 'border-box'
    }}
  />
  {showSearch && searchResults.length > 0 && (
    <div style={{
      position: 'absolute', top: '36px', left: 0,
      width: '100%', background: 'white',
      border: '1px solid #e5e7eb', borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      zIndex: 200, maxHeight: '300px', overflowY: 'auto'
    }}>
      {searchResults.map((u) => (
        <div
          key={u.id}
          onClick={() => {
            navigate(`/profile/${u.username}`);
            setSearchQuery('');
            setShowSearch(false);
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', cursor: 'pointer',
            borderBottom: '1px solid #f9fafb'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#6366f1', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white',
            fontSize: '13px', fontWeight: 'bold', flexShrink: 0
          }}>
            {u.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>@{u.username}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
              {u.followerCount} followers
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/feed" style={{ color: '#374151', textDecoration: 'none', fontSize: '14px' }}>Feed</Link>
        <Link to="/chat" style={{ color: '#374151', textDecoration: 'none', fontSize: '14px' }}>Chat</Link>
        <Link to="/profile" style={{ color: '#374151', textDecoration: 'none', fontSize: '14px' }}>Profile</Link>
        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button onClick={handleBellClick} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '20px', position: 'relative', padding: '4px'
          }}>
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '0', right: '0',
                background: '#ef4444', color: 'white',
                borderRadius: '50%', fontSize: '10px', fontWeight: 'bold',
                width: '16px', height: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div style={{
              position: 'absolute', right: 0, top: '40px',
              width: '320px', background: 'white',
              border: '1px solid #e5e7eb', borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 200,
              maxHeight: '400px', overflowY: 'auto'
            }}>
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
                fontWeight: '600', fontSize: '14px'
              }}>
                Notifications
              </div>

              {notifications.length === 0 ? (
                <div style={{
                  padding: '24px', textAlign: 'center',
                  color: '#9ca3af', fontSize: '13px'
                }}>
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f9fafb',
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    background: n.read ? 'white' : '#f5f3ff'
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: '#6366f1', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'white',
                      fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                    }}>
                      {n.actorUsername?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', color: '#111827' }}>{n.message}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        {formatTime(n.createdAt)}
                      </div>
                    </div>
                    <div style={{ fontSize: '16px' }}>
                      {n.type === 'LIKE' ? '❤️' : n.type === 'COMMENT' ? '💬' : '👤'}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User + logout */}
        <Link to="/profile" style={{
          fontSize: '13px', color: '#374151', textDecoration: 'none', fontWeight: '500'
        }}>
          @{user?.username}
        </Link>
        <button onClick={handleLogout} style={{
          padding: '6px 14px', background: '#f3f4f6',
          border: '1px solid #d1d5db', borderRadius: '8px',
          cursor: 'pointer', fontSize: '13px'
        }}>
          Logout
        </button>
      </div>
    </nav>
  );
}