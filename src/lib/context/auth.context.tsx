'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '@/lib/services/auth.service';
import type { User } from '@/lib/types/api.types';

const ACCESS_TOKEN_KEY = 'kerabie_access_token';
const REFRESH_TOKEN_KEY = 'kerabie_refresh_token';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (username: string, password: string, full_name?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistTokens = (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    setToken(access);
  };

  const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!stored) return;
    const res = await authService.me(stored);
    if (res.status === true) {
      setUser(res.response as User);
      setToken(stored);
    } else {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        const refreshRes = await authService.refreshToken(refreshToken);
        if (refreshRes.status === true) {
          const newAccess = (refreshRes.response as { access_token: string }).access_token;
          localStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
          setToken(newAccess);
          const meRes = await authService.me(newAccess);
          if (meRes.status === true) {
            setUser(meRes.response as User);
          } else {
            clearTokens();
          }
        } else {
          clearTokens();
        }
      } else {
        clearTokens();
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshUser();
      setIsLoading(false);
    })();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    if (res.status === true) {
      const { access_token, refresh_token, user: u } = res.response as {
        access_token: string;
        refresh_token: string;
        user: User;
      };
      persistTokens(access_token, refresh_token);
      setUser(u);
      return { ok: true };
    }
    return { ok: false, error: res.response as string };
  };

  const register = async (username: string, password: string, full_name?: string) => {
    const res = await authService.register({ username, password, full_name });
    if (res.status === true) {
      const { access_token, refresh_token, user: u } = res.response as {
        access_token: string;
        refresh_token: string;
        user: User;
      };
      persistTokens(access_token, refresh_token);
      setUser(u);
      return { ok: true };
    }
    return { ok: false, error: res.response as string };
  };

  const logout = async () => {
    if (token) await authService.logout(token);
    clearTokens();
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated: !!user, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
