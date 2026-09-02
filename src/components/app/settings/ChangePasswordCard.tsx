'use client';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAppToast } from '@/components/ui/app-toast';
import { authService } from '@/lib/services/auth.service';
import { PlusCorners } from '@/components/app/console/PlusCorners';
import { cn } from '@/lib/utils';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2 mb-1.5')}>{children}</div>;
}

function strength(p: string): number {
  if (!p) return 0;
  let n = 0;
  if (p.length >= 10) n++;
  if (p.length >= 16) n++;
  if (/[^a-zA-Z0-9]/.test(p)) n++;
  if (/[0-9]/.test(p) && /[a-z]/.test(p) && /[A-Z]/.test(p)) n++;
  return Math.max(1, Math.min(4, n));
}

const STRENGTH_LABEL = ['', 'Weak — add length', 'Fair — add symbols', 'Strong', 'Very strong'];
const STRENGTH_COLOR = ['', 'var(--color-console-red)', 'var(--color-console-amber)', 'var(--color-console-accent)', 'var(--color-console-accent)'];

interface Props {
  token: string | null;
  changedAt: string | null;
}

export function ChangePasswordCard({ token, changedAt }: Props) {
  const { success, error: toastError } = useAppToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const str = strength(newPassword);
  const matches = confirmPassword.length > 0 && confirmPassword === newPassword;
  const canSubmit = currentPassword.length > 0 && str >= 2 && matches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await authService.changePassword(token, { current_password: currentPassword, new_password: newPassword });
    setLoading(false);
    if (res.status === true) {
      success('Password changed — other devices have been signed out');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toastError(typeof res.response === 'string' ? res.response : 'Failed to change password.');
    }
  };

  return (
    <div className="border border-console-border bg-white flex flex-col">
      <div className="px-5 py-4 border-b border-console-border flex items-center gap-3 flex-wrap">
        <div className={cn(DISPLAY, 'font-semibold text-xl')}>Password</div>
        <div className="flex-1" />
        {changedAt && (
          <span className={cn(MONO, 'text-[10px] tracking-[0.06em] text-console-muted3')}>
            CHANGED {formatDistanceToNow(new Date(changedAt), { addSuffix: true }).toUpperCase()}
          </span>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
        <div>
          <FieldLabel>Current password</FieldLabel>
          <Input
            type="password" autoComplete="current-password"
            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
          />
        </div>
        <div>
          <FieldLabel>New password</FieldLabel>
          <Input
            type="password" autoComplete="new-password" minLength={8}
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
          />
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className="flex-1 h-1" style={{ background: i <= str ? STRENGTH_COLOR[str] : '#dfe2dc' }} />
            ))}
          </div>
          <div className="text-console-muted2 text-[12px] mt-1">
            {newPassword ? STRENGTH_LABEL[str] : 'Use a passphrase your manager generated.'}
          </div>
        </div>
        <div>
          <FieldLabel>Confirm new password</FieldLabel>
          <Input
            type="password" autoComplete="new-password" minLength={8}
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
            className={confirmPassword && !matches ? 'border-console-red' : undefined}
          />
          {confirmPassword && (
            <div className={cn('text-[12px] mt-1', matches ? 'text-console-accent' : 'text-console-red')}>
              {matches ? 'Passwords match.' : 'Passwords don’t match yet.'}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap mt-1">
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={cn('relative bg-console-accent text-white border-0 h-9 px-5 hover:bg-console-accent-dark transition-colors disabled:opacity-40 flex items-center gap-2', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em]')}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            CHANGE PASSWORD
            <PlusCorners variant="all" />
          </button>
          <span className="text-console-muted2 text-[12.5px]">Signs out every other device.</span>
        </div>
      </form>
    </div>
  );
}
