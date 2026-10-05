'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/services/auth.service';
import { refreshAccessToken } from '@/lib/utils/tokenRefresh';
import type { User } from '@/lib/types/api.types';

const SESSION_REFRESH_INTERVAL_MS = 15 * 60 * 1000; // half the 30min access-token TTL

export type LoginResult =
  | { ok: true }
  | { ok: false; requires2fa: true; pendingToken: string }
  | { ok: false; requires2fa?: false; error?: string };

interface AuthContextValue {
  user: User | null;
  // Always null now — auth is httpOnly-cookie based (unreadable by JS).
  // Kept in the shape so the many existing `const { token } = useAuth()`
  // call sites (which just forward it into API calls that no longer need
  // it, since withCredentials + the cookie cover auth) don't need changing.
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, captchaToken?: string) => Promise<LoginResult>;
  verifyTwoFactor: (pendingToken: string, code: string) => Promise<{ ok: boolean; error?: string }>;
  register: (username: string, password: string, full_name?: string, captchaToken?: string) => Promise<{ ok: boolean; error?: string }>;
  registerConsole: (email: string, password: string, full_name?: string, captchaToken?: string) => Promise<{ ok: boolean; error?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// First-touch referral (components/ReferralCapture.tsx, ?ref=CODE) and UTM
// (components/UtmCapture.tsx) attribution, read from the cookies those set.
function readSignupAttribution(): { referral_code?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  if (typeof document === 'undefined') return {};
  const refMatch = document.cookie.match(/(?:^|; )kerabie_ref=([^;]+)/);
  const out: ReturnType<typeof readSignupAttribution> = {
    referral_code: refMatch ? decodeURIComponent(refMatch[1]) : undefined,
  };
  const utmMatch = document.cookie.match(/(?:^|; )kerabie_utm=([^;]+)/);
  if (utmMatch) {
    try {
      const parsed = JSON.parse(decodeURIComponent(utmMatch[1]));
      out.utm_source = parsed.utm_source;
      out.utm_medium = parsed.utm_medium;
      out.utm_campaign = parsed.utm_campaign;
    } catch {}
  }
  return out;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Auth is httpOnly-cookie based — no token to read client-side. Just ask
  // the API who's logged in; a non-2xx response means there's no valid
  // session (or one a cookie-refresh can revive).
  const refreshUser = useCallback(async () => {
    const res = await authService.me();
    if (res.status === true) {
      setUser(res.response as User);
      return;
    }
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const meRes = await authService.me();
      setUser(meRes.status === true ? (meRes.response as User) : null);
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshUser();
      setIsLoading(false);
    })();
  }, [refreshUser]);

  // Proactively refresh the access_token cookie while the tab is open, so a
  // dead refresh token is caught here rather than surfacing mid-action.
  useEffect(() => {
    if (!user) return;
    const id = setInterval(async () => {
      const refreshed = await refreshAccessToken();
      if (!refreshed) setUser(null);
    }, SESSION_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [user]);

  const login = async (email: string, password: string, captchaToken?: string): Promise<LoginResult> => {
    const res = await authService.login({ email, password, captcha_token: captchaToken });
    if (res.status === true) {
      const body = res.response as { user?: User; requires_2fa?: boolean; two_factor_pending_token?: string };
      if (body.requires_2fa) {
        return { ok: false, requires2fa: true, pendingToken: body.two_factor_pending_token! };
      }
      // Wipe anything cached under the previous session (or a guest/logged-out
      // state) before this account's own data loads — query keys can't rely
      // on `token` to scope by user any more (see the comment above, it's
      // always null now), so a stale login-switch would otherwise keep
      // serving whatever the last account had cached until a full reload.
      queryClient.clear();
      setUser(body.user!);
      return { ok: true };
    }
    return { ok: false, error: res.response as string };
  };

  const verifyTwoFactor = async (pendingToken: string, code: string) => {
    const res = await authService.verifyTwoFactorLogin(pendingToken, code);
    if (res.status === true) {
      const { user: u } = res.response as { user: User };
      queryClient.clear();
      setUser(u);
      return { ok: true };
    }
    return { ok: false, error: res.response as string };
  };

  const register = async (username: string, password: string, full_name?: string, captchaToken?: string) => {
    const res = await authService.register({
      username, password, full_name, captcha_token: captchaToken, ...readSignupAttribution(),
    });
    if (res.status === true) {
      const { user: u } = res.response as { user: User };
      queryClient.clear();
      setUser(u);
      return { ok: true };
    }
    return { ok: false, error: res.response as string };
  };

  // Console-only signup: no session yet, the caller moves on to the code step.
  const registerConsole = async (email: string, password: string, full_name?: string, captchaToken?: string) => {
    const res = await authService.registerConsole({
      email, password, full_name, captcha_token: captchaToken, ...readSignupAttribution(),
    });
    return res.status === true ? { ok: true } : { ok: false, error: res.response as string };
  };

  const verifyEmail = async (email: string, code: string) => {
    const res = await authService.verifyEmail(email, code);
    if (res.status === true) {
      const { user: u } = res.response as { user: User };
      queryClient.clear();
      setUser(u);
      return { ok: true };
    }
    return { ok: false, error: res.response as string };
  };

  const logout = async () => {
    await authService.logout();
    queryClient.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token: null, isLoading, isAuthenticated: !!user, login, verifyTwoFactor, register, registerConsole, verifyEmail, logout, refreshUser }}
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
