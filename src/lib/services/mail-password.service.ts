import { customAxiosPost } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';

const base = apiLink;

// Recovering/resetting the password of an individual hosted mailbox — a
// separate concept from the account-level login password (see
// auth.service.ts's forgotPassword/resetPassword). Mirrors
// kerabie-mail-backend's app/routes/mail_reset.py (/mail/password/*).
export const mailPasswordService = {
  // Logged-in only — set a recovery address for a mailbox you own.
  setAlternateEmail: (token: string | null | undefined, email_address: string, alternate_email: string) =>
    customAxiosPost(`${base}/mail/password/set-alternate-email`, { email_address, alternate_email }, '', token ?? undefined),

  // Public — token comes from the "Verify Your Alternate Email" link.
  verifyAlternateEmail: (email_address: string, token: string) =>
    customAxiosPost(`${base}/mail/password/verify-alternate-email`, { email_address, token }),

  // Public — starts recovery. Backend decides the method: if a verified
  // alternate email is on file it sends the reset link there; otherwise it
  // returns a DNS TXT record to prove domain ownership.
  requestReset: (email_address: string) =>
    customAxiosPost(`${base}/mail/password/request-reset`, { email_address }),

  // Public — re-checks DNS for the TXT record from requestReset's response.
  verifyDnsReset: (email_address: string) =>
    customAxiosPost(`${base}/mail/password/verify-dns-reset`, { email_address }),

  // Public — after DNS ownership is verified, where to send the reset link.
  // dns_token is the raw token embedded in the TXT record value
  // ("kerabie-reset=<token>"), not the full record string.
  setRecoveryEmail: (email_address: string, recovery_email: string, dns_token: string) =>
    customAxiosPost(`${base}/mail/password/set-recovery-email`, { email_address, recovery_email, dns_token }),

  // Public — token comes from the reset link sent to the alternate/recovery email.
  completeReset: (reset_token: string, new_password: string) =>
    customAxiosPost(`${base}/mail/password/complete-reset`, { reset_token, new_password }),
};
