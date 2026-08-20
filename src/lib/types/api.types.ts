// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  plan_type: 'free' | 'pro' | 'premium';
  is_verified: boolean;
  phone?: string;
  phone_verified?: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  full_name?: string;
}

// ── Alias ─────────────────────────────────────────────────────────────────────
export interface EmailAlias {
  id: number;
  mailbox: string;
  alias_address: string;
  is_active: boolean;
  created_at: string;
}

// ── Usage ─────────────────────────────────────────────────────────────────────
export interface UsageStat {
  used: number;
  limit: number;
  unlimited: boolean;
  percentage: number;
}

export interface StorageStat {
  used_mb: number;
  limit_mb: number;
  base_limit_mb: number;
  addon_storage_gb: number;
  percentage: number;
}

export interface MailboxUsageStat {
  used: number;
  limit: number;
  base_limit: number;
  extra_mailboxes: number;
  percentage: number;
}

export interface UsageSummary {
  aliases: UsageStat;
  forwarding_rules: UsageStat;
  storage: StorageStat;
  mailboxes: MailboxUsageStat;
}

// ── Phone ─────────────────────────────────────────────────────────────────────
export interface PhoneStatus {
  phone: string | null;
  is_verified: boolean;
  verified_at: string | null;
}

// ── Mailbox ───────────────────────────────────────────────────────────────────
export interface Mailbox {
  email: string;
  display_name: string;
  quota_bytes: number;
  used_bytes: number;
  enabled: boolean;
  aliases: string[];
  domain: string;
}

// ── Message ───────────────────────────────────────────────────────────────────
export interface MessageSender {
  name?: string;
  email: string;
}

export interface MessageAttachment {
  filename: string;
  content_type: string;
  size: number;
  part_id: string;
}

export interface EmailMessage {
  id: string;
  uid: number;
  mailbox: string;
  folder: string;
  subject: string;
  from: MessageSender;
  to: MessageSender[];
  cc?: MessageSender[];
  date: string;
  seen: boolean;
  flagged: boolean;
  answered: boolean;
  draft: boolean;
  size: number;
  has_attachments: boolean;
  preview?: string;
  body_html?: string;
  body_text?: string;
  attachments?: MessageAttachment[];
}

export interface MessageListResponse {
  messages: EmailMessage[];
  total: number;
  unread: number;
  page: number;
  page_size: number;
}

export interface SendEmailRequest {
  mailbox: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body_html: string;
  body_text?: string;
  reply_to_id?: string;
}

// ── Domain ────────────────────────────────────────────────────────────────────
export interface Domain {
  id: number;
  domain: string;
  status: 'pending' | 'verified' | 'failed';
  dkim_verified: boolean;
  spf_verified: boolean;
  dmarc_verified: boolean;
  no_reply_domain?: boolean;
  created_at: string;
  verified_at?: string;
  dns_records?: DnsRecord[];
}

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  verified: boolean;
}

// ── Subscription ──────────────────────────────────────────────────────────────
export interface Subscription {
  id: number;
  plan_type: string;
  status: 'active' | 'past_due' | 'canceled' | 'trial';
  billing_cycle: string;
  currency: string;
  amount: number;          // kept for display compat (maps to total_price from backend)
  total_price?: number;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  auto_renew?: boolean;
  latest_transaction_id?: number;
  attachment_size_limit_mb?: number;
  has_click_tracking?: boolean;
  has_heatmaps?: boolean;
  has_autoresponder?: boolean;
  has_custom_branding?: boolean;
  has_campaigns?: boolean;
}

// ── Branding ──────────────────────────────────────────────────────────────────
export interface Branding {
  enabled: boolean; // whether the plan allows custom branding at all
  brand_logo_url?: string | null;
  brand_color?: string | null;
  brand_name?: string | null;
}

// ── Campaigns ─────────────────────────────────────────────────────────────────
export interface ContactGroup {
  id: number;
  name: string;
}

export interface SegmentCondition {
  field: 'company' | 'name' | 'phone' | 'email' | 'notes';
  op: 'contains' | 'equals' | 'is_set' | 'is_not_set';
  value?: string;
}

export interface Campaign {
  id: number;
  name: string;
  subject: string;
  body_html: string;
  from_email: string;
  group_id: number | null;
  group_name: string | null;
  segment_filter: SegmentCondition[] | null;
  recipient_count: number;
  step_count: number;
  status: 'draft' | 'sending' | 'sent';
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface CampaignStep {
  id: number;
  step_order: number;
  delay_hours: number;
  subject: string;
  subject_b: string | null;
  ab_split_percent: number;
  body_html: string;
}

export interface CampaignStats {
  total: number;
  sent: number;
  suppressed: number;
  opened: number;
  clicked: number;
  bounced: number;
}

export interface StepAnalytics {
  step_id: number;
  step_order: number;
  sent: number;
  opened: number;
  clicked: number;
  variant_a_sent: number;
  variant_a_opened: number;
  variant_a_clicked: number;
  variant_b_sent: number;
  variant_b_opened: number;
  variant_b_clicked: number;
}

export interface CampaignAnalytics {
  enrolled: number;
  active: number;
  completed: number;
  suppressed: number;
  steps: StepAnalytics[];
}

// ── Contact ───────────────────────────────────────────────────────────────────
export interface Contact {
  id: number;
  email: string;
  display_name: string;
  phone?: string;
  company?: string;
  avatar_url?: string;
  notes?: string;
  created_at: string;
}

// ── Calendar ──────────────────────────────────────────────────────────────────
export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  location?: string;
  all_day: boolean;
  color?: string;
  attendees?: string[];
}

// ── Unsubscribes (per-mailbox, from List-Unsubscribe opt-outs) ────────────────
export interface SenderUnsubscribe {
  id: number;
  recipient_email: string;
  unsubscribed_at: string;
}

// ── Forwarding ────────────────────────────────────────────────────────────────
export interface ForwardingRule {
  id: number;
  mailbox: string;
  destination: string;
  keep_copy: boolean;
  enabled: boolean;
}

// ── Autoresponder ─────────────────────────────────────────────────────────────
export interface Autoresponder {
  id: number;
  mailbox: string;
  subject: string;
  body: string;
  enabled: boolean;
  start_date?: string;
  end_date?: string;
}

// ── API Key ───────────────────────────────────────────────────────────────────
export interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  scopes: string[];
  allowed_ips: string[] | null;
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
}

// ── Webhook ───────────────────────────────────────────────────────────────────
export interface WebhookEndpoint {
  id: number;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  allowed_ips: string[] | null;
  created_at: string;
}

// ── Partner ───────────────────────────────────────────────────────────────────
export interface Partner {
  id: number;
  user_id: number;
  referral_code: string;
  status: 'pending' | 'approved' | 'suspended';
  commission_rate: number;
  total_referrals: number;
  total_earnings_usd: number;
  payout_method?: string;
  payout_details?: Record<string, string>;
  hosting_status: 'none' | 'trial' | 'active';
  trial_expires_at?: string;
}

export interface HostingMailbox {
  id: number;
  email_address: string;
  domain: string;
  display_name?: string;
  status: 'trial' | 'active' | 'suspended' | 'expired';
  is_trial: boolean;
  trial_expires_at?: string;
  monthly_rate_usd: number;
  monthly_rate_ngn: number;
  mailu_provisioned: boolean;
  is_no_reply?: boolean;
  created_at: string;
}

// ── AI Compose ────────────────────────────────────────────────────────────────
export interface ComposeRequest {
  prompt: string;
  tone?: 'professional' | 'friendly' | 'formal' | 'casual';
  length?: 'short' | 'medium' | 'long';
  subject_hint?: string;
  reply_context?: string;
}

export interface ComposeResponse {
  subject?: string;
  body: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cached: boolean;
}

// ── Shared Inbox ─────────────────────────────────────────────────────────────
export interface UserEmailAccount {
  id: number;
  email_address: string;
  connection_type: 'imap' | 'dns';
  is_managed: boolean;
  display_name?: string | null;
  signature_html?: string | null;
  alternate_email?: string | null;
  alternate_email_verified?: boolean;
  is_no_reply?: boolean;
  is_active?: boolean;
  suspended_reason?: string | null;
  suspended_at?: string | null;
  can_self_reactivate?: boolean;
}

export interface SharedInboxMember {
  id: number;
  user_email_id: number;
  member_user_id: number | null;
  invite_email: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'active';
  invited_at: string;
  accepted_at: string | null;
}

export interface SharedInboxEntry {
  member_id: number;
  user_email_id: number;
  email_address: string;
  display_name: string | null;
  role: 'editor' | 'viewer';
  status: string;
  owner_email: string;
}

// ── Generic ───────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface MessageResponse {
  message: string;
}
