'use client';
import { cn } from '@/lib/utils';

const MONO = "font-[family-name:var(--font-plex-mono)]";

interface Props {
  query: string;
  options: string[];
  onPick: (name: string) => void;
  className?: string;
}

// Shared {{variable}} suggestion dropdown — used by both the legacy HTML
// textarea and the canvas's contentEditable block fields so "type {{" gives
// the same autocomplete everywhere in the editor, not just the HTML tab.
export function VariableMenu({ query, options, onPick, className }: Props) {
  const matches = options.filter((v) => v.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className={cn('z-30 w-56 max-h-56 overflow-y-auto bg-white border border-console-border shadow-lg', className)}>
      {matches.length === 0 ? (
        <p className="text-xs text-console-muted p-2.5">No matching variables — keep typing to name a new one.</p>
      ) : (
        matches.map((v) => (
          <button
            key={v}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onPick(v); }}
            className={cn(MONO, 'w-full text-left px-2.5 py-1.5 text-xs text-console-ink hover:bg-console-accent-tint hover:text-console-accent border-b border-console-border-soft last:border-b-0')}
          >
            {'{{' + v + '}}'}
          </button>
        ))
      )}
    </div>
  );
}
