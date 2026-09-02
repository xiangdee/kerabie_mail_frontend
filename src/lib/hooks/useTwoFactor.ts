import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/services/auth.service';

export interface TwoFactorStatus {
  enabled: boolean;
}

export function useTwoFactorStatus(token: string | null) {
  return useQuery({
    queryKey: ['2fa-status', token],
    queryFn: async () => {
      const res = await authService.get2faStatus(token);
      return res.status === true ? (res.response as TwoFactorStatus) : { enabled: false };
    },
  });
}
