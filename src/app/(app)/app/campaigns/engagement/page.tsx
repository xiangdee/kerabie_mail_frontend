'use client';
import { useAuth } from '@/lib/context/auth.context';
import { useContactEngagement } from '@/lib/hooks/useCampaigns';
import ContactEngagementView from '@/components/app/campaigns/ContactEngagementView';

export default function ContactEngagementPage() {
  const { token } = useAuth();
  const { data: contacts, isLoading } = useContactEngagement(token);

  return <ContactEngagementView contacts={contacts} isLoading={isLoading} />;
}
