import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Rss, MessageSquare, User } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <div className="card" style={{ padding: '32px', marginBottom: '16px', textAlign: 'center' }}>
        <div className="avatar" style={{
          width: '72px', height: '72px', fontSize: '28px',
          margin: '0 auto 16px'
        }}>
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: '22px' }}>Welcome, @{user?.username}!</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 24px' }}>
          Here's what you can do on ConnectSphere
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/feed" className="btn-primary" style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px'
          }}>
            <Rss size={16} /> Go to Feed
          </Link>
          <Link to="/chat" className="btn-secondary" style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px'
          }}>
            <MessageSquare size={16} /> Messages
          </Link>
          <Link to="/profile" className="btn-secondary" style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px'
          }}>
            <User size={16} /> My Profile
          </Link>
        </div>
      </div>
    </div>
  );
}