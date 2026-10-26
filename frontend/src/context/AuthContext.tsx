import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/index.js';
import { api, getAuthToken, clearAuthToken } from '../api/client.js';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, currency?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>({
    id: '64b8f0f1c2a4d5e6f7a8b9c0',
    name: 'Gokul',
    email: 'gokul@moneyos.local',
    currency: 'INR',
    levelTitle: 'Level 2 Money Smart',
  });
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState(false);

  const initAuth = async () => {
    try {
      const stored = getAuthToken();
      if (stored) {
        setToken(stored);
        const me = await api.getMe();
        if (me) setUser(me);
      } else {
        // Auto demo login
        try {
          const res = await api.login('gokul@moneyos.local', 'password123');
          setToken(res.token);
          setUser(res.user);
        } catch (e) {
          // If server is not reachable yet, use Gokul's local demo state
          console.log('[Auth] Operating in demo fallback state');
        }
      }
    } catch (err) {
      console.warn('Auth init warning', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, pass);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, currency?: string) => {
    setLoading(true);
    try {
      const res = await api.register(name, email, pass, currency);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const me = await api.getMe();
      if (me) setUser(me);
    } catch (e) {
      console.warn('Refresh user error', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
