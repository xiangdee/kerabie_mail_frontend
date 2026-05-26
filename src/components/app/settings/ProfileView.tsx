'use client';
import { useState, useEffect } from 'react';
import { User, Shield, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { User as AuthUser } from '@/lib/types/api.types';

interface ProfileViewProps {
  user: AuthUser | null;
  saving: boolean;
  changingPassword: boolean;
  onSaveProfile: (data: { full_name: string }) => Promise<void>;
  onChangePassword: (data: { current_password: string; new_password: string }) => Promise<void>;
}

export function ProfileView({
  user, saving, changingPassword, onSaveProfile, onChangePassword,
}: ProfileViewProps) {
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user) setFullName(user.full_name);
  }, [user]);

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({ full_name: fullName });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (newPw !== confirmPw) {
      setPwError('New passwords do not match');
      return;
    }
    if (newPw.length < 8) {
      setPwError('Password must be at least 8 characters');
      return;
    }
    onChangePassword({ current_password: currentPw, new_password: newPw }).then(() => {
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Profile</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account information.</p>
      </div>

      {/* Avatar + info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{user?.full_name || '—'}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </p>
            {user?.is_verified ? (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-emerald-600 border-emerald-300">
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-amber-600 border-amber-300">
                Unverified
              </Badge>
            )}
          </div>
          <Badge variant="secondary" className="mt-1 capitalize text-xs">
            {user?.plan_type} plan
          </Badge>
        </div>
      </div>

      {/* Profile form */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Account details</h3>
        </div>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email address</Label>
            <Input value={user?.email || ''} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Password */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Change password</h3>
        </div>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-pw">Current password</Label>
            <div className="relative">
              <Input
                id="current-pw"
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="new-pw">New password</Label>
            <div className="relative">
              <Input
                id="new-pw"
                type={showNewPw ? 'text' : 'password'}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 8 characters"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pw">Confirm new password</Label>
            <Input
              id="confirm-pw"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
            />
          </div>
          {pwError && <p className="text-xs text-destructive">{pwError}</p>}
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={changingPassword}>
              {changingPassword && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Update password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
