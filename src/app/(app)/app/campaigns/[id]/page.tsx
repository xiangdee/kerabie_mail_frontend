'use client';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import {
  useCampaign, useUpdateCampaign, useSendCampaign, useCampaignStats, useCampaignAnalytics,
  useCampaignSteps, useAddCampaignStep, useDeleteCampaignStep, useContactGroups,
  type CampaignUpdateInput, type CampaignStepInput,
} from '@/lib/hooks/useCampaigns';
import CampaignDetailView from '@/components/app/campaigns/CampaignDetailView';

export default function CampaignDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();

  const { data: campaign } = useCampaign(id, token);
  const { data: groups = [] } = useContactGroups(token);
  const { data: steps = [] } = useCampaignSteps(id, token);
  const showResults = campaign && campaign.status !== 'draft';
  const { data: stats } = useCampaignStats(showResults ? id : null, token);
  const { data: analytics } = useCampaignAnalytics(showResults ? id : null, token);

  const updateCampaign = useUpdateCampaign(id, token);
  const sendCampaign = useSendCampaign(id, token);
  const addStep = useAddCampaignStep(id, token);
  const deleteStep = useDeleteCampaignStep(id, token);

  const handleSave = async (data: CampaignUpdateInput) => {
    const res = await updateCampaign.mutateAsync(data);
    if (res.status === true) {
      success('Campaign saved');
    } else {
      toastError('Failed to save campaign', { description: typeof res.response === 'string' ? res.response : undefined });
    }
  };

  const handleSend = async () => {
    const res = await sendCampaign.mutateAsync();
    if (res.status === true) {
      success('Campaign started');
    } else {
      toastError('Failed to send campaign', { description: typeof res.response === 'string' ? res.response : undefined });
    }
  };

  const handleAddStep = async (data: CampaignStepInput) => {
    const res = await addStep.mutateAsync(data);
    if (res.status === true) {
      success('Step added');
    } else {
      toastError('Failed to add step', { description: typeof res.response === 'string' ? res.response : undefined });
    }
  };

  const handleDeleteStep = async (stepId: number) => {
    const res = await deleteStep.mutateAsync(stepId);
    if (res.status !== true) {
      toastError('Failed to remove step', { description: typeof res.response === 'string' ? res.response : undefined });
    }
  };

  return (
    <CampaignDetailView
      campaign={campaign}
      groups={groups}
      steps={steps}
      stats={stats}
      analytics={analytics}
      isSaving={updateCampaign.isPending}
      isSending={sendCampaign.isPending}
      isAddingStep={addStep.isPending}
      onSave={handleSave}
      onSend={handleSend}
      onAddStep={handleAddStep}
      onDeleteStep={handleDeleteStep}
    />
  );
}
