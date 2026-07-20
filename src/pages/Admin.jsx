import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getStats, getAllUsers, banUser, unbanUser } from '../api/adminApi';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // redirect non-admins
    if (user && user.role !== 'ADMIN') {
      navigate('/feed');
      return;
    }
    loadStats();
    loadUsers();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getStats();
      setStats(res.data);
    } catch {
      setError('Failed to load stats');
    }
  };

  const loadUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch {
      setError('Failed to load users');
    }
  };

  const handleBan = async (userId, isBanned) => {
    try {
      if (isBanned) {
        await unbanUser(userId);
        setMessage('User unbanned successfully');
      } else {
        await banUser(userId);
        setMessage('User banned successfully');
      }
      setTimeout(() => setMessage(''), 3000);
      loadUsers();
    } catch {
      setError('Failed to update user');
    }
  };

  const tabStyle = (tab) => ({
    padding: '8px 20px',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontWeight: activeTab === tab ? '600' : '400',
    color: activeTab === tab ? '#6366f1' : '#6b7280',
    fontSize: '14px'
  });

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '1rem' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <div style={{
          width: '40px', height: '40px', background: '#6366f1',
          borderRadius: '10px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '20px'
        }}>🛡️</div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Admin Dashboard</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
            Manage users and content
          </p>
        </div>
      </div>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      {message && <p style={{ color: 'green', marginBottom: '1rem' }}>{message}</p>}

      {/* Stats cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
            { label: 'Total Posts', value: stats.totalPosts, icon: '📝' },
            { label: 'Total Comments', value: stats.totalComments, icon: '💬' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'white', border: '1px solid #e5e7eb',
              borderRadius: '12px', padding: '1.2rem',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <div style={{ fontSize: '28px' }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        background: 'white', border: '1px solid #e5e7eb',
        borderRadius: '12px', overflow: 'hidden'
      }}>
        <div style={{ borderBottom: '1px solid #e5e7eb', display: 'flex' }}>
          <button style={tabStyle('stats')} onClick={() => setActiveTab('stats')}>
            Overview
          </button>
          <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>
            Users ({users.length})
          </button>
        </div>

        {/* Overview tab */}
        {activeTab === 'stats' && (
          <div style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem' }}>Platform Overview</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {stats && Object.entries(stats).map(([key, value]) => (
                <div key={key} style={{
                  padding: '12px 16px', background: '#f9fafb',
                  borderRadius: '8px', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '13px', color: '#6b7280', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span style={{ fontWeight: '600', fontSize: '16px' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users tab */}
        {activeTab === 'users' && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['ID', 'Username', 'Email', 'Role', 'Followers', 'Status', 'Action'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: '12px', color: '#6b7280',
                      fontWeight: '600', borderBottom: '1px solid #e5e7eb'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{
                    background: i % 2 === 0 ? 'white' : '#fafafa'
                  }}>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: '#9ca3af' }}>{u.id}</td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: '500' }}>
                      @{u.username}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: '#6b7280' }}>{u.email}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
                        background: u.role === 'ADMIN' ? '#e0e7ff' : '#f3f4f6',
                        color: u.role === 'ADMIN' ? '#4338ca' : '#374151',
                        fontWeight: '500'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '13px' }}>{u.followerCount}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
                        background: u.banned ? '#fee2e2' : '#dcfce7',
                        color: u.banned ? '#991b1b' : '#166534',
                        fontWeight: '500'
                      }}>
                        {u.banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      {u.username !== user?.username && u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleBan(u.id, u.banned)}
                          style={{
                            padding: '4px 12px', fontSize: '12px',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            background: u.banned ? '#dcfce7' : '#fee2e2',
                            color: u.banned ? '#166534' : '#991b1b',
                            fontWeight: '500'
                          }}>
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