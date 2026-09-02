'use client';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const MONO = "font-[family-name:var(--font-plex-mono)]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2 mb-1.5')}>{children}</div>;
}

interface Props {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  minHeight?: number;
  placeholder?: string;
}

// Mirrors the code/preview split TemplateEditor.tsx already uses (an iframe
// with srcDoc renders the actual markup) — a raw-HTML textarea alone doesn't
// show what a recipient would see.
export function HtmlBodyField({ label = 'Body (HTML)', value, onChange, disabled, minHeight = 180, placeholder = '<p>Hello!</p>' }: Props) {
  const [tab, setTab] = useState<'code' | 'preview'>('code');

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <FieldLabel>{label}</FieldLabel>
        <div className="flex border border-console-border h-6 shrink-0">
          {(['code', 'preview'] as const).map((t) => (
            <button
              key={t} type="button" onClick={() => setTab(t)}
              className={cn(MONO, 'px-2.5 text-[9.5px] tracking-[0.08em] uppercase', tab === t ? 'bg-console-ink text-white' : 'text-console-muted')}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {tab === 'code' ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="font-mono text-[13px]"
          style={{ minHeight }}
          placeholder={placeholder}
        />
      ) : value.trim() ? (
        <iframe title="Body preview" srcDoc={value} className="w-full border border-console-border bg-white" style={{ minHeight }} />
      ) : (
        <div className="border border-console-border bg-white flex items-center justify-center text-sm text-console-muted" style={{ minHeight }}>
          Nothing to preview yet.
        </div>
      )}
    </div>
  );
}
