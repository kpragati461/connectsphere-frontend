import { createContext, useContext, useState, useEffect } from 'react';
import { getMyProfile } from '../api/UserApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    return token ? { token, username, role, profilePhoto: null } : null;
  });

  // On mount (or after login), pull the full profile so profilePhoto
  // (and any other fields not stored in localStorage) is available
  // app-wide via useAuth().
  const refreshUser = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await getMyProfile();
      setUser((prev) => ({
        ...prev,
        profilePhoto: res.data.profilePhoto || null,
        bio: res.data.bio || '',
      }));
    } catch {
      // token might be invalid/expired; leave user state as-is,
      // route guards elsewhere will handle redirecting to login
    }
  };

  useEffect(() => {
    if (user) refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (token, username, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    setUser({ token, username, role, profilePhoto: null });
    // fetch profilePhoto right after login too
    setTimeout(refreshUser, 0);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);