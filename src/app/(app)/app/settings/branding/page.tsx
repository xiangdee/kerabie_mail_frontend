'use client';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { useBranding, useUpdateBranding, useClearBranding } from '@/lib/hooks/useBranding';
import BrandingView from '@/components/app/settings/BrandingView';

export default function BrandingPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();

  const { data: branding, isLoading } = useBranding(token);
  const updateBranding = useUpdateBranding(token);
  const clearBranding = useClearBranding(token);

  const handleSave = async (data: { brand_logo_url: string | null; brand_color: string | null; brand_name: string | null }) => {
    const res = await updateBranding.mutateAsync(data);
    if (res.status === true) {
      success('Branding saved');
    } else {
      toastError('Failed to save branding', { description: typeof res.response === 'string' ? res.response : undefined });
    }
  };

  const handleClear = async () => {
    const res = await clearBranding.mutateAsync();
    if (res.status === true) {
      success('Branding cleared');
    } else {
      toastError('Failed to clear branding', { description: typeof res.response === 'string' ? res.response : undefined });
    }
  };

  return (
    <BrandingView
      branding={branding}
      isLoading={isLoading}
      isSaving={updateBranding.isPending}
      isClearing={clearBranding.isPending}
      onSave={handleSave}
      onClear={handleClear}
    />
  );
}
