import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User } from '@app/shared';
import * as authApi from '../api/auth';
import { setTokens, clearTokens, getAccessToken, setOnAuthFailure } from '../api/client';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  useEffect(() => {
    setOnAuthFailure(logout);
  }, [logout]);

  useEffect(() => {
    if (getAccessToken()) {
      authApi.getMe()
        .then(setUser)
        .catch(() => clearTokens())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await authApi.login(username, password);
    setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    await authApi.register(username, password);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
