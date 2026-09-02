import { cn } from '@/lib/utils';

// Corner registration marks from the "Kerabie Console" design — four "+"
// glyphs pinned to the corners of a `position:relative` bordered panel.
// Parent needs `relative` and enough padding that content doesn't sit
// under the -6px overhang.
export function PlusCorners({
  tone = 'text-console-tick', variant = 'all',
}: { tone?: string; variant?: 'all' | 'diagonal' }) {
  const base = cn('pointer-events-none absolute font-[family-name:var(--font-plex-mono)] text-[11px]', tone);
  if (variant === 'diagonal') {
    return (
      <>
        <i aria-hidden className={cn(base, '-top-1.5 -left-1.5')}>+</i>
        <i aria-hidden className={cn(base, '-bottom-1.5 -right-1.5')}>+</i>
      </>
    );
  }
  return (
    <>
      <i aria-hidden className={cn(base, '-top-1.5 -left-1.5')}>+</i>
      <i aria-hidden className={cn(base, '-top-1.5 -right-1.5')}>+</i>
      <i aria-hidden className={cn(base, '-bottom-1.5 -left-1.5')}>+</i>
      <i aria-hidden className={cn(base, '-bottom-1.5 -right-1.5')}>+</i>
    </>
  );
}
