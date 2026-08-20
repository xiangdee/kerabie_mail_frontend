'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { useCreateCampaign, type CampaignCreateInput } from '@/lib/hooks/useCampaigns';
import NewCampaignView from '@/components/app/campaigns/NewCampaignView';

export default function NewCampaignPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { success, error: toastError } = useAppToast();

  const { data: mailboxes = [] } = useMailboxes(token);
  const createCampaign = useCreateCampaign(token);

  const handleCreate = async (data: CampaignCreateInput) => {
    const res = await createCampaign.mutateAsync(data);
    if (res.status === true) {
      success('Campaign created');
      router.push(`/app/campaigns/${res.response.id}`);
    } else {
      toastError('Failed to create campaign', { description: typeof res.response === 'string' ? res.response : undefined });
    }
  };

  return <NewCampaignView mailboxes={mailboxes} isCreating={createCampaign.isPending} onCreate={handleCreate} />;
}
