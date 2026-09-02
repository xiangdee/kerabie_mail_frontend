'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Plus, Trash2, ChevronUp, ChevronDown, ImagePlus, Images, Loader2,
  AlignLeft, AlignCenter, Bold, Italic, Link as LinkIcon, Copy, GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmDialog, useAppToast } from '@/components/ui/app-toast';
import { VariableMenu } from './VariableMenu';
import { detectBraceQuery, getTextBeforeCaret, replaceTextRange, currentCaretOffset } from '@/lib/utils/braceAutocomplete';
import {
  type Section, type Block, type BlockType, type TemplateMeta, type HeadingBlock, type TextBlock, type ButtonBlock, type ImageBlock,
  newBlock, newSection, cloneSection, BLOCK_TYPE_LABELS,
} from '@/lib/constants/templateBlocks';
import { useUploadTemplateImage, useTemplateImageGallery, useDeleteTemplateImage } from '@/lib/hooks/useTemplates';

const MONO = "font-[family-name:var(--font-plex-mono)]";

interface CanvasProps {
  sections: Section[];
  meta: TemplateMeta;
  knownVariables: string[];
  onChange: (sections: Section[]) => void;
  token: string | null;
}

export function TemplateCanvas({ sections, meta, knownVariables, onChange, token }: CanvasProps) {
  const [confirmDeleteSection, setConfirmDeleteSection] = useState<string | null>(null);
  const uploadImage = useUploadTemplateImage(token);
  const { data: imageGallery = [] } = useTemplateImageGallery(token);
  const deleteGalleryImage = useDeleteTemplateImage(token);

  const updateSection = (id: string, patch: Partial<Section>) =>
    onChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const updateBlock = (sectionId: string, blockId: string, patch: Partial<Block>) =>
    onChange(sections.map((s) => (s.id !== sectionId ? s : {
      ...s, blocks: s.blocks.map((b) => (b.id === blockId ? ({ ...b, ...patch } as Block) : b)),
    })));
  const removeBlock = (sectionId: string, blockId: string) =>
    onChange(sections.map((s) => (s.id !== sectionId ? s : { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) })));
  const addBlock = (sectionId: string, type: BlockType) =>
    onChange(sections.map((s) => (s.id !== sectionId ? s : { ...s, blocks: [...s.blocks, newBlock(type)] })));
  const moveSection = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const removeSection = (id: string) => onChange(sections.filter((s) => s.id !== id));
  const addSection = (afterIndex: number) => {
    const next = [...sections];
    next.splice(afterIndex + 1, 0, newSection());
    onChange(next);
  };
  const duplicateSection = (id: string) => {
    const idx = sections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const next = [...sections];
    next.splice(idx + 1, 0, cloneSection(sections[idx]));
    onChange(next);
  };
  const moveBlockWithinSection = (sectionId: string, fromBlockId: string, toBlockId: string) => {
    if (fromBlockId === toBlockId) return;
    onChange(sections.map((s) => {
      if (s.id !== sectionId) return s;
      const blocks = [...s.blocks];
      const fromIdx = blocks.findIndex((b) => b.id === fromBlockId);
      const toIdx = blocks.findIndex((b) => b.id === toBlockId);
      if (fromIdx === -1 || toIdx === -1) return s;
      const [moved] = blocks.splice(fromIdx, 1);
      blocks.splice(toIdx, 0, moved);
      return { ...s, blocks };
    }));
  };
  const dragRef = useRef<{ sectionId: string; blockId: string } | null>(null);

  return (
    <div className="mx-auto w-full" style={{ maxWidth: meta.width + 40 }}>
      <div className="bg-white border border-[#c9cdc6] shadow-[0_18px_40px_rgba(14,18,16,.10)] overflow-hidden">
        {sections.map((s, i) => (
          <SectionRow
            key={s.id}
            section={s}
            index={i}
            count={sections.length}
            meta={meta}
            knownVariables={knownVariables}
            onUpdateSection={(patch) => updateSection(s.id, patch)}
            onUpdateBlock={(blockId, patch) => updateBlock(s.id, blockId, patch)}
            onRemoveBlock={(blockId) => removeBlock(s.id, blockId)}
            onAddBlock={(type) => addBlock(s.id, type)}
            onMove={(dir) => moveSection(i, dir)}
            onDelete={() => setConfirmDeleteSection(s.id)}
            onDuplicate={() => duplicateSection(s.id)}
            uploadImage={uploadImage}
            imageGallery={imageGallery}
            onDeleteGalleryImage={(id) => deleteGalleryImage.mutate(id)}
            dragRef={dragRef}
            onReorderBlock={(fromId, toId) => moveBlockWithinSection(s.id, fromId, toId)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => addSection(sections.length - 1)}
        className={cn(MONO, 'mt-3 w-full flex items-center justify-center gap-1.5 h-9 border border-dashed border-console-border text-[10px] tracking-[0.08em] text-console-muted2 hover:border-console-accent hover:text-console-accent transition-colors')}
      >
        <Plus className="h-3.5 w-3.5" /> ADD SECTION
      </button>

      <ConfirmDialog
        open={!!confirmDeleteSection}
        title="Delete this section?"
        description="This removes every block inside it. This can't be undone."
        variant="warning"
        confirmLabel="Delete"
        onConfirm={() => { if (confirmDeleteSection) removeSection(confirmDeleteSection); setConfirmDeleteSection(null); }}
        onCancel={() => setConfirmDeleteSection(null)}
      />
    </div>
  );
}

// ---------------------------------------------------------------- section --

function SectionRow({
  section, index, count, meta, knownVariables,
  onUpdateSection, onUpdateBlock, onRemoveBlock, onAddBlock, onMove, onDelete, onDuplicate,
  uploadImage, imageGallery, onDeleteGalleryImage, dragRef, onReorderBlock,
}: {
  section: Section; index: number; count: number; meta: TemplateMeta; knownVariables: string[];
  onUpdateSection: (patch: Partial<Section>) => void;
  onUpdateBlock: (blockId: string, patch: Partial<Block>) => void;
  onRemoveBlock: (blockId: string) => void;
  onAddBlock: (type: BlockType) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  uploadImage: ReturnType<typeof useUploadTemplateImage>;
  imageGallery: ReturnType<typeof useTemplateImageGallery>['data'];
  onDeleteGalleryImage: (id: number) => void;
  dragRef: React.MutableRefObject<{ sectionId: string; blockId: string } | null>;
  onReorderBlock: (fromBlockId: string, toBlockId: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  let background = 'transparent';
  if (section.background === 'solid') background = section.bgColor || meta.accent;
  else if (section.background === 'gradient') background = `linear-gradient(135deg,${section.bgColor || meta.accent},${section.bgGradientEnd || meta.accent})`;
  const padMap: Record<Section['padding'], string> = { sm: '18px 24px', md: '28px 34px', lg: '40px 34px' };

  return (
    <div
      className="relative group/section"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background, padding: padMap[section.padding] }}
    >
      {hover && (
        <div className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1 bg-white border border-console-border shadow-sm">
          <button type="button" title="Background" onClick={() => setBgOpen((v) => !v)} className="h-6 w-6 flex items-center justify-center text-console-muted2 hover:text-console-accent border-r border-console-border-soft">
            <span className="h-3 w-3 rounded-full border border-console-border" style={{ background: section.background === 'none' ? '#fff' : background }} />
          </button>
          <button type="button" title="Move up" disabled={index === 0} onClick={() => onMove(-1)} className="h-6 w-6 flex items-center justify-center text-console-muted2 hover:text-console-accent disabled:opacity-30 border-r border-console-border-soft">
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" title="Move down" disabled={index === count - 1} onClick={() => onMove(1)} className="h-6 w-6 flex items-center justify-center text-console-muted2 hover:text-console-accent disabled:opacity-30 border-r border-console-border-soft">
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button type="button" title="Duplicate section" onClick={onDuplicate} className="h-6 w-6 flex items-center justify-center text-console-muted2 hover:text-console-accent border-r border-console-border-soft">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button type="button" title="Delete section" onClick={onDelete} className="h-6 w-6 flex items-center justify-center text-console-muted2 hover:text-console-red">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {bgOpen && (
        <div className="absolute top-8 right-1.5 z-20 bg-white border border-console-border shadow-lg p-2.5 space-y-2 w-48">
          <div className="flex gap-1.5">
            {(['none', 'solid', 'gradient'] as const).map((b) => (
              <button
                key={b} type="button" onClick={() => onUpdateSection({ background: b })}
                className={cn(MONO, 'flex-1 h-6 text-[9px] border', section.background === b ? 'border-console-accent text-console-accent' : 'border-console-border text-console-muted2')}
              >
                {b.toUpperCase()}
              </button>
            ))}
          </div>
          {section.background !== 'none' && (
            <input
              type="color" value={section.bgColor || meta.accent}
              onChange={(e) => onUpdateSection({ bgColor: e.target.value })}
              className="h-7 w-full border border-console-border cursor-pointer bg-transparent p-0"
            />
          )}
          {section.background === 'gradient' && (
            <input
              type="color" value={section.bgGradientEnd || meta.accent}
              onChange={(e) => onUpdateSection({ bgGradientEnd: e.target.value })}
              className="h-7 w-full border border-console-border cursor-pointer bg-transparent p-0"
            />
          )}
          <div className="flex gap-1.5">
            {(['sm', 'md', 'lg'] as const).map((p) => (
              <button
                key={p} type="button" onClick={() => onUpdateSection({ padding: p })}
                className={cn(MONO, 'flex-1 h-6 text-[9px] border', section.padding === p ? 'border-console-accent text-console-accent' : 'border-console-border text-console-muted2')}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-0">
        {section.blocks.map((b) => (
          <BlockRow
            key={b.id}
            block={b}
            meta={meta}
            knownVariables={knownVariables}
            onUpdate={(patch) => onUpdateBlock(b.id, patch)}
            onRemove={() => onRemoveBlock(b.id)}
            uploadImage={uploadImage}
            imageGallery={imageGallery}
            onDeleteGalleryImage={onDeleteGalleryImage}
            sectionId={section.id}
            dragRef={dragRef}
            onReorderBlock={onReorderBlock}
          />
        ))}
      </div>

      <div className="relative mt-2">
        <button
          type="button" onClick={() => setAddOpen((v) => !v)}
          className={cn(MONO, 'flex items-center gap-1 text-[9px] tracking-[0.08em] text-console-muted3 hover:text-console-accent opacity-0 group-hover/section:opacity-100 transition-opacity')}
        >
          <Plus className="h-3 w-3" /> ADD BLOCK
        </button>
        {addOpen && (
          <div className="absolute top-5 left-0 z-20 bg-white border border-console-border shadow-lg w-40">
            {(Object.keys(BLOCK_TYPE_LABELS) as BlockType[]).map((type) => (
              <button
                key={type} type="button"
                onMouseDown={(e) => { e.preventDefault(); onAddBlock(type); setAddOpen(false); }}
                className={cn(MONO, 'w-full text-left px-2.5 py-1.5 text-[10px] text-console-ink hover:bg-console-accent-tint hover:text-console-accent border-b border-console-border-soft last:border-b-0')}
              >
                {BLOCK_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ block --

function BlockRow({
  block, meta, knownVariables, onUpdate, onRemove, uploadImage, imageGallery, onDeleteGalleryImage,
  sectionId, dragRef, onReorderBlock,
}: {
  block: Block; meta: TemplateMeta; knownVariables: string[];
  onUpdate: (patch: Partial<Block>) => void;
  onRemove: () => void;
  uploadImage: ReturnType<typeof useUploadTemplateImage>;
  imageGallery: ReturnType<typeof useTemplateImageGallery>['data'];
  onDeleteGalleryImage: (id: number) => void;
  sectionId: string;
  dragRef: React.MutableRefObject<{ sectionId: string; blockId: string } | null>;
  onReorderBlock: (fromBlockId: string, toBlockId: string) => void;
}) {
  const [selected, setSelected] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selected) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setSelected(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [selected]);

  return (
    <div
      ref={wrapRef}
      onClick={() => setSelected(true)}
      onDragOver={(e) => { if (dragRef.current?.sectionId === sectionId) { e.preventDefault(); setDragOver(true); } }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const dragged = dragRef.current;
        if (dragged && dragged.sectionId === sectionId) onReorderBlock(dragged.blockId, block.id);
        dragRef.current = null;
      }}
      className={cn(
        'relative border', selected ? 'border-console-accent' : 'border-transparent',
        dragOver && 'border-t-2 border-t-console-accent',
      )}
    >
      {selected && (
        <div className="absolute -top-2.5 -right-2.5 z-20 flex items-center gap-1">
          <button
            type="button"
            draggable
            onDragStart={(e) => { dragRef.current = { sectionId, blockId: block.id }; e.dataTransfer.effectAllowed = 'move'; }}
            onDragEnd={() => { dragRef.current = null; }}
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
            className="h-5 w-5 flex items-center justify-center bg-white border border-console-border text-console-muted2 hover:text-console-accent shadow-sm cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            title="Delete block"
            className="h-5 w-5 flex items-center justify-center bg-white border border-console-border text-console-muted2 hover:text-console-red shadow-sm"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
      <table width="100%" cellPadding={0} cellSpacing={0} role="presentation"><tbody>
        <BlockContent
          block={block}
          meta={meta}
          knownVariables={knownVariables}
          selected={selected}
          onUpdate={onUpdate}
          uploadImage={uploadImage}
          imageGallery={imageGallery}
          onDeleteGalleryImage={onDeleteGalleryImage}
        />
      </tbody></table>
    </div>
  );
}

function BlockContent(props: {
  block: Block; meta: TemplateMeta; knownVariables: string[]; selected: boolean;
  onUpdate: (patch: Partial<Block>) => void;
  uploadImage: ReturnType<typeof useUploadTemplateImage>;
  imageGallery: ReturnType<typeof useTemplateImageGallery>['data'];
  onDeleteGalleryImage: (id: number) => void;
}) {
  const { block, meta, knownVariables, selected, onUpdate } = props;
  switch (block.type) {
    case 'heading':
    case 'text':
      return <EditableTextBlock block={block} meta={meta} knownVariables={knownVariables} selected={selected} onUpdate={onUpdate} />;
    case 'button':
      return <ButtonBlockRow block={block} meta={meta} selected={selected} onUpdate={onUpdate} />;
    case 'image':
      return <ImageBlockRow block={block} meta={meta} selected={selected} onUpdate={onUpdate} uploadImage={props.uploadImage} imageGallery={props.imageGallery} onDeleteGalleryImage={props.onDeleteGalleryImage} />;
    case 'divider':
      return <tr><td style={{ padding: '16px 0 0' }}><div style={{ borderTop: '1px solid #e6e8e2' }} /></td></tr>;
    case 'spacer':
      return (
        <tr><td style={{ padding: '10px 0 0' }}>
          {selected ? (
            <div className="flex items-center gap-2">
              <input type="range" min={8} max={80} step={4} value={block.height} onChange={(e) => onUpdate({ height: Number(e.target.value) } as Partial<Block>)} className="w-32 accent-[#1c6b47]" />
              <span className={cn(MONO, 'text-[10px] text-console-muted2')}>{block.height}px</span>
            </div>
          ) : (
            <div style={{ height: block.height }} />
          )}
        </td></tr>
      );
    case 'html':
      return (
        <tr><td style={{ padding: '10px 0 0' }}>
          <div className="border border-dashed border-console-border-soft p-2">
            <p className={cn(MONO, 'text-[9px] text-console-muted3 mb-1')}>CUSTOM HTML BLOCK</p>
            {selected ? (
              <textarea
                value={block.html}
                onChange={(e) => onUpdate({ html: e.target.value } as Partial<Block>)}
                spellCheck={false}
                className={cn(MONO, 'w-full min-h-[100px] text-[10px] leading-relaxed bg-console-sidebar-bg text-[#cfd8d1] p-2 border-0')}
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: `<table>${block.html}</table>` }} />
            )}
          </div>
        </td></tr>
      );
  }
}

// ------------------------------------------------------- text/heading -----

function EditableTextBlock({
  block, meta, knownVariables, selected, onUpdate,
}: { block: HeadingBlock | TextBlock; meta: TemplateMeta; knownVariables: string[]; selected: boolean; onUpdate: (patch: Partial<Block>) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [varMenu, setVarMenu] = useState<{ query: string; start: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    if (el.innerHTML !== block.text) el.innerHTML = block.text;
  }, [block.text]);

  const handleInput = () => {
    const el = ref.current;
    if (!el) return;
    onUpdate({ text: el.innerHTML } as Partial<Block>);
    const before = getTextBeforeCaret(el);
    if (before === null) { setVarMenu(null); return; }
    setVarMenu(detectBraceQuery(before));
  };

  const insertVariable = (name: string) => {
    const el = ref.current;
    if (!el || !varMenu) return;
    const caret = currentCaretOffset(el) ?? varMenu.start + 2 + varMenu.query.length;
    replaceTextRange(el, varMenu.start, caret, '{{' + name + '}}');
    onUpdate({ text: el.innerHTML } as Partial<Block>);
    setVarMenu(null);
  };

  const isHeading = block.type === 'heading';
  const sizePx = isHeading ? { sm: 12, md: 24, lg: 30, xl: 36 }[block.size] : { sm: 13.5, md: 15 }[block.size];
  const eyebrow = isHeading && block.size === 'sm';
  const color =
    block.color === 'accent' ? meta.accent
      : block.color === 'muted' ? '#6b7269'
      : block.color === 'white' ? '#ffffff'
      : block.color === ('white-muted' as string) ? 'rgba(255,255,255,.72)'
      : '#14171a';

  return (
    <tr><td style={{ padding: '10px 0 0', textAlign: block.align }}>
      <div className="relative">
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={() => setTimeout(() => setVarMenu(null), 150)}
          style={{
            fontSize: sizePx, lineHeight: eyebrow ? 1 : 1.35, fontWeight: isHeading ? 600 : 400, color,
            textTransform: eyebrow ? 'uppercase' : 'none', letterSpacing: eyebrow ? '.14em' : 'normal',
            outline: 'none', minHeight: '1.4em', cursor: 'text',
          }}
        />
        {varMenu && (
          <VariableMenu query={varMenu.query} options={knownVariables} onPick={insertVariable} className="absolute top-full left-0 mt-1" />
        )}
        {selected && (
          <BlockToolbar>
            {isHeading ? (
              <SegButtons value={block.size} options={['sm', 'md', 'lg', 'xl']} onChange={(v) => onUpdate({ size: v } as Partial<Block>)} />
            ) : (
              <SegButtons value={block.size} options={['sm', 'md']} onChange={(v) => onUpdate({ size: v } as Partial<Block>)} />
            )}
            <ColorButtons
              value={block.color}
              options={isHeading ? ['ink', 'accent', 'muted', 'white'] : ['ink', 'muted', 'white', 'white-muted']}
              accent={meta.accent}
              onChange={(v) => onUpdate({ color: v } as Partial<Block>)}
            />
            <AlignButtons value={block.align} onChange={(v) => onUpdate({ align: v } as Partial<Block>)} />
            <ToolbarIconButton title="Bold" onClick={() => document.execCommand('bold')}><Bold className="h-3 w-3" /></ToolbarIconButton>
            <ToolbarIconButton title="Italic" onClick={() => document.execCommand('italic')}><Italic className="h-3 w-3" /></ToolbarIconButton>
            <ToolbarIconButton title="Link selection" onClick={() => { const url = window.prompt('Link URL'); if (url) document.execCommand('createLink', false, url); }}><LinkIcon className="h-3 w-3" /></ToolbarIconButton>
          </BlockToolbar>
        )}
      </div>
    </td></tr>
  );
}

// ------------------------------------------------------------------ button --

function ButtonBlockRow({ block, meta, selected, onUpdate }: { block: ButtonBlock; meta: TemplateMeta; selected: boolean; onUpdate: (patch: Partial<Block>) => void }) {
  const padMap = { sm: '9px 18px', md: '13px 26px', lg: '16px 32px' } as const;
  const fontMap = { sm: 13, md: 14, lg: 15 } as const;
  const bgv = block.bg || meta.accent;
  const colorv = block.color || '#ffffff';

  return (
    <tr><td style={{ padding: '16px 0 0', textAlign: block.align }}>
      <div className="relative inline-block">
        <span style={{ display: 'inline-block', background: bgv, color: colorv, padding: padMap[block.size], fontSize: fontMap[block.size], fontWeight: 600, letterSpacing: '.02em', cursor: 'default' }}>
          {block.label || 'Button'}
        </span>
        {selected && (
          <BlockToolbar wide>
            <input value={block.label} onChange={(e) => onUpdate({ label: e.target.value } as Partial<Block>)} placeholder="Label" className={cn(MONO, 'h-6 w-24 text-[10px] border border-console-border px-1.5')} />
            <input value={block.url} onChange={(e) => onUpdate({ url: e.target.value } as Partial<Block>)} placeholder="{{cta_url}}" className={cn(MONO, 'h-6 w-28 text-[10px] border border-console-border px-1.5')} />
            <input type="color" value={bgv} onChange={(e) => onUpdate({ bg: e.target.value } as Partial<Block>)} title="Background" className="h-6 w-6 border border-console-border cursor-pointer bg-transparent p-0" />
            <input type="color" value={colorv} onChange={(e) => onUpdate({ color: e.target.value } as Partial<Block>)} title="Text color" className="h-6 w-6 border border-console-border cursor-pointer bg-transparent p-0" />
            <SegButtons value={block.size} options={['sm', 'md', 'lg']} onChange={(v) => onUpdate({ size: v } as Partial<Block>)} />
            <AlignButtons value={block.align} onChange={(v) => onUpdate({ align: v } as Partial<Block>)} />
          </BlockToolbar>
        )}
      </div>
    </td></tr>
  );
}

// ------------------------------------------------------------------- image --

function ImageBlockRow({
  block, meta, selected, onUpdate, uploadImage, imageGallery, onDeleteGalleryImage,
}: {
  block: ImageBlock; meta: TemplateMeta; selected: boolean; onUpdate: (patch: Partial<Block>) => void;
  uploadImage: ReturnType<typeof useUploadTemplateImage>;
  imageGallery: ReturnType<typeof useTemplateImageGallery>['data'];
  onDeleteGalleryImage: (id: number) => void;
}) {
  const { error: toastError, success } = useAppToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [resizing, setResizing] = useState(false);
  const px = Math.max(Math.round((meta.width - 68) * (block.width / 100)), 40);
  const maxPx = meta.width - 68;

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = px;
    setResizing(true);
    const onMove = (ev: MouseEvent) => {
      const deltaX = block.align === 'center' ? (ev.clientX - startX) * 2 : ev.clientX - startX;
      const nextPx = Math.min(Math.max(startWidth + deltaX, 40), maxPx);
      onUpdate({ width: Math.round((nextPx / maxPx) * 100) } as Partial<Block>);
    };
    const onUp = () => {
      setResizing(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    onUpdate({ src: blobUrl } as Partial<Block>);
    const res = await uploadImage.mutateAsync(file);
    if (res.status !== true) {
      toastError('Failed to upload image', { description: res.response?.detail ?? res.response });
      return;
    }
    onUpdate({ src: (res.response as { url: string }).url } as Partial<Block>);
    URL.revokeObjectURL(blobUrl);
    success('Image inserted');
  };

  return (
    <tr><td style={{ padding: '16px 0 0', textAlign: block.align }}>
      <div ref={imgWrapRef} className="relative inline-block max-w-full">
        {block.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.src} alt={block.alt} style={{ width: px, maxWidth: '100%', display: 'block', margin: block.align === 'center' ? '0 auto' : 0 }} />
        ) : (
          <div className="h-28 w-full min-w-[240px] flex items-center justify-center border border-dashed border-console-border text-console-muted2 text-xs">No image yet</div>
        )}
        {selected && block.src && (
          <div
            onMouseDown={startResize}
            title="Drag to resize"
            className={cn(
              'absolute bottom-0 right-0 h-3.5 w-3.5 bg-console-accent border border-white cursor-nwse-resize',
              resizing && 'ring-2 ring-console-accent',
            )}
            style={{ transform: 'translate(50%, 50%)' }}
          />
        )}
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleFile} />
        {selected && (
          <BlockToolbar wide>
            <ToolbarIconButton title="Replace" onClick={() => fileRef.current?.click()}>
              {uploadImage.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
            </ToolbarIconButton>
            <div className="relative">
              <ToolbarIconButton title="Gallery" onClick={() => setGalleryOpen((v) => !v)}><Images className="h-3 w-3" /></ToolbarIconButton>
              {galleryOpen && (
                <div className="absolute top-full mt-1 left-0 z-30 w-64 max-h-64 overflow-y-auto bg-white border border-console-border shadow-lg p-2">
                  {!imageGallery || imageGallery.length === 0 ? (
                    <p className="text-xs text-console-muted p-2">No uploaded images yet.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {imageGallery.map((a) => (
                        <div key={a.id} className="relative group">
                          <button type="button" onClick={() => { onUpdate({ src: a.url } as Partial<Block>); setGalleryOpen(false); }} className="block w-full h-14 bg-console-bg border border-console-border-soft overflow-hidden hover:border-console-accent">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={a.url} alt="" className="w-full h-full object-cover" />
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); onDeleteGalleryImage(a.id); }} className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center h-5 w-5 bg-white border border-console-border text-console-muted2 hover:text-console-red">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <input type="range" min={20} max={100} step={5} value={block.width} onChange={(e) => onUpdate({ width: Number(e.target.value) } as Partial<Block>)} className="w-20 accent-[#1c6b47]" />
            <AlignButtons value={block.align} onChange={(v) => onUpdate({ align: v } as Partial<Block>)} />
          </BlockToolbar>
        )}
      </div>
    </td></tr>
  );
}

// -------------------------------------------------------------- toolbar UI --

function BlockToolbar({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn('absolute -top-9 left-0 z-20 flex items-center gap-1 bg-white border border-console-border shadow-lg px-1.5 py-1', wide && 'flex-wrap max-w-[280px]')}>
      {children}
    </div>
  );
}
function ToolbarIconButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); onClick(); }} className="h-6 w-6 flex items-center justify-center text-console-muted2 hover:text-console-accent">
      {children}
    </button>
  );
}
function SegButtons<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex border border-console-border">
      {options.map((o) => (
        <button
          key={o} type="button" onMouseDown={(e) => { e.preventDefault(); onChange(o); }}
          className={cn(MONO, 'h-6 px-1.5 text-[9px]', value === o ? 'bg-console-ink text-white' : 'text-console-muted2')}
        >
          {o.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
function ColorButtons<T extends string>({ value, options, accent, onChange }: { value: T; options: T[]; accent: string; onChange: (v: T) => void }) {
  const swatch = (o: string) => (o === 'accent' ? accent : o === 'ink' ? '#14171a' : o === 'muted' ? '#6b7269' : o === 'white' ? '#ffffff' : '#c9d0cb');
  return (
    <div className="flex items-center gap-1">
      {options.map((o) => (
        <button
          key={o} type="button" title={o} onMouseDown={(e) => { e.preventDefault(); onChange(o); }}
          className="h-5 w-5 rounded-full"
          style={{ background: swatch(o), border: value === o ? '2px solid #1c6b47' : '1px solid #d7d9d3' }}
        />
      ))}
    </div>
  );
}
function AlignButtons({ value, onChange }: { value: 'left' | 'center'; onChange: (v: 'left' | 'center') => void }) {
  return (
    <div className="flex border border-console-border">
      <button type="button" onMouseDown={(e) => { e.preventDefault(); onChange('left'); }} className={cn('h-6 w-6 flex items-center justify-center', value === 'left' ? 'bg-console-ink text-white' : 'text-console-muted2')}><AlignLeft className="h-3 w-3" /></button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); onChange('center'); }} className={cn('h-6 w-6 flex items-center justify-center', value === 'center' ? 'bg-console-ink text-white' : 'text-console-muted2')}><AlignCenter className="h-3 w-3" /></button>
    </div>
  );
}
