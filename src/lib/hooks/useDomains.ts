import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { Domain } from '@/lib/types/api.types';

const base = apiLink;

export function useDomains(token: string | null) {
  return useQuery({
    queryKey: ['domains', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/domains`, undefined, token ?? undefined);
      return res.status === true ? (res.response as Domain[]) : ([] as Domain[]);
    },
    enabled: true,
  });
}

export interface DomainUsage {
  used: number;
  limit: number;
}

export function useDomainUsage(token: string | null) {
  return useQuery({
    queryKey: ['domain-usage', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/domains/usage`, undefined, token ?? undefined);
      return res.status === true ? (res.response as DomainUsage) : null;
    },
    enabled: true,
  });
}

export function useAddDomain(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) =>
      customAxiosPost(`${base}/domains`, { domain }, '', token ?? ''),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['domains'] });
      qc.invalidateQueries({ queryKey: ['domain-usage'] });
    },
  });
}

export function useDeleteDomain(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosDelete(`${base}/domains/${id}`, undefined, token ?? ''),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['domains'] });
      qc.invalidateQueries({ queryKey: ['domain-usage'] });
    },
  });
}

export function useVerifyDomain(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    // Backend route is GET /domains/{id}/verify (app/routes/domains.py's
    // check_domain_verification -- it does the recheck-and-persist as a
    // side effect of a GET, not a separate POST). This was POSTing, which
    // 405'd against every real verify attempt.
    mutationFn: (id: number) =>
      customAxiosGet(`${base}/domains/${id}/verify`, undefined, token ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  });
}

export function useSetDomainNoReply(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { id: number; no_reply_domain: boolean }) =>
      customAxiosRequest('patch', `${base}/domains/${opts.id}/no-reply`, { no_reply_domain: opts.no_reply_domain }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  });
}

export function useSetDomainBimi(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { id: number; bimi_logo_url: string | null; bimi_vmc_url: string | null }) =>
      customAxiosRequest('patch', `${base}/domains/${opts.id}/bimi`, {
        bimi_logo_url: opts.bimi_logo_url || null,
        bimi_vmc_url: opts.bimi_vmc_url || null,
      }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Same queued-upload-then-poll shape as useUploadTemplateImage (useTemplates.ts)
// — the actual B2 upload + SVG validation happens in a Celery task, which
// also sets bimi_logo_url on the domain directly once it succeeds.
export function useUploadBimiLogo(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    onSuccess: (res) => { if (res.status === true) qc.invalidateQueries({ queryKey: ['domains'] }); },
    mutationFn: async (opts: { domainId: number; file: File }) => {
      const queued = await customAxiosPost(`${base}/domains/${opts.domainId}/bimi/logo`, { file: opts.file }, 'upload', token ?? '');
      if (queued.status !== true) return queued;
      const jobId = (queued.response as { job_id: string }).job_id;

      for (let attempt = 0; attempt < 40; attempt++) {
        await sleep(1000);
        const poll = await customAxiosGet(`${base}/domains/${opts.domainId}/bimi/logo/${jobId}`, undefined, token ?? undefined);
        if (poll.status !== true) return poll;
        const body = poll.response as { status: 'pending' | 'done' | 'failed'; url?: string; error?: string };
        if (body.status === 'done') {
          return { status: true, response: { url: body.url }, statusCode: 200 };
        }
        if (body.status === 'failed') {
          return { status: false, response: body.error ?? 'Upload failed.', statusCode: 500 };
        }
      }
      return { status: false, response: 'Upload timed out.', statusCode: 504 };
    },
  });
}

export function useSendDnsInstructions(token: string | null) {
  return useMutation({
    mutationFn: (opts: { domain: string; developer_email: string; developer_name?: string; message?: string }) =>
      customAxiosPost(
        `${base}/mail/send-dns-instructions`,
        {
          email_address: `admin@${opts.domain}`,
          developer_email: opts.developer_email,
          developer_name: opts.developer_name,
          message: opts.message,
        },
        '',
        token ?? ''
      ),
  });
}
