import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { SendEmailRequest } from '@/lib/types/api.types';

const base = apiLink;

// customAxiosDelete/customAxiosRequest only take a request body, not a
// separate params object — but /inbox/{uid}'s email+folder are query
// params on the backend, so they have to be embedded in the URL itself.
function withQuery(path: string, params: Record<string, string>): string {
  return `${path}?${new URLSearchParams(params).toString()}`;
}

// NOTE: as of this fix, MailCompose.tsx (the only consumer of the
// message/mailbox methods below) is not imported/rendered anywhere in this
// app — these previously pointed at routes that don't exist on the real
// backend at all (/mail/messages, /mail/mailboxes, /mail/folders) and never
// got caught because nothing live ever called them. Fixed to match the real
// /inbox + /mail/user-emails routes (see kerabie-mail-backend's
// app/routes/inbox.py and app/routes/mail.py) in case this gets wired up.
export const mailService = {
  // Forwarding
  confirmForwarding: (token: string) =>
    customAxiosPost(`${base}/mail/forwarding/confirm/${token}`, {}),

  // Mailboxes
  getMailboxes: (token: string) =>
    customAxiosGet(`${base}/mail/user-emails`, undefined, token),

  setMailboxNoReply: (token: string | null | undefined, emailAddress: string, isNoReply: boolean) =>
    customAxiosRequest('patch', `${base}/mail/mailbox/${encodeURIComponent(emailAddress)}/no-reply`, { is_no_reply: isNoReply }, '', token ?? undefined),

  // Messages — identified by mailbox email + folder + IMAP uid, not a
  // global message id (no DB-backed message table; IMAP is the store).
  getMessages: (token: string, params: { mailbox: string; folder?: string; page?: number; per_page?: number }) =>
    customAxiosGet(`${base}/inbox`, {
      email: params.mailbox, folder: params.folder ?? 'INBOX',
      page: params.page ?? 1, per_page: params.per_page ?? 50,
    }, token),

  getMessage: (token: string, mailbox: string, uid: string, folder = 'INBOX') =>
    customAxiosGet(`${base}/inbox/${uid}`, { email: mailbox, folder }, token),

  sendEmail: (token: string | null | undefined, data: SendEmailRequest) =>
    customAxiosPost(`${base}/mail/send`, data, '', token ?? undefined),

  deleteMessage: (token: string, mailbox: string, uid: string, folder = 'INBOX') =>
    customAxiosDelete(withQuery(`${base}/inbox/${uid}`, { email: mailbox, folder }), undefined, token),

  moveMessage: (token: string, mailbox: string, uid: string, folder: string, moveTo: string) =>
    customAxiosRequest('patch', withQuery(`${base}/inbox/${uid}`, { email: mailbox, folder }), { move_to: moveTo }, '', token),

  markSeen: (token: string, mailbox: string, uid: string, folder: string, seen: boolean) =>
    customAxiosRequest('patch', withQuery(`${base}/inbox/${uid}`, { email: mailbox, folder }), { is_read: seen }, '', token),

  flagMessage: (token: string, mailbox: string, uid: string, folder: string, flagged: boolean) =>
    customAxiosRequest('patch', withQuery(`${base}/inbox/${uid}`, { email: mailbox, folder }), { is_starred: flagged }, '', token),

  // Folders
  getFolders: (token: string, mailbox: string) =>
    customAxiosGet(`${base}/inbox/folders`, { email: mailbox }, token),

  // AI Compose — Gemini generation legitimately runs past the default 10s
  // timeout (see CustomAxiosRequest's DEFAULT_OPTIONS), especially a cold
  // context-cache (first call in the last hour) plus a "long" draft.
  aiCompose: (token: string | null | undefined, data: { prompt: string; tone?: string; length?: string; subject_hint?: string; reply_context?: string }) =>
    customAxiosPost(`${base}/ai/compose`, data, '', token ?? undefined, { timeout: 45000 }),
};
