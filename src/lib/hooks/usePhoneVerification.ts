import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { PhoneStatus } from '@/lib/types/api.types';

const base = apiLink;

export function usePhoneStatus(token: string | null) {
  return useQuery({
    queryKey: ['phone-status', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/phone/status`, undefined, token ?? undefined);
      return res.status === true ? (res.response as PhoneStatus) : null;
    },
    enabled: true,
  });
}

export function useSendOtp(token: string | null) {
  return useMutation({
    mutationFn: (phone: string) =>
      customAxiosPost(`${base}/phone/send-otp`, { phone }, '', token ?? ''),
  });
}

export function useVerifyOtp(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    // Backend's VerifyOTPRequest expects `otp`, not `code` — sending `code`
    // (the old body shape here) fails Pydantic validation with a 422 on
    // every attempt, so verification could never actually succeed.
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      customAxiosPost(`${base}/phone/verify-otp`, { phone, otp: code }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['phone-status'] }),
  });
}
