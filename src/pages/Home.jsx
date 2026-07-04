import { useNavigate } from 'react-router-dom';
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
      <h2>Welcome, {user?.username}!</h2>
      <p>Your feed will appear here.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}