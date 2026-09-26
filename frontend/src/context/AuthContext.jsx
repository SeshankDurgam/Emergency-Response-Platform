/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    if (data.mfaRequired) {
      return data;
    }
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    const userData = {
      id: data.userId,
      role: data.role,
      mfaRequired: false,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    localStorage.clear();
    setUser(null);
  }, []);

  const completeMfa = useCallback((data) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    const userData = { id: data.userId, role: data.role, mfaRequired: false };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, completeMfa }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
