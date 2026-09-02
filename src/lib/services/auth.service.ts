import { customAxiosPost, customAxiosGet, customAxiosDelete } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { LoginRequest, RegisterRequest } from '@/lib/types/api.types';

const base = apiLink;

export const authService = {
  // auth_channel: 'web' makes the backend set httpOnly cookies instead of
  // returning tokens in the JSON body — see auth.context.tsx for why.
  login: (data: LoginRequest) =>
    customAxiosPost(`${base}/auth/login`, { ...data, auth_channel: 'web' }),

  register: (data: RegisterRequest) =>
    customAxiosPost(`${base}/auth/register`, { ...data, auth_channel: 'web' }),

  checkUsername: (username: string) =>
    customAxiosGet(`${base}/auth/username-check`, { username }),

  // mailbox_id targets a specific mailbox (support@/sales@ etc.) instead of
  // whichever one the current session happens to be — omit it for the
  // primary/current mailbox, unchanged from before this param existed.
  getWebmailToken: (mailboxId?: number) =>
    customAxiosPost(`${base}/auth/webmail-token`, mailboxId ? { mailbox_id: mailboxId } : {}),

  refreshToken: () =>
    customAxiosPost(`${base}/auth/refresh`, {}),

  // token params below are vestigial — auth is httpOnly-cookie based now
  // (withCredentials is set globally in CustomAxiosRequest), kept optional
  // so existing call sites passing the (now-always-null) context token
  // don't need to change.
  logout: (token?: string | null) =>
    customAxiosPost(`${base}/auth/logout`, {}, '', token ?? undefined),

  forgotPassword: (email: string) =>
    customAxiosPost(`${base}/auth/forgot-password`, { email }),

  // NOTE: this `token` is an email/password-reset token from the reset link,
  // not an auth session token — unrelated to the cookie migration.
  resetPassword: (token: string, new_password: string) =>
    customAxiosPost(`${base}/auth/reset-password`, { token, new_password }),

  me: (token?: string | null) =>
    customAxiosGet(`${base}/auth/me`, undefined, token ?? undefined),

  // NOTE: this `token` is an email-verification token, not an auth session
  // token — unrelated to the cookie migration.
  verifyEmail: (token: string) =>
    customAxiosPost(`${base}/auth/verify-email`, { token }),

  resendVerification: (token?: string | null) =>
    customAxiosPost(`${base}/auth/resend-verification`, {}, '', token ?? undefined),

  changePassword: (token: string | null | undefined, data: { current_password: string; new_password: string }) =>
    customAxiosPost(`${base}/auth/change-password`, data, '', token ?? undefined),

  deleteAccount: (token: string | null | undefined, password: string) =>
    customAxiosDelete(`${base}/auth/account`, { password }, token ?? undefined),

  // ── Two-factor auth (TOTP) ──────────────────────────────────────────
  verifyTwoFactorLogin: (pending_token: string, code: string) =>
    customAxiosPost(`${base}/auth/2fa/verify-login`, { pending_token, code, auth_channel: 'web' }),

  get2faStatus: (token?: string | null) =>
    customAxiosGet(`${base}/auth/2fa/status`, undefined, token ?? undefined),

  start2faSetup: (token?: string | null) =>
    customAxiosPost(`${base}/auth/2fa/setup`, {}, '', token ?? undefined),

  verify2faSetup: (token: string | null | undefined, code: string) =>
    customAxiosPost(`${base}/auth/2fa/verify-setup`, { code }, '', token ?? undefined),

  disable2fa: (token: string | null | undefined, password: string) =>
    customAxiosPost(`${base}/auth/2fa/disable`, { password }, '', token ?? undefined),
};
