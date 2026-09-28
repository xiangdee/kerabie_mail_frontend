'use client';
import { useAuth } from '@/lib/context/auth.context';
import { useIntegrations } from '@/lib/hooks/useIntegrations';
import ToolsView from '@/components/app/tools/ToolsView';

export default function ToolsPage() {
  const { token } = useAuth();
  const { data: integrations = [], isLoading } = useIntegrations(token);

  return (
    <div className="px-4 py-4 sm:px-8 sm:py-7">
      <ToolsView integrations={integrations} isLoading={isLoading} />
    </div>
  );
}
