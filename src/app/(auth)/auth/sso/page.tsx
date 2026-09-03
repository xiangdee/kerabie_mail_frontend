'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { customAxiosPost } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';

export default function SsoPage() {
  return (
    <Suspense fallback={null}>
      <SsoPageInner />
    </Suspense>
  );
}

// Mobile-app entry point: opens this with ?token=<one-time SSO token>&redirect=<path>
// (e.g. to land signed-in straight on Settings > Billing to manage an
// App Store/Play Store subscription). Exchanges the token for real auth
// cookies via POST /auth/portal-exchange, then hands off to `redirect`.
function SsoPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const redirect = searchParams.get('redirect');
    const target = redirect && redirect.startsWith('/') ? redirect : '/app';

    if (!token) {
      router.replace('/auth/login');
      return;
    }

    customAxiosPost(`${apiLink}/auth/portal-exchange`, { token }, '')
      .then((res) => {
        if (res.status === true) {
          router.replace(target);
        } else {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
  }, [searchParams, router]);

  if (failed) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          This sign-in link has expired or already been used.
        </p>
        <a href="/auth/login" className="text-primary text-sm font-medium hover:underline">
          Go to login
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}
