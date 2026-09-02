'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast, ConfirmDialog } from '@/components/ui/app-toast';
import { useSessions, useRevokeSession, useRevokeAllSessions, useSecurityOverview } from '@/lib/hooks/useSecurity';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { useDomains } from '@/lib/hooks/useDomains';
import { useTemplates } from '@/lib/hooks/useTemplates';
import { usePhoneStatus } from '@/lib/hooks/usePhoneVerification';
import { useQueryClient } from '@tanstack/react-query';
import SecurityView from '@/components/app/settings/SecurityView';
import { RecoveryEmailCard } from '@/components/app/settings/RecoveryEmailCard';
import { ChangePasswordCard } from '@/components/app/settings/ChangePasswordCard';
import { TwoFactorCard } from '@/components/app/settings/TwoFactorCard';
import { PlusCorners } from '@/components/app/console/PlusCorners';
import { authService } from '@/lib/services/auth.service';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

export default function SecurityPage() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const { success, error: toastError } = useAppToast();
  const qc = useQueryClient();

  // ── session management ──────────────────────────────────────────────
  const [confirmRevokeId, setConfirmRevokeId] = useState<number | null>(null);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  const { data: sessions = [], isLoading } = useSessions(token);
  const revokeSession = useRevokeSession(token);
  const revokeAll = useRevokeAllSessions(token);

  // ── security recommendations ────────────────────────────────────────
  const { data: mailboxes = [] } = useMailboxes(token);
  const { data: domains = [] } = useDomains(token);
  const { data: templates = [] } = useTemplates(token);
  const { data: phoneStatus } = usePhoneStatus(token);
  const { data: overview } = useSecurityOverview(token);
  const selfMailbox = mailboxes.find((m) => m.email_address === user?.email);
  const isTrial = user && (user as { plan_status?: string }).plan_status === 'trial';
  const otherSessionsCount = sessions.filter((s) => !s.is_current).length;
  const refetchOverview = () => qc.invalidateQueries({ queryKey: ['security-overview'] });

  const recommendations = [
    {
      id: 'two-factor',
      title: 'Two-factor authentication',
      desc: overview?.totp_enabled
        ? 'Enabled — a code from your authenticator app is required at sign in.'
        : 'A password alone is one leak away from full mailbox access.',
      done: !!overview?.totp_enabled,
      cta: overview?.totp_enabled ? 'Manage' : 'Turn on',
      href: '#two-factor-section',
    },
    {
      id: 'recovery-email',
      title: 'Recovery email',
      desc: selfMailbox?.alternate_email_verified
        ? `Verified — ${selfMailbox.alternate_email}`
        : 'Without one, a lockout means proving domain ownership over DNS.',
      done: !!selfMailbox?.alternate_email_verified,
      cta: selfMailbox?.alternate_email_verified ? 'Change' : 'Add address',
      href: '#recovery-section',
    },
    ...(isTrial ? [{
      id: 'phone',
      title: 'Phone verification',
      desc: phoneStatus?.is_verified ? 'Verified' : 'Verify your phone to unlock full sending limits.',
      done: !!phoneStatus?.is_verified,
      cta: phoneStatus?.is_verified ? 'View' : 'Verify',
      href: '/app/settings',
    }] : []),
    {
      id: 'sessions',
      title: 'Active sessions',
      desc: otherSessionsCount === 0
        ? 'Only this device is signed in.'
        : `${otherSessionsCount} other device${otherSessionsCount === 1 ? '' : 's'} signed in — review them below.`,
      done: otherSessionsCount === 0,
      cta: 'Review',
      href: '#sessions-section',
    },
  ];

  const handleRevoke = async (id: number) => {
    const res = await revokeSession.mutateAsync(id);
    if (res.status === true) success('Session revoked');
    else toastError('Failed to revoke session');
    setConfirmRevokeId(null);
  };

  const handleRevokeAll = async () => {
    const res = await revokeAll.mutateAsync();
    if (res.status === true) success('All other sessions signed out');
    else toastError('Failed to sign out sessions');
    setConfirmRevokeAll(false);
  };

  // ── delete account ──────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      setDeleteError('Please enter your password.');
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    const res = await authService.deleteAccount(null, password);
    setDeleting(false);
    if (res.status === true) {
      await logout();
      router.replace('/');
    } else {
      setDeleteError(
        typeof res.response === 'string'
          ? res.response
          : 'Incorrect password or deletion failed. Please try again.'
      );
    }
  };

  const domain = domains[0]?.domain;

  return (
    <>
      <SecurityView
        mailboxEmail={user?.email}
        sessions={sessions}
        isLoading={isLoading}
        isRevoking={revokeSession.isPending}
        isRevokingAll={revokeAll.isPending}
        recommendations={recommendations}
        onRevoke={(id) => setConfirmRevokeId(id)}
        onRevokeAll={() => setConfirmRevokeAll(true)}
      />

      {!isLoading && (
        <div className="grid lg:grid-cols-2 gap-5 mt-6 items-start">
          <div id="password-section" className="scroll-mt-20">
            <ChangePasswordCard token={token} changedAt={overview?.password_changed_at ?? user?.created_at ?? null} />
          </div>

          <div className="flex flex-col gap-5">
            <div id="two-factor-section" className="scroll-mt-20">
              <TwoFactorCard token={token} unusedBackupCodes={overview?.unused_backup_codes ?? 0} onChanged={refetchOverview} />
            </div>

            {user?.email && (
              <div id="recovery-section" className="scroll-mt-20">
                <RecoveryEmailCard mailboxEmail={user.email} token={token} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Danger zone ─────────────────────────────────────────────── */}
      {!isLoading && (
        <section className="mt-10 border border-console-red bg-[#fbf1ef] p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="w-[7px] h-[7px] bg-console-red shrink-0" />
              <div className={cn(DISPLAY, 'font-semibold text-2xl')} style={{ color: 'var(--color-console-red)' }}>Delete this account</div>
            </div>
            <div className="text-[13.5px] mt-1.5 max-w-[76ch]" style={{ color: '#7d4a43' }}>
              Removes {mailboxes.length} mailbox{mailboxes.length === 1 ? '' : 'es'}, {domains.length} domain{domains.length === 1 ? '' : 's'} and {templates.length} template{templates.length === 1 ? '' : 's'}
              {domain && <> — mail sent to <span className={cn(MONO, 'text-[12.5px]')}>{domain}</span> starts bouncing immediately</>}. Kerabie keeps nothing after 30 days and this cannot be undone.
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            {!deleteOpen ? (
              <button
                type="button"
                onClick={() => { setPassword(''); setDeleteError(null); setDeleteOpen(true); }}
                className="bg-transparent border border-console-red text-console-red h-9 px-4.5 text-[13px] hover:bg-console-red hover:text-white transition-colors"
              >
                Delete my account
              </button>
            ) : (
              <div className="flex flex-col gap-2 min-w-[240px]">
                <div className={cn(MONO, 'text-[10px] tracking-[0.08em]')} style={{ color: '#8a5f2a' }}>CONFIRM YOUR PASSWORD</div>
                <Input
                  type="password"
                  placeholder="Your current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDeleteAccount()}
                  autoFocus
                />
                {deleteError && <p className="text-[12.5px] text-console-red">{deleteError}</p>}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDeleteAccount}
                    className={cn('relative bg-console-red text-white border-0 h-9 px-4 hover:bg-[#8a2f27] transition-colors disabled:opacity-50 flex items-center gap-2', DISPLAY, 'font-semibold text-[14px] tracking-[0.04em]')}
                  >
                    {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                    PERMANENTLY DELETE
                    <PlusCorners variant="all" />
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => setDeleteOpen(false)}
                    className="border border-console-border bg-white h-9 px-4 text-[13px] text-console-muted hover:border-console-accent hover:text-console-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Dialogs ─────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmRevokeId !== null}
        title="Sign out this device?"
        description="This session will be revoked and that device will need to sign in again."
        variant="warning"
        confirmLabel="Sign out"
        onConfirm={() => confirmRevokeId !== null && handleRevoke(confirmRevokeId)}
        onCancel={() => setConfirmRevokeId(null)}
      />

      <ConfirmDialog
        open={confirmRevokeAll}
        title="Sign out all other devices?"
        description="All sessions except your current one will be revoked."
        variant="warning"
        confirmLabel="Sign out all"
        onConfirm={handleRevokeAll}
        onCancel={() => setConfirmRevokeAll(false)}
      />
    </>
  );
}
