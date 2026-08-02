import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data.token, res.data.username, res.data.role);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.15s'
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #fdf4ff 100%)'
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white'
      }}>
        <div style={{
          width: '52px', height: '52px', background: 'rgba(255,255,255,0.2)',
          borderRadius: '14px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '26px', fontWeight: '800',
          marginBottom: '32px'
        }}>C</div>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
          Join ConnectSphere today
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.85, lineHeight: '1.6', maxWidth: '380px' }}>
          Create your account and start connecting with people who share your interests.
        </p>

        <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { icon: '✍️', text: 'Share posts and ideas with your network' },
            { icon: '💬', text: 'Chat in real time with anyone' },
            { icon: '🚀', text: 'Build your personal profile and following' },
          ].map((item) => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px', opacity: 0.9 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: '480px', flexShrink: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px', background: 'white'
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '8px' }}>Create account</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366f1', fontWeight: '500' }}>
              Sign in
            </Link>
          </p>

          {error && (
            <div style={{
              padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>
                Username
              </label>
              <input
                name="username" value={form.username} onChange={handleChange}
                placeholder="Choose a username" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>
                Email
              </label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="Enter your email" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <input
                name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="Min. 6 characters" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '11px',
                background: loading ? '#a5b4fc' : '#6366f1',
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '15px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}