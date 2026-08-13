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
      if (!token) return [] as UserEmailAccount[];
      const res = await customAxiosGet(`${base}/mail/user-emails`, undefined, token);
      return res.status === true ? (res.response as UserEmailAccount[]) : ([] as UserEmailAccount[]);
    },
    enabled: !!token,
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
