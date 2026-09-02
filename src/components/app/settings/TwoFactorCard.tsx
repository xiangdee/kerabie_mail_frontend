'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAppToast } from '@/components/ui/app-toast';
import { authService } from '@/lib/services/auth.service';
import { useTwoFactorStatus } from '@/lib/hooks/useTwoFactor';
import { PlusCorners } from '@/components/app/console/PlusCorners';
import { cn } from '@/lib/utils';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2 mb-1.5')}>{children}</div>;
}

function AccentButton({ onClick, disabled, loading, children }: { onClick: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      className={cn('relative bg-console-accent text-white border-0 h-9 px-5 hover:bg-console-accent-dark transition-colors disabled:opacity-40 flex items-center gap-2', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em]')}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
      <PlusCorners variant="all" />
    </button>
  );
}

function GhostButton({ onClick, children, tone = 'muted' }: { onClick: () => void; children: React.ReactNode; tone?: 'muted' | 'red' }) {
  return (
    <button
      type="button" onClick={onClick}
      className={cn(
        'border h-9 px-4 text-[13px] bg-white transition-colors',
        tone === 'red'
          ? 'border-console-red text-console-red hover:bg-console-red hover:text-white'
          : 'border-console-border text-console-muted hover:border-console-accent hover:text-console-accent',
      )}
    >
      {children}
    </button>
  );
}

interface Props {
  token: string | null;
  unusedBackupCodes: number;
  onChanged: () => void;
}

type View = 'status' | 'scan' | 'verify' | 'backup-codes' | 'disable' | 'regenerate';

export function TwoFactorCard({ token, unusedBackupCodes, onChanged }: Props) {
  const { success, error: toastError } = useAppToast();
  const { data: status, isLoading, refetch } = useTwoFactorStatus(token);

  const [view, setView] = useState<View>('status');
  const [secret, setSecret] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setView('status');
    setSecret('');
    setOtpauthUri('');
    setCode('');
    setBackupCodes([]);
    setPassword('');
  };

  const handleStart = async () => {
    setLoading(true);
    const res = await authService.start2faSetup(token);
    setLoading(false);
    if (res.status === true) {
      const body = res.response as { secret: string; otpauth_uri: string };
      setSecret(body.secret);
      setOtpauthUri(body.otpauth_uri);
      setView('scan');
    } else {
      toastError(typeof res.response === 'string' ? res.response : 'Failed to start setup.');
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    const res = await authService.verify2faSetup(token, code);
    setLoading(false);
    if (res.status === true) {
      const body = res.response as { backup_codes: string[] };
      setBackupCodes(body.backup_codes);
      setView('backup-codes');
      refetch();
      onChanged();
    } else {
      toastError(typeof res.response === 'string' ? res.response : 'Incorrect code.');
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    const res = await authService.disable2fa(token, password);
    setLoading(false);
    if (res.status === true) {
      success('Two-factor authentication disabled');
      reset();
      refetch();
      onChanged();
    } else {
      toastError(typeof res.response === 'string' ? res.response : 'Failed to disable.');
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    const res = await authService.regenerate2faBackupCodes(token, password);
    setLoading(false);
    if (res.status === true) {
      const body = res.response as { backup_codes: string[] };
      setBackupCodes(body.backup_codes);
      setPassword('');
      setView('backup-codes');
      onChanged();
    } else {
      toastError(typeof res.response === 'string' ? res.response : 'Failed to regenerate codes.');
    }
  };

  const copyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const enabled = !!status?.enabled;

  return (
    <div className="border border-console-border bg-white flex flex-col">
      <div className="px-5 py-4 border-b border-console-border flex items-center gap-3 flex-wrap">
        <div className={cn(DISPLAY, 'font-semibold text-xl')}>Two-factor authentication</div>
        <div className="flex-1" />
        {!isLoading && (
          <span
            className={cn(MONO, 'text-[9.5px] tracking-[0.08em] uppercase px-1.5 py-0.5 border')}
            style={{ borderColor: enabled ? 'var(--color-console-accent)' : 'var(--color-console-amber)', color: enabled ? 'var(--color-console-accent)' : 'var(--color-console-amber)' }}
          >
            {enabled ? 'Enabled' : 'Not set up'}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col gap-4">
        {view === 'status' && !isLoading && (
          <>
            <div className="text-[13.5px] text-console-muted">
              {enabled
                ? 'Sign-ins from a new device need a six-digit code from your authenticator app.'
                : 'Require a rotating code from an authenticator app in addition to your password.'}
            </div>
            {enabled && (
              <div className="border border-console-border-soft bg-console-hover px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[13.5px] font-medium">Backup codes</div>
                  <div className={cn(MONO, 'text-[11px] text-console-muted2 mt-0.5')}>{unusedBackupCodes} unused of 10</div>
                </div>
                <GhostButton onClick={() => setView('regenerate')}>Regenerate</GhostButton>
              </div>
            )}
            <div className="flex gap-2">
              {enabled ? (
                <GhostButton tone="red" onClick={() => setView('disable')}>Disable two-factor authentication</GhostButton>
              ) : (
                <AccentButton onClick={handleStart} loading={loading}>SET UP TWO-FACTOR</AccentButton>
              )}
            </div>
          </>
        )}

        {view === 'scan' && (
          <div className="flex flex-col gap-4 max-w-sm">
            <p className="text-[13.5px] text-console-muted">
              Scan this QR code with an authenticator app (Google Authenticator, 1Password, Authy…), then enter the 6-digit code it shows.
            </p>
            <div className="bg-white p-4 border border-console-border w-fit">
              <QRCodeSVG value={otpauthUri} size={180} />
            </div>
            <div>
              <FieldLabel>Can&apos;t scan? Enter this key manually</FieldLabel>
              <Input value={secret} readOnly onFocus={(e) => e.target.select()} className="font-mono text-xs" />
            </div>
            <div className="flex gap-2">
              <AccentButton onClick={() => setView('verify')}>CONTINUE</AccentButton>
              <GhostButton onClick={reset}>Cancel</GhostButton>
            </div>
          </div>
        )}

        {view === 'verify' && (
          <div className="flex flex-col gap-4">
            <p className="text-[13.5px] text-console-muted">Enter the 6-digit code from your authenticator app.</p>
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
            <div className="flex gap-2">
              <AccentButton onClick={handleVerify} disabled={code.length !== 6} loading={loading}>VERIFY AND ENABLE</AccentButton>
              <GhostButton onClick={reset}>Cancel</GhostButton>
            </div>
          </div>
        )}

        {view === 'backup-codes' && (
          <div className="flex flex-col gap-4 max-w-sm">
            <p className="text-[13.5px] font-medium">Save your backup codes</p>
            <p className={cn(MONO, 'text-[11.5px] text-console-muted2')}>
              Each code works once, if you ever lose access to your authenticator app. Store them somewhere safe — this is the only time they&apos;re shown.
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-console-hover border border-console-border-soft p-3">
              {backupCodes.map((c) => <div key={c}>{c}</div>)}
            </div>
            <div className="flex gap-2">
              <GhostButton onClick={copyBackupCodes}>
                <span className="flex items-center gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy codes'}
                </span>
              </GhostButton>
              <AccentButton onClick={() => { success('Two-factor authentication enabled'); reset(); }}>DONE</AccentButton>
            </div>
          </div>
        )}

        {(view === 'disable' || view === 'regenerate') && (
          <div className="flex flex-col gap-4 max-w-sm">
            <FieldLabel>
              {view === 'disable' ? 'Confirm your password to disable two-factor authentication' : 'Confirm your password to regenerate backup codes'}
            </FieldLabel>
            <Input
              type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (view === 'disable' ? handleDisable() : handleRegenerate())}
              autoFocus
            />
            <div className="flex gap-2">
              {view === 'disable' ? (
                <GhostButton tone="red" onClick={handleDisable}>{loading ? 'Disabling…' : 'Disable'}</GhostButton>
              ) : (
                <AccentButton onClick={handleRegenerate} disabled={!password} loading={loading}>REGENERATE</AccentButton>
              )}
              <GhostButton onClick={reset}>Cancel</GhostButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
