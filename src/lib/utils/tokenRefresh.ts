import axios from 'axios';
import { apiLink } from '@/lib/constants/links';

/**
 * Refreshes the access_token cookie via the httpOnly-cookie auth flow —
 * the refresh_token cookie carries everything needed, and the response
 * sets a fresh access_token cookie automatically (the browser handles it,
 * nothing for JS to read or store). Used both by CustomAxiosRequest's 401
 * retry and by the periodic refresh in AuthProvider — kept as raw axios
 * (not customAxiosPost) to avoid a circular import with CustomAxiosRequest.
 *
 * Returns true if the refresh succeeded, false otherwise (in which case
 * the session is dead and the caller should treat the user as logged out).
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    await axios.post(`${apiLink}/auth/refresh`, {}, { withCredentials: true });
    return true;
  } catch {
    return false;
  }
}
