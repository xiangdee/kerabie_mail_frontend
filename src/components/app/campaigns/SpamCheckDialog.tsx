'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context/auth.context';
import { useSpamCheck } from '@/lib/hooks/useMailAnalytics';

const MONO = "font-[family-name:var(--font-plex-mono)]";

const RISK_META = {
  low: { icon: ShieldCheck, color: 'var(--color-console-accent)', label: 'Low risk' },
  medium: { icon: ShieldAlert, color: 'var(--color-console-amber)', label: 'Medium risk' },
  high: { icon: ShieldX, color: '#c0392b', label: 'High risk' },
} as const;

interface Props {
  subject: string;
  bodyHtml: string;
  trigger: React.ReactNode;
}

// Heuristic, not a guarantee of inbox placement -- see the backend's
// app/utils/spam_check.py for what it actually checks.
export default function SpamCheckDialog({ subject, bodyHtml, trigger }: Props) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const spamCheck = useSpamCheck(token);

  useEffect(() => {
    if (!open) return;
    spamCheck.mutate({ subject, body_html: bodyHtml, body_text: bodyHtml.replace(/<[^>]+>/g, '') });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const result = spamCheck.data;
  const meta = result ? RISK_META[result.risk_level] : null;
  const Icon = meta?.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Spam risk check</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {spamCheck.isPending ? (
            <div className="flex items-center justify-center py-8 text-console-muted">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Checking…
            </div>
          ) : result ? (
            <>
              <div className="flex items-center gap-3 border border-console-border p-3">
                {Icon && <Icon className="h-6 w-6 shrink-0" style={{ color: meta!.color }} />}
                <div>
                  <p className="font-medium" style={{ color: meta!.color }}>{meta!.label}</p>
                  <p className={cn(MONO, 'text-[11px] text-console-muted2')}>Score {result.score}/100 — not a guarantee of inbox placement.</p>
                </div>
              </div>
              {result.issues.length === 0 ? (
                <p className="text-sm text-console-muted py-4 text-center">No issues found.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.issues.map((issue) => (
                    <div key={issue.rule} className="text-[13px] border border-console-border-soft p-3">
                      <span className={cn(
                        MONO, 'inline-block text-[9.5px] uppercase tracking-[0.08em] font-medium mr-2 px-1.5 py-0.5 border',
                      )} style={{
                        borderColor: issue.severity === 'high' ? '#c0392b' : issue.severity === 'medium' ? 'var(--color-console-amber)' : 'var(--color-console-muted3)',
                        color: issue.severity === 'high' ? '#c0392b' : issue.severity === 'medium' ? 'var(--color-console-amber)' : 'var(--color-console-muted3)',
                      }}>
                        {issue.severity}
                      </span>
                      {issue.message}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
