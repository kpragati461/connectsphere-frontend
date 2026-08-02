import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getUnreadCount, getNotifications, markAllAsRead } from '../api/notificationApi';
import { searchUsers } from '../api/userApi';
import {
  Home, MessageSquare, Bell, User, Shield,
  LogOut, Search, Users
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch {}
  };

  const handleBellClick = async () => {
    if (!showNotifs) {
      try {
        const res = await getNotifications();
        setNotifications(res.data);
        await markAllAsRead();
        setUnreadCount(0);
      } catch {}
    }
    setShowNotifs(!showNotifs);
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
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItem = (to, icon, label, badge) => (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 12px', borderRadius: '10px',
      color: isActive(to) ? '#6366f1' : '#4b5563',
      background: isActive(to) ? '#eef2ff' : 'transparent',
      fontWeight: isActive(to) ? '600' : '400',
      fontSize: '15px', transition: 'all 0.15s',
      position: 'relative'
    }}
    onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.background = '#f9fafb'; }}
    onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.background = 'transparent'; }}
    >
      {icon}
      <span>{label}</span>
      {badge > 0 && (
        <span style={{
          marginLeft: 'auto', background: '#ef4444', color: 'white',
          borderRadius: '99px', fontSize: '11px', fontWeight: '600',
          padding: '1px 7px', minWidth: '20px', textAlign: 'center'
        }}>{badge > 9 ? '9+' : badge}</span>
      )}
    </Link>
  );

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F3F2EF' }}>

      {/* ── Left Sidebar ── */}
      <aside style={{
        width: '240px', flexShrink: 0, position: 'sticky',
        top: 0, height: '100vh', overflowY: 'auto',
        padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px'
      }}>
        {/* Logo */}
        <Link to="/feed" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 12px', marginBottom: '16px'
        }}>
          <div style={{
            width: '36px', height: '36px', background: '#6366f1',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '18px'
          }}>C</div>
          <span style={{ fontWeight: '700', fontSize: '18px', color: '#111827' }}>
            ConnectSphere
          </span>
        </Link>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{
              position: 'absolute', left: '10px', top: '50%',
              transform: 'translateY(-50%)', color: '#9ca3af'
            }} />
            <input
              value={searchQuery}
              onChange={handleSearch}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              placeholder="Search users..."
              style={{
                width: '100%', padding: '8px 12px 8px 32px',
                borderRadius: '8px', border: '1px solid #e5e7eb',
                background: '#f9fafb', fontSize: '13px', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          {showSearch && searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '40px', left: 0, right: 0,
              background: 'white', border: '1px solid #e5e7eb',
              borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              zIndex: 300, maxHeight: '250px', overflowY: 'auto'
            }}>
              {searchResults.map((u) => (
                <div key={u.id} onClick={() => {
                  navigate(`/profile/${u.username}`);
                  setSearchQuery(''); setShowSearch(false);
                }} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <div className="avatar" style={{ width: '30px', height: '30px', fontSize: '12px' }}>
                    {u.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>@{u.username}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{u.followerCount} followers</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nav items */}
        {navItem('/feed', <Home size={20} />, 'Feed')}
        {navItem('/chat', <MessageSquare size={20} />, 'Messages')}
        {navItem('/profile', <User size={20} />, 'Profile')}

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={handleBellClick} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 12px', borderRadius: '10px', border: 'none',
            background: showNotifs ? '#eef2ff' : 'transparent',
            color: showNotifs ? '#6366f1' : '#4b5563',
            fontSize: '15px', cursor: 'pointer', transition: 'all 0.15s'
          }}
          onMouseEnter={e => { if (!showNotifs) e.currentTarget.style.background = '#f9fafb'; }}
          onMouseLeave={e => { if (!showNotifs) e.currentTarget.style.background = 'transparent'; }}
          >
            <Bell size={20} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span style={{
                marginLeft: 'auto', background: '#ef4444', color: 'white',
                borderRadius: '99px', fontSize: '11px', fontWeight: '600',
                padding: '1px 7px'
              }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'fixed', left: '252px', top: '80px',
              width: '340px', background: 'white',
              border: '1px solid #e5e7eb', borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 300,
              maxHeight: '420px', overflowY: 'auto'
            }}>
              <div style={{
                padding: '14px 16px', borderBottom: '1px solid #f3f4f6',
                fontWeight: '600', fontSize: '15px'
              }}>Notifications</div>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                  No notifications yet
                </div>
              ) : notifications.map((n) => (
                <div key={n.id} style={{
                  padding: '12px 16px', borderBottom: '1px solid #f9fafb',
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  background: n.read ? 'white' : '#fafafe'
                }}>
                  <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '13px', flexShrink: 0 }}>
                    {n.actorUsername?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px' }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                      {formatTime(n.createdAt)}
                    </div>
                  </div>
                  <span style={{ fontSize: '16px' }}>
                    {n.type === 'LIKE' ? '❤️' : n.type === 'COMMENT' ? '💬' : n.type === 'MESSAGE' ? '✉️' : '👤'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {user?.role === 'ADMIN' && navItem('/admin', <Shield size={20} />, 'Admin')}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User card at bottom */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px',
          border: '1px solid #e5e7eb', background: 'white', marginTop: '8px'
        }}>
          <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              @{user?.username}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9ca3af', padding: '4px'
          }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, maxWidth: '680px', padding: '24px 16px' }}>
        {children}
      </main>

      {/* ── Right Sidebar ── */}
      <aside style={{
        width: '280px', flexShrink: 0, padding: '24px 16px',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
      }}>
        {/* Profile mini card */}
        <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px' }}>@{user?.username}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>{user?.role}</div>
            </div>
          </div>
          <Link to="/profile" className="btn-primary" style={{
            display: 'block', textAlign: 'center', fontSize: '13px', padding: '7px'
          }}>
            View Profile
          </Link>
        </div>

        {/* Tips card */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '12px', color: '#374151' }}>
            💡 Quick Tips
          </div>
          {[
            'Follow users to see their posts in your feed',
            'Click 💬 on any post to leave a comment',
            'Search users by username to connect',
            'Use the chat to message anyone directly',
          ].map((tip, i) => (
            <div key={i} style={{
              fontSize: '12px', color: '#6b7280', padding: '6px 0',
              borderBottom: i < 3 ? '1px solid #f3f4f6' : 'none',
              lineHeight: '1.5'
            }}>{tip}</div>
          ))}
        </div>
      </aside>
    </div>
  );
}