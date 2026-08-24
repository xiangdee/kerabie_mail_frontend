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

// No DELETE /mail/mailbox/{email} exists on the backend — deliberately
// not faking one. Deleting a mailbox needs real design (Mailu-side
// removal, cascade cleanup, guarding against deleting your own login
// mailbox) that's out of scope here. Kept as a named export so
// call sites fail loudly/obviously if wired up rather than silently
// hitting a 404.
export function useDeleteMailbox(_token: string | null) {
  return useMutation({
    mutationFn: async (_email: string): Promise<never> => {
      throw new Error('Deleting mailboxes isn\'t available yet.');
    },
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
