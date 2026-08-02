import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getStats, getAllUsers, banUser, unbanUser } from '../api/adminApi';
import { Users, FileText, MessageSquare, Shield, Ban, CheckCircle } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'ADMIN') { navigate('/feed'); return; }
    loadStats();
    loadUsers();
  }, []);

  const loadStats = async () => {
    try { const res = await getStats(); setStats(res.data); } catch {}
  };

  const loadUsers = async () => {
    try { const res = await getAllUsers(); setUsers(res.data); } catch {}
  };

  const handleBan = async (userId, isBanned) => {
    try {
      if (isBanned) { await unbanUser(userId); setMessage('User unbanned'); }
      else { await banUser(userId); setMessage('User banned'); }
      setTimeout(() => setMessage(''), 3000);
      loadUsers();
    } catch { setError('Failed to update user'); }
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: <Users size={22} />, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Total Posts', value: stats.totalPosts, icon: <FileText size={22} />, color: '#0891b2', bg: '#e0f7fa' },
    { label: 'Total Comments', value: stats.totalComments, icon: <MessageSquare size={22} />, color: '#10b981', bg: '#d1fae5' },
  ] : [];

  const tabStyle = (tab) => ({
    padding: '8px 18px', border: 'none', cursor: 'pointer',
    fontSize: '14px', fontWeight: activeTab === tab ? '600' : '400',
    color: activeTab === tab ? '#6366f1' : '#6b7280',
    borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
    background: 'none', transition: 'all 0.15s'
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          width: '44px', height: '44px', background: '#eef2ff',
          borderRadius: '12px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#6366f1'
        }}>
          <Shield size={22} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Admin Dashboard</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Manage users and platform content</p>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '10px 14px', background: '#d1fae5', border: '1px solid #6ee7b7',
          borderRadius: '8px', color: '#065f46', fontSize: '13px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <CheckCircle size={14} /> {message}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {statCards.map(stat => (
          <div key={stat.label} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: stat.bg, color: stat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: '700', lineHeight: '1' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', padding: '0 8px' }}>
          <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>Overview</button>
          <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>
            Users ({users.length})
          </button>
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '15px', color: '#374151' }}>Platform Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {stats && Object.entries(stats).map(([key, value]) => (
                <div key={key} style={{
                  padding: '14px 16px', background: '#f9fafb',
                  borderRadius: '10px', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                  border: '1px solid #f3f4f6'
                }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span style={{ fontWeight: '700', fontSize: '18px', color: '#111827' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users table */}
        {activeTab === 'users' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['User', 'Email', 'Role', 'Followers', 'Status', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '11px 16px', textAlign: 'left',
                      fontSize: '12px', color: '#6b7280', fontWeight: '600',
                      borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f9fafb' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar" style={{
                          width: '32px', height: '32px', fontSize: '12px',
                          background: `hsl(${u.username?.charCodeAt(0) * 10}, 65%, 55%)`
                        }}>
                          {u.username?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>@{u.username}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px', padding: '3px 10px', borderRadius: '99px', fontWeight: '600',
                        background: u.role === 'ADMIN' ? '#eef2ff' : '#f3f4f6',
                        color: u.role === 'ADMIN' ? '#6366f1' : '#374151'
                      }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{u.followerCount}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px', padding: '3px 10px', borderRadius: '99px', fontWeight: '600',
                        background: u.banned ? '#fef2f2' : '#f0fdf4',
                        color: u.banned ? '#dc2626' : '#16a34a'
                      }}>{u.banned ? 'Banned' : 'Active'}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.username !== user?.username && u.role !== 'ADMIN' && (
                        <button onClick={() => handleBan(u.id, u.banned)} style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          padding: '5px 12px', fontSize: '12px', fontWeight: '500',
                          border: 'none', borderRadius: '6px', cursor: 'pointer',
                          background: u.banned ? '#f0fdf4' : '#fef2f2',
                          color: u.banned ? '#16a34a' : '#dc2626'
                        }}>
                          <Ban size={12} />
                          {u.banned ? 'Unban' : 'Ban'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}