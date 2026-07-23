import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { clearAuthSession, setAuthSession } from '../api/authSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.get('/auth/me');
      setAuthSession({ user: data });
      setUser(data);
    } catch {
      clearAuthSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });

    // For verification or non-auth outcomes, do not create a session.
    if (data.nextStep === 'verify-email' || data.requiresVerification || !data.token || !data.user) {
      return data;
    }

    setAuthSession({ token: data.token, user: data.user });
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password, notificationsEnabled = false) => {
    const { data } = await API.post('/auth/signup', { name, email, password, notificationsEnabled });

    // For verification or non-auth outcomes, do not create a session.
    if (data.nextStep === 'verify-email' || data.requiresVerification || !data.token || !data.user) {
      return data;
    }

    setAuthSession({ token: data.token, user: data.user });
    setUser(data.user);
    return data;
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
