import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { UserEmailAccount } from '@/lib/types/api.types';

const base = apiLink;

// Previously pointed at /mail/mailboxes (GET/POST/PATCH/DELETE), which
// doesn't exist anywhere on the backend — the whole Mailboxes settings
// page was silently non-functional. Real equivalents: GET
// /mail/user-emails (list), POST /mail/mailbox/add (create, domain-owner
// managed mailboxes only), PATCH /mail/user-emails/{id} (display
// name/signature). There is no delete-mailbox endpoint on the backend at
// all yet — see useDeleteMailbox below.
export function useMailboxes(token: string | null) {
  return useQuery({
    queryKey: ['mailboxes', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/mail/user-emails`, undefined, token ?? undefined);
      return res.status === true ? (res.response as UserEmailAccount[]) : ([] as UserEmailAccount[]);
    },
    enabled: true,
  });
}

export interface MailboxHealth {
  email: string;
  is_active: boolean;
  suspended_reason: string | null;
  suspension_reason_code: string | null;
  reputation: { sent_24h: number; bounced_24h: number; bounce_rate_pct: number | null };
  storage: { used_bytes: number; used_mb: number; limit_mb: number; percentage: number };
}

// GET /mail/mailbox-usage?email=... — per-mailbox health for the Dashboard.
// bounce_rate_pct is null (not 0) below a minimum sample size on the
// backend, since a rate computed from a handful of sends isn't meaningful —
// render that as "not enough data yet," not as a clean bill of health.
export function useMailboxHealth(token: string | null, email: string | undefined) {
  return useQuery({
    queryKey: ['mailbox-health', email, token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/mail/mailbox-usage`, { email }, token ?? undefined);
      return res.status === true ? (res.response as MailboxHealth) : null;
    },
    enabled: !!email,
    staleTime: 60_000,
  });
}

export function useCreateMailbox(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; display_name: string; password: string }) =>
      customAxiosPost(`${base}/mail/mailbox/add`, {
        email_address: data.email,
        display_name: data.display_name || undefined,
        password: data.password || undefined,
      }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mailboxes'] }),
  });
}

// POST /mail/mailbox/{id}/delete — Mailu removal + DB row happen fast,
// but any B2-archived messages (app/tasks/archive.py) are deleted one
// object at a time in a background task, so this only starts the job;
// poll useMailboxDeleteStatus with the returned job_id for progress.
export interface DeleteMailboxStart {
  job_id: string;
  total: number;
}

export function useDeleteMailbox(token: string | null) {
  // No onSuccess invalidate here — this only starts the background job,
  // the mailbox isn't actually gone yet. The caller invalidates ['mailboxes']
  // once useMailboxDeleteStatus below reports status === 'done'.
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await customAxiosPost(`${base}/mail/mailbox/${id}/delete`, {}, '', token ?? '');
      if (!res.status) throw new Error((res as any)?.message ?? 'Could not start mailbox deletion.');
      return res.response as DeleteMailboxStart;
    },
  });
}

export interface MailboxDeleteProgress {
  status: 'running' | 'done' | 'error';
  done: number;
  total: number;
  email?: string;
  error?: string;
}

// Poll while status === 'running'. Caller controls refetchInterval so it
// can stop once done/error comes back — see MailboxesView's delete modal.
export function useMailboxDeleteStatus(token: string | null, jobId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['mailbox-delete-status', jobId],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/mail/mailbox/delete-status/${jobId}`, undefined, token ?? undefined);
      return res.status === true ? (res.response as MailboxDeleteProgress) : null;
    },
    enabled: enabled && !!jobId,
    refetchInterval: (query) => (query.state.data?.status === 'running' ? 800 : false),
  });
}

export function useUpdateMailbox(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { display_name?: string; signature_html?: string } }) =>
      customAxiosRequest('patch', `${base}/mail/user-emails/${id}`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mailboxes'] }),
  });
}

export function useSetMailboxNoReply(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, isNoReply }: { email: string; isNoReply: boolean }) =>
      customAxiosRequest('patch', `${base}/mail/mailbox/${encodeURIComponent(email)}/no-reply`, { is_no_reply: isNoReply }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mailboxes'] }),
  });
}

// Self-service recovery for quota_exceeded/auth_failed suspensions only
// (app.tasks.mail._suspend_for_permanent_error) — bounce_rate suspensions
// (app.utils.sender_reputation) return 403 here by design and need admin
// review instead. Re-tests the connection server-side before clearing the
// suspension, so a real error comes back if the underlying issue isn't
// actually fixed yet.
export function useReactivateMailbox(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password?: string }) =>
      customAxiosPost(`${base}/mail/mailbox/${encodeURIComponent(email)}/reactivate`, { password }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mailboxes'] }),
  });
}

// For "unreachable" suspensions specifically — the whole server moved or
// died, so no password on the old host (useReactivateMailbox above) will
// ever reconnect it. Repoints an IMAP-connected mailbox at a different
// host/port/password entirely; the backend tests both before saving
// anything. Distinct from useConvertToImap (useMailMigration.ts), which
// only applies to currently Kerabie-hosted (connection_type='dns')
// mailboxes migrating away and deletes the Kerabie-side copy.
export function useUpdateMailboxConnection(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, data }: {
      email: string;
      data: { imap_host: string; imap_port: number; smtp_host: string; smtp_port: number; email_password: string };
    }) =>
      customAxiosPost(`${base}/mail/mailbox/${encodeURIComponent(email)}/update-connection`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mailboxes'] }),
  });
}
