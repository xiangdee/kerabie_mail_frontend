import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { SendEmailRequest } from '@/lib/types/api.types';

const base = apiLink;

export const mailService = {
  // Mailboxes
  getMailboxes: (token: string) =>
    customAxiosGet(`${base}/mail/mailboxes`, undefined, token),

  createMailbox: (token: string, data: { email: string; display_name: string; password: string; quota?: number }) =>
    customAxiosPost(`${base}/mail/mailboxes`, data, '', token),

  deleteMailbox: (token: string, email: string) =>
    customAxiosDelete(`${base}/mail/mailboxes/${encodeURIComponent(email)}`, undefined, token),

  updateMailbox: (token: string, email: string, data: Record<string, unknown>) =>
    customAxiosRequest('patch', `${base}/mail/mailboxes/${encodeURIComponent(email)}`, data, '', token),

  // Messages
  getMessages: (token: string, params: { mailbox: string; folder?: string; page?: number; page_size?: number; search?: string }) =>
    customAxiosGet(`${base}/mail/messages`, params, token),

  getMessage: (token: string, id: string) =>
    customAxiosGet(`${base}/mail/messages/${id}`, undefined, token),

  sendEmail: (token: string, data: SendEmailRequest) =>
    customAxiosPost(`${base}/mail/send`, data, '', token),

  deleteMessage: (token: string, id: string) =>
    customAxiosDelete(`${base}/mail/messages/${id}`, undefined, token),

  moveMessage: (token: string, id: string, folder: string) =>
    customAxiosPost(`${base}/mail/messages/${id}/move`, { folder }, '', token),

  markSeen: (token: string, id: string, seen: boolean) =>
    customAxiosRequest('patch', `${base}/mail/messages/${id}`, { seen }, '', token),

  flagMessage: (token: string, id: string, flagged: boolean) =>
    customAxiosRequest('patch', `${base}/mail/messages/${id}`, { flagged }, '', token),

  // Folders (labels)
  getFolders: (token: string, mailbox: string) =>
    customAxiosGet(`${base}/mail/folders`, { mailbox }, token),

  // AI Compose
  aiCompose: (token: string, data: { prompt: string; tone?: string; length?: string; subject_hint?: string; reply_context?: string }) =>
    customAxiosPost(`${base}/ai/compose`, data, '', token),

  // Import / Export
  importEml: (token: string, mailbox: string, file: File) =>
    customAxiosPost(`${base}/mail/import`, { mailbox, file }, 'upload', token),
};
