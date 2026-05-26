'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app/AppSidebar';
import { useAuth } from '@/lib/context/auth.context';
import { Skeleton } from '@/components/ui/skeleton';
import { usePhoneStatus } from '@/lib/hooks/usePhoneVerification';
import PhoneVerificationModal from '@/components/app/PhoneVerificationModal';

function PhoneVerificationGate({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const { data: phoneStatus, refetch } = usePhoneStatus(token);
  const [dismissed, setDismissed] = useState(false);

  const isTrial = user && (user as any).plan_status === 'trial';
  const needsVerification =
    isTrial &&
    phoneStatus !== undefined &&
    phoneStatus !== null &&
    !phoneStatus.is_verified &&
    !dismissed;

  return (
    <>
      {children}
      {token && needsVerification && (
        <PhoneVerificationModal
          open
          token={token}
          onVerified={() => {
            refetch();
            setDismissed(true);
          }}
        />
      )}
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-56 border-r p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="flex items-center h-12 border-b px-4 shrink-0">
          <SidebarTrigger className="-ml-1" />
        </div>
        <div className="flex-1 overflow-auto">
          <PhoneVerificationGate>
            {children}
          </PhoneVerificationGate>
        </div>
      </main>
    </SidebarProvider>
  );
}
