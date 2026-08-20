'use client';
import { useAuth } from '@/lib/context/auth.context';
import { useCampaigns } from '@/lib/hooks/useCampaigns';
import CampaignsListView from '@/components/app/campaigns/CampaignsListView';

export default function CampaignsPage() {
  const { token } = useAuth();
  const { data: campaigns, isLoading } = useCampaigns(token);

  return <CampaignsListView campaigns={campaigns} isLoading={isLoading} />;
}
