import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '600px', margin: '80px auto', padding: '2rem' }}>
      <h2>Welcome, {user?.username}!</h2>
      <p>Click Feed to see posts or create your first post!</p>
      <Link to="/feed" style={{
        padding: '10px 20px', background: '#6366f1',
        color: 'white', borderRadius: '8px', textDecoration: 'none'
      }}>
        Go to Feed
      </Link>
    </div>
  );
}