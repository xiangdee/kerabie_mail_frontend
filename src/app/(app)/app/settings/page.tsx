'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { authService } from '@/lib/services/auth.service';
import { ProfileView } from '@/components/app/settings/ProfileView';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { success, error: toastError } = useAppToast();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveProfile = async (data: { full_name: string }) => {
    setSaving(true);
    // PATCH /auth/me
    const { customAxiosRequest } = await import('@/lib/utils/CustomAxiosRequest');
    const { apiLink } = await import('@/lib/constants/links');
    const res = await customAxiosRequest('patch', `${apiLink}/auth/me`, data);
    setSaving(false);
    if (res.status === true) {
      await refreshUser();
      success('Profile updated');
    } else {
      toastError('Failed to update profile');
    }
  };

  const handleChangePassword = async (data: { current_password: string; new_password: string }) => {
    setChangingPassword(true);
    const res = await authService.changePassword(null, data);
    setChangingPassword(false);
    if (res.status === true) {
      success('Password changed successfully');
    } else {
      toastError(res.response as string || 'Failed to change password');
    }
  };

  return (
    <ProfileView
      user={user}
      saving={saving}
      changingPassword={changingPassword}
      onSaveProfile={handleSaveProfile}
      onChangePassword={handleChangePassword}
    />
  );
}
