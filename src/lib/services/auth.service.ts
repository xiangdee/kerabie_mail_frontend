import { customAxiosPost, customAxiosGet, customAxiosDelete } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { LoginRequest, RegisterRequest } from '@/lib/types/api.types';

const base = apiLink;

export const authService = {
  login: (data: LoginRequest) =>
    customAxiosPost(`${base}/auth/login`, data),

  register: (data: RegisterRequest) =>
    customAxiosPost(`${base}/auth/register`, data),

  checkUsername: (username: string) =>
    customAxiosGet(`${base}/auth/username-check`, { username }),

  getWebmailToken: (token: string) =>
    customAxiosPost(`${base}/auth/webmail-token`, {}, '', token),

  refreshToken: (refresh_token: string) =>
    customAxiosPost(`${base}/auth/refresh`, { refresh_token }),

  logout: (token: string) =>
    customAxiosPost(`${base}/auth/logout`, {}, '', token),

  forgotPassword: (email: string) =>
    customAxiosPost(`${base}/auth/forgot-password`, { email }),

  resetPassword: (token: string, new_password: string) =>
    customAxiosPost(`${base}/auth/reset-password`, { token, new_password }),

  me: (token: string) =>
    customAxiosGet(`${base}/auth/me`, undefined, token),

  verifyEmail: (token: string) =>
    customAxiosPost(`${base}/auth/verify-email`, { token }),

  resendVerification: (token: string) =>
    customAxiosPost(`${base}/auth/resend-verification`, {}, '', token),

  changePassword: (token: string, data: { current_password: string; new_password: string }) =>
    customAxiosPost(`${base}/auth/change-password`, data, '', token),

  deleteAccount: (token: string, password: string) =>
    customAxiosDelete(`${base}/auth/account`, { password }, token),
};
