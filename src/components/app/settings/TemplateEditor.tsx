'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, Monitor, Smartphone, Copy, Check, Plus, X, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog, useAppToast } from '@/components/ui/app-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context/auth.context';
import {
  TEMPLATE_ACCENTS, TEMPLATE_FONTS, TEMPLATE_DESIGN_LIST,
  DEFAULT_SAMPLE_VALUES, extractTemplateVariables, fillTemplateVariables,
  type DesignKey,
} from '@/lib/constants/templateDesigns';
import { STARTER_DOCUMENTS, renderDocument, type Section, type TemplateMeta } from '@/lib/constants/templateBlocks';
import { detectBraceQuery } from '@/lib/utils/braceAutocomplete';
import { VariableMenu } from './VariableMenu';
import { TemplateCanvas } from './TemplateCanvas';
import type { EmailTemplate } from '@/lib/hooks/useTemplates';
import { useHistoryState } from '@/lib/hooks/useHistoryState';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

interface SaveData { name: string; subject?: string; body_html: string; is_shared: boolean; content_json?: string }

interface Props {
  backHref: string;
  initialDesign?: DesignKey;
  initialTemplate?: EmailTemplate;
  isSaving: boolean;
  onSave: (data: SaveData) => void;
}

function parseContentJson(raw: string | null | undefined): { meta: Partial<TemplateMeta>; sections: Section[] } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.sections)) return parsed;
  } catch {
    // fall through — old/corrupt content_json falls back to legacy HTML mode
  }
  return null;
}

export function TemplateEditor({ backHref, initialDesign, initialTemplate, isSaving, onSave }: Props) {
  const startDesign = TEMPLATE_DESIGN_LIST.find((d) => d.key === (initialDesign ?? 'blank'))!;
  const loaded = useMemo(() => parseContentJson(initialTemplate?.content_json), [initialTemplate]);

  const [name, setName] = useState(initialTemplate?.name ?? startDesign.label);
  const [subject, setSubject] = useState(initialTemplate?.subject ?? startDesign.subject);
  const [isShared, setIsShared] = useState(initialTemplate?.is_shared ?? false);

  const [designKey, setDesignKey] = useState<DesignKey>(initialDesign ?? 'blank');
  const [accent, setAccent] = useState(loaded?.meta.accent ?? TEMPLATE_ACCENTS[0].value);
  const [font, setFont] = useState(loaded?.meta.font ?? TEMPLATE_FONTS[0].id);
  const [width, setWidth] = useState(loaded?.meta.width ?? 560);
  const [dark, setDark] = useState(loaded?.meta.dark ?? true);
  const [css, setCss] = useState(loaded?.meta.css ?? '');

  // sections !== null -> block-editing mode (canvas). null -> legacy/manual
  // raw-HTML mode (either an old template saved before the block editor
  // existed, or one where HTML was hand-edited past what blocks express).
  const initialSections = initialTemplate
    ? (loaded?.sections ?? null)
    : STARTER_DOCUMENTS[initialDesign ?? 'blank'];
  const { state: sections, setState: setSections, undo, redo, canUndo, canRedo } = useHistoryState<Section[] | null>(initialSections);
  const [legacyHtml, setLegacyHtml] = useState<string | null>(initialTemplate && !loaded ? initialTemplate.body_html : null);
  const [confirmRerender, setConfirmRerender] = useState(false);

  const { success, error: toastError } = useAppToast();
  const { token } = useAuth();
  const [copiedId, setCopiedId] = useState(false);
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [varMenu, setVarMenu] = useState<{ query: string; start: number } | null>(null);

  const [panel, setPanel] = useState<'design' | 'html' | 'css' | 'data'>('design');
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');
  const [fillSample, setFillSample] = useState(true);
  const [sampleValues, setSampleValues] = useState<Record<string, string>>({ ...DEFAULT_SAMPLE_VALUES });
  const [newSampleKey, setNewSampleKey] = useState('');

  const handleCopyId = async () => {
    if (!initialTemplate) return;
    await navigator.clipboard.writeText(String(initialTemplate.id));
    setCopiedId(true);
    success('Template ID copied');
    setTimeout(() => setCopiedId(false), 1500);
  };

  const meta: TemplateMeta = useMemo(() => ({ accent, font, width, dark, css }), [accent, font, width, dark, css]);
  const html = sections ? renderDocument({ meta, sections }) : (legacyHtml ?? '');
  const tokens = useMemo(() => extractTemplateVariables(subject, html), [subject, html]);
  const previewSubject = fillTemplateVariables(subject, fillSample ? sampleValues : {});
  const previewHtml = fillTemplateVariables(html, fillSample ? sampleValues : {});

  useEffect(() => {
    setSampleValues((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const tkn of tokens) {
        if (!(tkn in next)) { next[tkn] = DEFAULT_SAMPLE_VALUES[tkn] ?? ''; changed = true; }
      }
      return changed ? next : prev;
    });
  }, [tokens]);

  const doRerender = () => {
    setSections(STARTER_DOCUMENTS[designKey]);
    setLegacyHtml(null);
    setConfirmRerender(false);
  };

  const addSampleKey = () => {
    const key = newSampleKey.trim().replace(/[^a-zA-Z0-9_]/g, '_');
    if (!key || key in sampleValues) return;
    setSampleValues((prev) => ({ ...prev, [key]: '' }));
    setNewSampleKey('');
  };
  const removeSampleKey = (key: string) => {
    setSampleValues((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const knownVariables = useMemo(
    () => [...new Set([...tokens, ...Object.keys(sampleValues)])].sort(),
    [tokens, sampleValues],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const tag = (e.target as HTMLElement)?.tagName;
      // Let undo/redo inside a text field (browser-native) take priority —
      // only intercept for canvas-level structural undo otherwise.
      if (tag === 'TEXTAREA' || tag === 'INPUT') return;
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Editing raw HTML directly detaches from the block canvas — the same
    // one-way transition the old htmlOverride model had; the way back is
    // the explicit "Re-render from design" action below.
    setSections(null);
    setLegacyHtml(value);

    const cursor = e.target.selectionStart;
    const before = value.slice(0, cursor);
    const bq = detectBraceQuery(before);
    setVarMenu(bq);
  };

  const insertVariable = (nameToInsert: string) => {
    if (!varMenu) return;
    const cursor = htmlTextareaRef.current?.selectionStart ?? varMenu.start + 2 + varMenu.query.length;
    const next = html.slice(0, varMenu.start) + '{{' + nameToInsert + '}}' + html.slice(cursor);
    setSections(null);
    setLegacyHtml(next);
    setVarMenu(null);
    requestAnimationFrame(() => {
      const pos = varMenu.start + nameToInsert.length + 4;
      htmlTextareaRef.current?.focus();
      htmlTextareaRef.current?.setSelectionRange(pos, pos);
    });
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      subject: subject.trim() || undefined,
      body_html: html,
      is_shared: isShared,
      content_json: sections ? JSON.stringify({ meta, sections }) : undefined,
    });
  };

  const isDirty =
    html !== (initialTemplate?.body_html ?? '') ||
    name !== (initialTemplate?.name ?? startDesign.label) ||
    subject !== (initialTemplate?.subject ?? startDesign.subject);

  const showCanvas = panel === 'design' && sections !== null;

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <div className="border-b border-console-border px-4 sm:px-6 py-3 flex items-center gap-3.5 flex-wrap bg-console-bg">
        <Link href={backHref}>
          <Button variant="outline" size="sm" className="h-8 text-xs">← Templates</Button>
        </Link>
        <div className="min-w-0">
          <div className={cn(DISPLAY, 'font-semibold text-xl leading-tight truncate')}>{name || 'Untitled template'}</div>
          <div className="flex items-center gap-2.5">
            <span className={cn(MONO, 'text-[10px] text-console-muted2 tracking-[0.06em]')}>
              {isSaving ? 'SAVING…' : isDirty ? 'UNSAVED CHANGES' : 'SAVED'}
            </span>
            {initialTemplate && (
              <button
                type="button" onClick={handleCopyId} title="Copy template ID — use this with POST /mail/send's template_id"
                className={cn(MONO, 'flex items-center gap-1 text-[10px] text-console-muted2 hover:text-console-accent tracking-[0.06em]')}
              >
                {copiedId ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                ID {initialTemplate.id}
              </button>
            )}
          </div>
        </div>
        <div className="flex-1" />
        {sections !== null && (
          <div className="flex border border-console-border h-8">
            <button type="button" title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={undo} className="w-8 flex items-center justify-center text-console-muted disabled:opacity-30 hover:text-console-accent border-r border-console-border">
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button type="button" title="Redo (Ctrl+Y)" disabled={!canRedo} onClick={redo} className="w-8 flex items-center justify-center text-console-muted disabled:opacity-30 hover:text-console-accent">
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="flex border border-console-border h-8">
          <button type="button" onClick={() => setView('desktop')} className={cn('px-3 flex items-center gap-1.5 text-xs', view === 'desktop' ? 'bg-console-ink text-white' : 'text-console-muted')}>
            <Monitor className="h-3.5 w-3.5" />Desktop
          </button>
          <button type="button" onClick={() => setView('mobile')} className={cn('px-3 flex items-center gap-1.5 text-xs', view === 'mobile' ? 'bg-console-ink text-white' : 'text-console-muted')}>
            <Smartphone className="h-3.5 w-3.5" />Mobile
          </button>
        </div>
        <button
          type="button" onClick={() => setFillSample((v) => !v)}
          className={cn(MONO, 'h-8 px-3 border text-[10px] tracking-[0.06em]', fillSample ? 'border-console-accent text-console-accent' : 'border-console-border text-console-muted')}
        >
          {fillSample ? 'SAMPLE DATA ON' : 'SAMPLE DATA OFF'}
        </button>
        <Button size="sm" onClick={handleSave} disabled={isSaving || !name.trim()} className="h-8 gap-1.5">
          {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save
        </Button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex flex-col border-r border-console-border lg:overflow-y-auto lg:w-[380px] lg:shrink-0">
          <div className="flex items-center border-b border-console-border sticky top-0 bg-console-bg z-10">
            {(['design', 'html', 'css', 'data'] as const).map((p) => (
              <button
                key={p} type="button" onClick={() => setPanel(p)}
                className={cn(MONO, 'flex-1 border-b-2 py-3 text-[10px] tracking-[0.08em] uppercase', panel === p ? 'border-console-accent text-console-ink' : 'border-transparent text-console-muted2')}
              >
                {p}
              </button>
            ))}
          </div>

          {panel === 'design' && (
            <div className="p-4 sm:p-5 space-y-5">
              <div className="space-y-1.5">
                <Label className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2')}>TEMPLATE NAME</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2')}>SUBJECT LINE</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} className={cn(MONO, 'text-xs')} />
                <p className="text-xs text-console-muted2 truncate">{subject.length} characters · previews as "{previewSubject}"</p>
              </div>
              <div className="flex items-center justify-between border border-console-border px-3 py-2.5">
                <div>
                  <p className="text-xs font-medium">Share with team</p>
                  <p className="text-[11px] text-console-muted2">Visible to shared-inbox teammates too.</p>
                </div>
                <Switch checked={isShared} onCheckedChange={setIsShared} />
              </div>

              <div className="space-y-2">
                <Label className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2')}>BASE DESIGN</Label>
                <Select value={designKey} onValueChange={(v) => setDesignKey(v as DesignKey)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_DESIGN_LIST.map((d) => (
                      <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setConfirmRerender(true)}>
                  Re-render from design
                </Button>
                {sections === null && (
                  <p className="text-xs text-console-muted2">
                    This template uses raw HTML{initialTemplate ? ' (saved before the visual builder)' : ''} — edit it directly in the HTML tab, or re-render from a design above to get an editable canvas here.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2')}>ACCENT COLOUR</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {TEMPLATE_ACCENTS.map((a) => (
                    <button
                      key={a.value} type="button" title={a.name} onClick={() => setAccent(a.value)}
                      className="h-8 w-8 shrink-0"
                      style={{ background: a.value, border: accent === a.value ? '2px solid #14171a' : '1px solid #d7d9d3' }}
                    />
                  ))}
                  <input
                    type="color" value={accent} onChange={(e) => setAccent(e.target.value)}
                    title="Custom colour" className="h-8 w-8 shrink-0 border border-console-border cursor-pointer bg-transparent p-0"
                  />
                </div>
                <p className="text-xs text-console-muted2">The default color for buttons and section backgrounds set to "track accent" — override per-block in the canvas.</p>
              </div>

              <div className="space-y-1.5">
                <Label className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2')}>WEB FONT</Label>
                <Select value={font} onValueChange={setFont}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_FONTS.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-console-muted2">{TEMPLATE_FONTS.find((f) => f.id === font)?.note}</p>
              </div>

              <div className="space-y-1.5">
                <Label className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2')}>CONTENT WIDTH — {width}PX</Label>
                <input type="range" min={480} max={720} step={20} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-[#1c6b47]" />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} className="h-4 w-4 accent-[#1c6b47]" />
                <span className="text-xs">Include a dark-mode colour scheme</span>
              </label>
            </div>
          )}

          {panel === 'html' && (
            <div className="p-4 flex flex-col gap-2.5 flex-1 min-h-0">
              <div className="flex items-center gap-2">
                <span className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2')}>HTML BODY</span>
                <div className="flex-1" />
                <button
                  type="button" onClick={() => setConfirmRerender(true)}
                  className={cn(MONO, 'text-[10px] tracking-[0.05em] border border-console-border px-2.5 py-1 text-console-muted hover:border-console-accent hover:text-console-accent transition-colors')}
                >
                  RE-RENDER FROM DESIGN
                </button>
              </div>
              <div className="relative flex-1 min-h-0 flex flex-col">
                <Textarea
                  ref={htmlTextareaRef}
                  value={html}
                  onChange={handleHtmlChange}
                  onBlur={() => setTimeout(() => setVarMenu(null), 150)}
                  spellCheck={false}
                  className={cn(MONO, 'flex-1 min-h-[340px] text-[11px] leading-relaxed bg-console-sidebar-bg text-[#cfd8d1] border-none rounded-none')}
                />
                {varMenu && (
                  <VariableMenu query={varMenu.query} options={knownVariables} onPick={insertVariable} className="absolute top-1 right-1" />
                )}
              </div>
              <p className={cn(MONO, 'text-[10px] text-console-muted2')}>{html.length.toLocaleString()} chars · {tokens.length} placeholders</p>
              {sections !== null && (
                <p className="text-xs text-console-muted2">This reflects the canvas on the Design tab. Editing here directly switches to raw-HTML mode.</p>
              )}
            </div>
          )}

          {panel === 'css' && (
            <div className="p-4 flex flex-col gap-2.5 flex-1 min-h-0">
              <span className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2')}>CUSTOM CSS</span>
              <Textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                spellCheck={false}
                placeholder="/* baked into the template's <style> block */"
                className={cn(MONO, 'flex-1 min-h-[340px] text-[11px] leading-relaxed bg-console-sidebar-bg text-[#cfd8d1] border-none rounded-none')}
              />
              <p className="text-xs text-console-muted2">Applies on top of both the canvas and raw-HTML modes.</p>
            </div>
          )}

          {panel === 'data' && (() => {
            const extraKeys = Object.keys(sampleValues).filter((k) => !tokens.includes(k));
            return (
              <div className="p-4 sm:p-5 space-y-3">
                <p className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2')}>PLACEHOLDERS IN THIS TEMPLATE</p>
                {tokens.length === 0 ? (
                  <p className="text-sm text-console-muted2">No {'{{placeholders}}'} found yet.</p>
                ) : tokens.map((tkn) => (
                  <div key={tkn} className="flex items-center gap-3 border-b border-console-border-soft pb-2.5">
                    <span className={cn(MONO, 'text-xs text-console-accent shrink-0 w-2/5 truncate')}>{'{{' + tkn + '}}'}</span>
                    <Input value={sampleValues[tkn] ?? ''} onChange={(e) => setSampleValues((prev) => ({ ...prev, [tkn]: e.target.value }))} className="h-8 text-sm" />
                  </div>
                ))}
                {extraKeys.length > 0 && (
                  <>
                    <p className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2 pt-2')}>EXTRA SAMPLE DATA</p>
                    {extraKeys.map((k) => (
                      <div key={k} className="flex items-center gap-3 border-b border-console-border-soft pb-2.5">
                        <span className={cn(MONO, 'text-xs text-console-muted shrink-0 w-2/5 truncate')}>{'{{' + k + '}}'}</span>
                        <Input value={sampleValues[k] ?? ''} onChange={(e) => setSampleValues((prev) => ({ ...prev, [k]: e.target.value }))} className="h-8 text-sm" />
                        <button type="button" onClick={() => removeSampleKey(k)} className="text-console-muted2 hover:text-console-red shrink-0">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <Input value={newSampleKey} onChange={(e) => setNewSampleKey(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSampleKey(); } }} placeholder="add a placeholder key…" className={cn(MONO, 'h-8 text-xs')} />
                  <Button type="button" size="sm" variant="outline" className="h-8 px-2.5 shrink-0" onClick={addSampleKey}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-console-muted2">Sample values are for preview only — real values are filled in when you send.</p>
              </div>
            );
          })()}
        </div>

        {/* Preview / canvas stage */}
        <div className="relative bg-[#e7e9e3] flex flex-col min-h-[480px] flex-1 min-w-0 overflow-y-auto">
          <div className="flex items-center justify-center flex-1 p-5 sm:p-7">
            {showCanvas ? (
              <div className="w-full" style={{ maxWidth: view === 'mobile' ? 390 : width + 160 }}>
                <div className="border-b border-console-border-soft px-1 pb-2 mb-2">
                  <div className={cn(MONO, 'text-[9.5px] tracking-[0.1em] text-console-muted2')}>SUBJECT PREVIEW</div>
                  <div className="font-semibold text-sm mt-1 truncate">{previewSubject || '(no subject)'}</div>
                </div>
                <TemplateCanvas sections={sections!} meta={meta} knownVariables={knownVariables} onChange={setSections} token={token} />
              </div>
            ) : (
              <div className="bg-white border border-[#c9cdc6] shadow-[0_18px_40px_rgba(14,18,16,.10)] overflow-hidden flex flex-col w-full" style={{ maxWidth: view === 'mobile' ? 390 : width + 120 }}>
                <div className="border-b border-console-border-soft px-4 py-3 bg-white">
                  <div className={cn(MONO, 'text-[9.5px] tracking-[0.1em] text-console-muted2')}>SUBJECT PREVIEW</div>
                  <div className="font-semibold text-sm mt-1 truncate">{previewSubject || '(no subject)'}</div>
                </div>
                <iframe title="Template preview" srcDoc={previewHtml} className="w-full flex-1 min-h-[420px] border-0" />
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmRerender}
        title="Re-render from design?"
        description="This replaces the current content with a freshly generated version from the design tab. Any manual edits will be lost."
        variant="warning"
        confirmLabel="Re-render"
        onConfirm={doRerender}
        onCancel={() => setConfirmRerender(false)}
      />
    </div>
  );
}
