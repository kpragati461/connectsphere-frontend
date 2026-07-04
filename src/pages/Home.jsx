import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '80px auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome, {user?.username}!</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/profile">My Profile</Link>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <p>Your feed will appear here.</p>
    </div>
  );
}