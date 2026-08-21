import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { DnsSetupInfo } from '@/lib/services/mail-connect.service';

const base = apiLink;

export interface MailConnectionResult {
  connection: { id: number; email_address: string; connection_type: string; is_connected: boolean };
  dns_setup_required?: boolean | null;
  dns_config?: DnsSetupInfo | null;
  message?: string | null;
}

export interface MigrationStatus {
  status: 'running' | 'completed' | 'failed';
  folders_total: number;
  folders_done: number;
  messages_total: number;
  messages_done: number;
  current_folder: string | null;
  error: string | null;
  started_at: string;
  completed_at: string | null;
}

// IMAP<->DNS mailbox conversion — see kerabie-mail-backend/app/routes/mail_migration.py.

export function useStartConvertToDns(token: string | null) {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await customAxiosPost(`${base}/mail/mailbox/${encodeURIComponent(email)}/convert-to-dns/start`, {}, '', token ?? '');
      return res as { status: boolean; response: MailConnectionResult | string };
    },
  });
}

export function useVerifyConvertToDns(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await customAxiosPost(`${base}/mail/mailbox/${encodeURIComponent(email)}/convert-to-dns/verify`, {}, '', token ?? '');
      return res as { status: boolean; response: MailConnectionResult | string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mailboxes'] }),
  });
}

export function useMigrationStatus(token: string | null, email: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['migration-status', email, token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/mail/mailbox/${encodeURIComponent(email!)}/migration-status`, undefined, token ?? undefined);
      return (res.status === true ? (res.response as MigrationStatus | null) : null);
    },
    enabled: enabled && !!email && !!token,
    refetchInterval: (query) => (query.state.data?.status === 'running' ? 4000 : false),
  });
}

export function useRetryMigration(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await customAxiosPost(`${base}/mail/mailbox/${encodeURIComponent(email)}/migration-status/retry`, {}, '', token ?? '');
      return res as { status: boolean; response: MigrationStatus | string };
    },
    onSuccess: (_, email) => qc.invalidateQueries({ queryKey: ['migration-status', email, token] }),
  });
}

export function useConvertToImap(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, data }: {
      email: string;
      data: { imap_host: string; imap_port: number; smtp_host: string; smtp_port: number; email_password: string; confirm_data_loss: boolean };
    }) => {
      const res = await customAxiosPost(`${base}/mail/mailbox/${encodeURIComponent(email)}/convert-to-imap`, data, '', token ?? '');
      return res as { status: boolean; response: MailConnectionResult | string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mailboxes'] }),
  });
}
