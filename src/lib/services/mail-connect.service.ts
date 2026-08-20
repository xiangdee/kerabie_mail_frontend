import { customAxiosPost } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';

const base = apiLink;

// Register or log in by proving ownership of your own domain via DNS —
// a real alternative to /auth/register's username@kerabie.email path, not
// a mailbox-aggregation feature (see CLAUDE.md's /mail/connect boundary
// note). Only ever call this with connection_type: 'dns' from this app —
// 'imap' (external provider login) and multi-account switching are
// mobile-only.
export interface DnsRecord {
  name: string;
  type: string;
  value: string;
  description?: string | null;
  host?: string | null;
  priority?: number | null;
}

export interface DnsSetupInfo {
  mx_records: DnsRecord[];
  txt_records: DnsRecord[];
  dkim_record: DnsRecord[];
  dmarc_record: DnsRecord;
}

export interface MailConnectionResponse {
  connection: {
    id: number;
    email_address: string;
    connection_type: string;
    is_connected: boolean;
  };
  dns_setup_required?: boolean | null;
  dns_config?: DnsSetupInfo | null;
  message?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  device_id?: string | null;
}

export const mailConnectService = {
  connectDomain: (email_address: string, email_password: string) =>
    customAxiosPost(`${base}/mail/connect`, {
      email_address,
      email_password,
      connection_type: 'dns',
      auth_channel: 'web',
    }),
};
