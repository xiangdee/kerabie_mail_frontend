'use client';
import { useState } from 'react';
import { Loader2, KeyRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppToast } from '@/components/ui/app-toast';
import { authService } from '@/lib/services/auth.service';

interface Props {
  token: string | null;
}

export function ChangePasswordCard({ token }: Props) {
  const { success, error: toastError } = useAppToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = currentPassword && newPassword.length >= 8 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toastError('New passwords don’t match.');
      return;
    }
    setLoading(true);
    const res = await authService.changePassword(token, { current_password: currentPassword, new_password: newPassword });
    setLoading(false);
    if (res.status === true) {
      success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toastError(typeof res.response === 'string' ? res.response : 'Failed to change password.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          Password
        </CardTitle>
        <CardDescription>Change the password you use to sign in to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password" type="password" autoComplete="current-password"
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password" type="password" autoComplete="new-password" minLength={8}
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password" type="password" autoComplete="new-password" minLength={8}
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords don&apos;t match.</p>
            )}
          </div>
          <Button type="submit" disabled={!canSubmit || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
