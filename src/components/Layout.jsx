import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getUnreadCount, getNotifications, markAllAsRead } from '../api/NotificationApi';
import { searchUsers } from '../api/UserApi';
import {
  Home, MessageSquare, Bell, User, Shield,
  LogOut, Search, Users, Settings as SettingsIcon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

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
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);
  // Close notifications on route change
  useEffect(() => {
    setShowNotifs(false);
  }, [location.pathname]);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showNotifs && !e.target.closest('.notif-dropdown') && !e.target.closest('.notif-bell')) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifs]);

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
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '10px',
        color: isActive(to) ? 'var(--accent)' : 'var(--text-muted)',
        background: isActive(to) ? 'var(--accent-light)' : 'transparent',
        fontWeight: isActive(to) ? '600' : '400',
        fontSize: '15px',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isActive(to)) e.currentTarget.style.background = 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        if (!isActive(to)) e.currentTarget.style.background = 'transparent';
      }}
    >
      {icon}
      <span>{label}</span>
      {badge > 0 && (
        <span
          style={{
            marginLeft: 'auto',
            background: 'var(--danger)',
            color: 'var(--bg-card)',
            borderRadius: '99px',
            fontSize: '11px',
            fontWeight: '600',
            padding: '1px 7px',
            minWidth: '20px',
            textAlign: 'center',
          }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

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
            width: '36px', height: '36px', background: 'var(--accent)',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--bg-card)', fontWeight: '800', fontSize: '18px'
          }}>C</div>
          <span style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-primary)' }}>
            ConnectSphere
          </span>
        </Link>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{
              position: 'absolute', left: '10px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)'
            }} />
            <input
              value={searchQuery}
              onChange={handleSearch}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              placeholder="Search users..."
              style={{
                width: '100%', padding: '8px 12px 8px 32px',
                borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--bg-hover)', fontSize: '13px', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          {showSearch && searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '40px', left: 0, right: 0,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              zIndex: 300, maxHeight: '250px', overflowY: 'auto'
            }}>
              {searchResults.map((u) => (
                <div key={u.id} onMouseDown={(e) => {
                  // preventDefault stops the input from blurring, which was
                  // racing against (and sometimes winning over) this click —
                  // that's why results looked unclickable.
                  e.preventDefault();
                  navigate(`/profile/${u.username}`);
                  setSearchQuery(''); setShowSearch(false);
                }} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
                >
                  <div className="avatar" style={{ width: '30px', height: '30px', fontSize: '12px' }}>
                    {u.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>@{u.username}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.followerCount} followers</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


         {navItem('/feed', <Home size={20} />, 'Feed')}
         {navItem('/chat', <MessageSquare size={20} />, 'Messages')}
         {navItem('/profile', <User size={20} />, 'Profile')}
         {navItem('/settings', <SettingsIcon size={20} />, 'Settings')}

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={handleBellClick} className="notif-bell" style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 12px', borderRadius: '10px', border: 'none',
            background: showNotifs ? 'var(--accent-light)' : 'transparent',
            color: showNotifs ? 'var(--accent)' : 'var(--text-muted)',
            fontSize: '15px', cursor: 'pointer', transition: 'all 0.15s'
          }}
          onMouseEnter={e => { if (!showNotifs) e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={e => { if (!showNotifs) e.currentTarget.style.background = 'transparent'; }}
          >
            <Bell size={20} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span style={{
                marginLeft: 'auto', background: 'var(--danger)', color: 'var(--bg-card)',
                borderRadius: '99px', fontSize: '11px', fontWeight: '600',
                padding: '1px 7px'
              }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotifs && createPortal(
            <div className="notif-dropdown" style={{
              position: 'fixed', left: '252px', top: '80px',
              width: '340px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 9999,
              maxHeight: '420px', overflowY: 'auto'
            }}>
              <div style={{
  padding: '14px 16px', borderBottom: '1px solid #f3f4f6',
  fontWeight: '600', fontSize: '15px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
}}>
  <span>Notifications</span>
  <button onClick={() => setShowNotifs(false)} style={{
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', fontSize: '18px', lineHeight: '1', padding: '0 4px'
  }}>×</button>
</div>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No notifications yet
                </div>
              ) : notifications.map((n) => (
                <div key={n.id} style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--bg-hover)',
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  background: n.read ? 'var(--bg-card)' : '#fafafe'
                }}>
                  <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '13px', flexShrink: 0 }}>
                    {n.actorUsername?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px' }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {formatTime(n.createdAt)}
                    </div>
                  </div>
                  <span style={{ fontSize: '16px' }}>
                    {n.type === 'LIKE' ? '❤️' : n.type === 'COMMENT' ? '💬' : n.type === 'MESSAGE' ? '✉️' : '👤'}
                  </span>
                </div>
              ))}
            </div>,
            document.body
          )}
        </div>

        {user?.role === 'ADMIN' && navItem('/admin', <Shield size={20} />, 'Admin')}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

      {/* User card at bottom */}
<div style={{
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '10px 12px', borderRadius: '10px',
  border: '1px solid var(--border)',
  background: 'var(--bg-card)', marginTop: '8px'
}}>
  <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '14px', overflow: 'hidden' }}>
  {user?.profilePhoto ? (
    <img src={user.profilePhoto} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  ) : (
    user?.username?.charAt(0).toUpperCase()
  )}
</div>
  <div style={{ flex: 1, minWidth: 0 }}>
    <div style={{
      fontSize: '13px', fontWeight: '600',
      overflow: 'hidden', textOverflow: 'ellipsis',
      whiteSpace: 'nowrap', color: 'var(--text-primary)'
    }}>
      @{user?.username}
    </div>
    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.role}</div>
  </div>
  <button onClick={toggleTheme} style={{
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', padding: '4px'
  }}>
    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
  </button>
  <button onClick={handleLogout} style={{
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', padding: '4px'
  }}>
    <LogOut size={16} />
  </button>
</div>
</aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, maxWidth: '960px', padding: '24px 16px' }}>
        {children}
      </main>
    </div>
  );
}