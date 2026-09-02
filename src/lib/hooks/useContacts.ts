import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { Contact, ContactGroup } from '@/lib/types/api.types';

const base = apiLink;

// ── Groups ──────────────────────────────────────────────────────────────────
// No rename endpoint exists on the backend (app/routes/contacts.py) — groups
// are create + delete only.

export function useContactGroups(token: string | null) {
  return useQuery({
    queryKey: ['contact-groups', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/contacts/groups`, undefined, token ?? undefined);
      return res.status === true ? (res.response as ContactGroup[]) : ([] as ContactGroup[]);
    },
  });
}

export function useCreateContactGroup(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => customAxiosPost(`${base}/contacts/groups`, { name }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contact-groups'] }),
  });
}

export function useDeleteContactGroup(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customAxiosDelete(`${base}/contacts/groups/${id}`, undefined, token ?? ''),
    onSuccess: () => {
      // Deleting a group sets member contacts' group_id to null server-side
      // (ON DELETE SET NULL) — refresh both.
      qc.invalidateQueries({ queryKey: ['contact-groups'] });
      qc.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

// ── Contacts ────────────────────────────────────────────────────────────────

export function useContacts(token: string | null) {
  return useQuery({
    queryKey: ['contacts', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/contacts`, undefined, token ?? undefined);
      return res.status === true ? (res.response as Contact[]) : ([] as Contact[]);
    },
  });
}

export interface ContactCreateInput {
  email: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  group_id?: number | null;
}

export function useCreateContact(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ContactCreateInput) => customAxiosPost(`${base}/contacts`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export interface ContactUpdateInput {
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  group_id?: number | null;
}

export function useUpdateContact(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ContactUpdateInput }) =>
      customAxiosRequest('patch', `${base}/contacts/${id}`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useDeleteContact(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customAxiosDelete(`${base}/contacts/${id}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}
