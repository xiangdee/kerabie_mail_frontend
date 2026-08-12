'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast, ConfirmDialog } from '@/components/ui/app-toast';
import { useSessions, useRevokeSession, useRevokeAllSessions } from '@/lib/hooks/useSecurity';
import SecurityView from '@/components/app/settings/SecurityView';
import { RecoveryEmailCard } from '@/components/app/settings/RecoveryEmailCard';
import { authService } from '@/lib/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

export default function SecurityPage() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const { success, error: toastError } = useAppToast();

  // ── session management ──────────────────────────────────────────────
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  const { data: sessions = [], isLoading } = useSessions(token);
  const revokeSession = useRevokeSession(token);
  const revokeAll = useRevokeAllSessions(token);

  const handleRevoke = async (id: string) => {
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

  return (
    <>
      <SecurityView
        sessions={sessions}
        isLoading={isLoading}
        isRevoking={revokeSession.isPending}
        isRevokingAll={revokeAll.isPending}
        onRevoke={(id) => setConfirmRevokeId(id)}
        onRevokeAll={() => setConfirmRevokeAll(true)}
      />

      {user?.email && (
        <div className="mt-6">
          <RecoveryEmailCard mailboxEmail={user.email} />
        </div>
      )}

      {/* ── Danger zone ─────────────────────────────────────────────── */}
      <div className="mt-10 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-destructive">Danger zone</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Permanently delete your account and all associated data — mailboxes, emails, domains, billing, and settings. This cannot be undone.
            </p>
          </div>
        </div>

        {!deleteOpen ? (
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
            onClick={() => { setPassword(''); setDeleteError(null); setDeleteOpen(true); }}
          >
            Delete my account
          </Button>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="del-password" className="text-sm font-medium">
                Confirm your password to continue
              </Label>
              <Input
                id="del-password"
                type="password"
                placeholder="Your current password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDeleteAccount()}
                className="max-w-sm"
                autoFocus
              />
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                disabled={deleting}
                onClick={handleDeleteAccount}
              >
                {deleting ? 'Deleting…' : 'Permanently delete my account'}
              </Button>
              <Button
                variant="ghost"
                disabled={deleting}
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

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
