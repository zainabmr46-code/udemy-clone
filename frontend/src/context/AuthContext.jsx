import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const applyAuth = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const signup = async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    applyAuth(data);
    toast.success(`Welcome, ${data.user.name}!`);
    return data.user;
  };

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    applyAuth(data);
    toast.success(`Welcome back, ${data.user.name}!`);
    return data.user;
  };

  const googleLogin = async (idToken) => {
    const { data } = await api.post('/auth/google', { idToken });
    applyAuth(data);
    toast.success(`Welcome, ${data.user.name}!`);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out');
  };

  const updateUser = (partial) => setUser((prev) => ({ ...prev, ...partial }));

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, googleLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
