'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, ShieldCheck, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAppToast } from '@/components/ui/app-toast';
import { authService } from '@/lib/services/auth.service';
import { useTwoFactorStatus } from '@/lib/hooks/useTwoFactor';

interface Props {
  token: string | null;
}

type View = 'status' | 'scan' | 'verify' | 'backup-codes' | 'disable';

export function TwoFactorCard({ token }: Props) {
  const { success, error: toastError } = useAppToast();
  const { data: status, isLoading, refetch } = useTwoFactorStatus(token);

  const [view, setView] = useState<View>('status');
  const [secret, setSecret] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setView('status');
    setSecret('');
    setOtpauthUri('');
    setCode('');
    setBackupCodes([]);
    setDisablePassword('');
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
    } else {
      toastError(typeof res.response === 'string' ? res.response : 'Incorrect code.');
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    const res = await authService.disable2fa(token, disablePassword);
    setLoading(false);
    if (res.status === true) {
      success('Two-factor authentication disabled');
      reset();
      refetch();
    } else {
      toastError(typeof res.response === 'string' ? res.response : 'Failed to disable.');
    }
  };

  const copyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Two-factor authentication
        </CardTitle>
        <CardDescription>
          {isLoading
            ? 'Checking status…'
            : status?.enabled
              ? 'Enabled — an authenticator code is required at sign in.'
              : 'Require a code from an authenticator app in addition to your password.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {view === 'status' && !isLoading && (
          status?.enabled ? (
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => setView('disable')}>
              Disable two-factor authentication
            </Button>
          ) : (
            <Button onClick={handleStart} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set up two-factor authentication
            </Button>
          )
        )}

        {view === 'scan' && (
          <div className="space-y-4 max-w-sm">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with an authenticator app (Google Authenticator, 1Password, Authy…), then enter the 6-digit code it shows.
            </p>
            <div className="bg-white p-4 rounded-md border w-fit">
              <QRCodeSVG value={otpauthUri} size={180} />
            </div>
            <div className="space-y-1.5">
              <Label>Can&apos;t scan? Enter this key manually</Label>
              <Input value={secret} readOnly onFocus={(e) => e.target.select()} className="font-mono text-xs" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setView('verify')}>Continue</Button>
              <Button variant="ghost" onClick={reset}>Cancel</Button>
            </div>
          </div>
        )}

        {view === 'verify' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
            <div className="flex gap-2">
              <Button onClick={handleVerify} disabled={loading || code.length !== 6}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify and enable
              </Button>
              <Button variant="ghost" onClick={reset}>Cancel</Button>
            </div>
          </div>
        )}

        {view === 'backup-codes' && (
          <div className="space-y-4 max-w-sm">
            <p className="text-sm font-medium">Save your backup codes</p>
            <p className="text-xs text-muted-foreground">
              Each code works once, if you ever lose access to your authenticator app. Store them somewhere safe — this is the only time they&apos;re shown.
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-muted/30 rounded-md p-3">
              {backupCodes.map((c) => <div key={c}>{c}</div>)}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyBackupCodes}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copied' : 'Copy codes'}
              </Button>
              <Button onClick={() => { success('Two-factor authentication enabled'); reset(); }}>Done</Button>
            </div>
          </div>
        )}

        {view === 'disable' && (
          <div className="space-y-4 max-w-sm">
            <Label htmlFor="disable-2fa-password">Confirm your password to disable two-factor authentication</Label>
            <Input
              id="disable-2fa-password" type="password" autoComplete="current-password"
              value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDisable()}
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="destructive" disabled={loading || !disablePassword} onClick={handleDisable}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Disable
              </Button>
              <Button variant="ghost" onClick={reset}>Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
