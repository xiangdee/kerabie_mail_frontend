import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { UserEmailAccount, SharedInboxMember, SharedInboxEntry } from '@/lib/types/api.types';

const base = apiLink;

export function useUserEmails(token: string | null) {
  return useQuery({
    queryKey: ['user-emails', token],
    queryFn: async () => {
      if (!token) return [] as UserEmailAccount[];
      const res = await customAxiosGet(`${base}/mail/user-emails`, undefined, token);
      return res.status === true ? (res.response as UserEmailAccount[]) : ([] as UserEmailAccount[]);
    },
    enabled: !!token,
  });
}

export function useSharedMembers(emailId: number | null, token: string | null) {
  return useQuery({
    queryKey: ['shared-members', emailId, token],
    queryFn: async () => {
      if (!token || !emailId) return [] as SharedInboxMember[];
      const res = await customAxiosGet(`${base}/shared-inboxes/${emailId}/members`, undefined, token);
      return res.status === true ? (res.response as SharedInboxMember[]) : ([] as SharedInboxMember[]);
    },
    enabled: !!token && !!emailId,
  });
}

export function useInviteMember(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ emailId, invite_email, role }: { emailId: number; invite_email: string; role: string }) =>
      customAxiosPost(`${base}/shared-inboxes/${emailId}/members`, { invite_email, role }, '', token ?? ''),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['shared-members', vars.emailId] }),
  });
}

export function useUpdateMemberRole(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ emailId, memberId, role }: { emailId: number; memberId: number; role: string }) =>
      customAxiosRequest('patch', `${base}/shared-inboxes/${emailId}/members/${memberId}`, { role }, '', token ?? ''),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['shared-members', vars.emailId] }),
  });
}

export function useRemoveMember(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ emailId, memberId }: { emailId: number; memberId: number }) =>
      customAxiosDelete(`${base}/shared-inboxes/${emailId}/members/${memberId}`, undefined, token ?? ''),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['shared-members', vars.emailId] }),
  });
}

export function useMySharedInboxes(token: string | null) {
  return useQuery({
    queryKey: ['my-shared-inboxes', token],
    queryFn: async () => {
      if (!token) return [] as SharedInboxEntry[];
      const res = await customAxiosGet(`${base}/shared-inboxes/my`, undefined, token);
      return res.status === true ? (res.response as SharedInboxEntry[]) : ([] as SharedInboxEntry[]);
    },
    enabled: !!token,
  });
}

export function useLeaveSharedInbox(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ emailId, memberId }: { emailId: number; memberId: number }) =>
      customAxiosDelete(`${base}/shared-inboxes/${emailId}/members/${memberId}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-shared-inboxes'] }),
  });
}

export function useAcceptInvite(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteToken: string) =>
      customAxiosPost(`${base}/shared-inboxes/accept/${inviteToken}`, {}, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-shared-inboxes'] }),
  });
}
