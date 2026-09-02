// Block/section content model for the click-to-edit template canvas.
// Replaces "one opaque HTML string" with a small structured document that
// both (a) renders to the same email-safe table HTML the backend has
// always expected (POST /mail/send and campaigns only ever read the final
// body_html string — nothing there changes) and (b) can be directly
// manipulated block-by-block in TemplateCanvas.tsx.
//
// A handful of the 11 starter designs' bespoke bits (multi-column layouts:
// a numbered list, a line-item table, an event agenda, a stat row, a
// feature row) don't fit a generic block yet — those become a static
// `html` block instead of inventing a full table-block system this pass.
// Being static (not theme-aware), they're authored once against the
// default accent (#1c6b47) rather than tracking a template's live accent
// color the way heading/text/button blocks do.

import { shell, shade, foot, type DesignBuildOptions } from './templateDesigns';
import type { DesignKey } from './templateDesigns';

export type BlockAlign = 'left' | 'center';

export interface HeadingBlock {
  id: string;
  type: 'heading';
  text: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  color: 'ink' | 'accent' | 'muted' | 'white';
  align: BlockAlign;
}
export interface TextBlock {
  id: string;
  type: 'text';
  text: string; // stored as HTML (inline tags like <a> preserved) — edited via contentEditable
  size: 'sm' | 'md';
  color: 'ink' | 'muted' | 'white' | 'white-muted';
  align: BlockAlign;
}
export interface ButtonBlock {
  id: string;
  type: 'button';
  label: string;
  url: string;
  bg: string; // '' = track the template's live accent color
  color: string; // '' = white
  align: BlockAlign;
  size: 'sm' | 'md' | 'lg';
}
export interface ImageBlock {
  id: string;
  type: 'image';
  src: string;
  width: number; // percent of section content width
  align: BlockAlign;
  alt: string;
  linkUrl?: string;
}
export interface DividerBlock { id: string; type: 'divider' }
export interface SpacerBlock { id: string; type: 'spacer'; height: number }
export interface HtmlBlock { id: string; type: 'html'; html: string }

export type Block = HeadingBlock | TextBlock | ButtonBlock | ImageBlock | DividerBlock | SpacerBlock | HtmlBlock;
export type BlockType = Block['type'];

export interface Section {
  id: string;
  background: 'none' | 'solid' | 'gradient';
  bgColor?: string; // '' or unset = track the template's live accent color
  bgGradientEnd?: string;
  padding: 'sm' | 'md' | 'lg';
  blocks: Block[];
}

export interface TemplateMeta {
  accent: string;
  font: string;
  width: number;
  dark: boolean;
  css?: string;
}

export interface TemplateDocument {
  meta: TemplateMeta;
  sections: Section[];
}

let idCounter = 0;
function genId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${idCounter}`;
}

// ---------------------------------------------------------------- render --

const HEADING_SIZE_PX: Record<HeadingBlock['size'], number> = { sm: 12, md: 24, lg: 30, xl: 36 };
const TEXT_SIZE_PX: Record<TextBlock['size'], number> = { sm: 13.5, md: 15 };
const BUTTON_PAD: Record<ButtonBlock['size'], { y: number; x: number; font: number }> = {
  sm: { y: 9, x: 18, font: 13 },
  md: { y: 13, x: 26, font: 14 },
  lg: { y: 16, x: 32, font: 15 },
};

function headingColor(c: HeadingBlock['color'], accent: string): string {
  return c === 'accent' ? accent : c === 'muted' ? '#6b7269' : c === 'white' ? '#ffffff' : '#14171a';
}
function textColor(c: TextBlock['color'], accent: string): string {
  if (c === 'white') return '#ffffff';
  if (c === 'white-muted') return 'rgba(255,255,255,.72)';
  if (c === 'muted') return '#6b7269';
  return '#14171a';
}

export function renderBlock(b: Block, meta: TemplateMeta): string {
  switch (b.type) {
    case 'heading': {
      const eyebrow = b.size === 'sm';
      const style = eyebrow
        ? `font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${headingColor(b.color, meta.accent)}`
        : `font-size:${HEADING_SIZE_PX[b.size]}px;line-height:1.25;font-weight:600;color:${headingColor(b.color, meta.accent)};letter-spacing:-.01em`;
      return `<tr><td style="padding:10px 0 0;text-align:${b.align}"><div style="${style}">${b.text}</div></td></tr>`;
    }
    case 'text':
      return `<tr><td style="padding:8px 0 0;text-align:${b.align}"><div style="font-size:${TEXT_SIZE_PX[b.size]}px;line-height:1.65;color:${textColor(b.color, meta.accent)}">${b.text}</div></td></tr>`;
    case 'button': {
      const p = BUTTON_PAD[b.size];
      const bgv = b.bg || meta.accent;
      const colorv = b.color || '#ffffff';
      return `<tr><td style="padding:16px 0 0;text-align:${b.align}"><a href="${b.url}" style="display:inline-block;background:${bgv};color:${colorv};padding:${p.y}px ${p.x}px;font-size:${p.font}px;font-weight:600;letter-spacing:.02em">${b.label}</a></td></tr>`;
    }
    case 'image': {
      const px = Math.max(Math.round((meta.width - 68) * (b.width / 100)), 40);
      const img = `<img src="${b.src}" alt="${b.alt}" width="${px}" style="max-width:100%;display:block;border:0;margin:${b.align === 'center' ? '0 auto' : '0'}" />`;
      const inner = b.linkUrl ? `<a href="${b.linkUrl}">${img}</a>` : img;
      return `<tr><td style="padding:16px 0 0;text-align:${b.align}">${inner}</td></tr>`;
    }
    case 'divider':
      return `<tr><td style="padding:16px 0 0"><div style="border-top:1px solid #e6e8e2"></div></td></tr>`;
    case 'spacer':
      return `<tr><td style="height:${b.height}px;line-height:${b.height}px;font-size:0">&nbsp;</td></tr>`;
    case 'html':
      return b.html;
  }
}

function renderSection(s: Section, meta: TemplateMeta): string {
  const padMap: Record<Section['padding'], string> = { sm: '18px 24px', md: '28px 34px', lg: '40px 34px' };
  let background = 'transparent';
  if (s.background === 'solid') background = s.bgColor || meta.accent;
  else if (s.background === 'gradient') background = `linear-gradient(135deg,${s.bgColor || meta.accent},${s.bgGradientEnd || shade(s.bgColor || meta.accent, -18)})`;
  const rows = s.blocks.map((b) => renderBlock(b, meta)).join('');
  return `<tr><td style="background:${background};padding:${padMap[s.padding]}"><table width="100%" cellpadding="0" cellspacing="0" role="presentation">${rows}</table></td></tr>`;
}

export function renderDocument(doc: TemplateDocument): string {
  const options: DesignBuildOptions = { accent: doc.meta.accent, font: doc.meta.font, width: doc.meta.width, dark: doc.meta.dark, gradient: false, css: doc.meta.css };
  const sectionsHtml = doc.sections.map((s) => renderSection(s, doc.meta)).join('');
  return shell(sectionsHtml + foot(doc.meta.accent), options);
}

// ------------------------------------------------------------- factories --

export function newBlock(type: BlockType): Block {
  switch (type) {
    case 'heading': return { id: genId('h'), type, text: 'New heading', size: 'md', color: 'ink', align: 'left' };
    case 'text': return { id: genId('t'), type, text: 'Write something…', size: 'md', color: 'ink', align: 'left' };
    case 'button': return { id: genId('btn'), type, label: 'Click here', url: '{{cta_url}}', bg: '', color: '', align: 'left', size: 'md' };
    case 'image': return { id: genId('img'), type, src: '', width: 100, align: 'center', alt: '' };
    case 'divider': return { id: genId('div'), type };
    case 'spacer': return { id: genId('sp'), type, height: 24 };
    case 'html': return { id: genId('x'), type, html: '' };
  }
}

export function newSection(): Section {
  return { id: genId('sec'), background: 'none', padding: 'md', blocks: [newBlock('text')] };
}

// Deep clone with fresh ids (for itself and every block) — so duplicating a
// section never lets two sections' blocks share React keys or accidentally
// alias the same object across independent edits.
export function cloneSection(s: Section): Section {
  return {
    ...s,
    id: genId('sec'),
    blocks: s.blocks.map((b) => ({ ...b, id: genId(b.type.slice(0, 3)) })),
  };
}

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  heading: 'Heading', text: 'Text', button: 'Button', image: 'Image', divider: 'Divider', spacer: 'Spacer', html: 'Custom HTML',
};

// --------------------------------------------------------- starter docs --
// Static helpers for the bespoke multi-column bits — authored once against
// the default accent since html blocks don't track a template's live theme.

const A = '#1c6b47';

function numberedList(items: string[]): string {
  return `<tr><td style="padding:0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation">` +
    items.map((t, i) =>
      `<tr><td width="34" valign="top" style="padding-bottom:16px"><div style="width:24px;height:24px;border:1px solid ${A};color:${A};font-size:12px;text-align:center;line-height:24px">${i + 1}</div></td><td valign="top" style="padding-bottom:16px"><div style="color:#14171a;font-size:14.5px;line-height:1.55">${t}</div></td></tr>`).join('') +
    `</table></td></tr>`;
}

function lineItems(): string {
  return `<tr><td style="padding:0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size:14px">` +
    `<tr><td style="padding:10px 0;border-bottom:1px solid #eceee8;color:#14171a">Item</td><td align="right" style="padding:10px 0;border-bottom:1px solid #eceee8;color:#14171a">{{total}}</td></tr>` +
    `<tr><td style="padding:14px 0;color:#14171a"><strong>Total</strong></td><td align="right" style="padding:14px 0;font-size:18px;font-weight:600;color:${A}">{{total}}</td></tr>` +
    `</table></td></tr>`;
}

function dashedCode(token: string, align: 'left' | 'center' = 'left'): string {
  return `<tr><td align="${align}" style="padding:0"><div style="border:1px dashed ${A};padding:18px;text-align:center;display:inline-block;font-family:ui-monospace,Menlo,monospace;font-size:22px;letter-spacing:.16em;color:${A}">${token}</div></td></tr>`;
}

function featureRow(): string {
  return `<tr><td style="padding:0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>` +
    [['01', 'Feature one', 'Detail'], ['02', 'Feature two', 'Detail'], ['03', 'Feature three', 'Detail']].map((r) =>
      `<td width="33%" valign="top" style="border-top:2px solid ${A};padding:12px 12px 0 0"><div style="font-family:ui-monospace,Menlo,monospace;font-size:11px;color:${A}">${r[0]}</div><div style="color:#14171a;font-size:15px;font-weight:600;margin-top:6px">${r[1]}</div><div style="color:#6b7269;font-size:13px;margin-top:2px">${r[2]}</div></td>`).join('') +
    `</tr></table></td></tr>`;
}

function eventHeader(): string {
  return `<tr><td style="padding:0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>` +
    `<td width="128" align="center" valign="middle" style="background:${A};padding:26px 0"><div style="color:rgba(255,255,255,.72);font-size:11px;letter-spacing:.16em;text-transform:uppercase">Date</div><div style="color:#fff;font-size:46px;line-height:1;font-weight:600">18</div></td>` +
    `<td style="background:#14171a;padding:26px 30px"><div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#8e9a91">Invitation</div><div style="color:#fff;font-size:25px;line-height:1.2;font-weight:600;margin-top:8px">{{event_title}}</div></td>` +
    `</tr></table></td></tr>`;
}

function agendaRows(): string {
  return `<tr><td style="padding:0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation">` +
    [['18:30', 'Doors open'], ['19:00', 'Main talk'], ['19:45', 'Open floor']].map((r) =>
      `<tr><td width="66" valign="top" style="padding:9px 0;border-bottom:1px solid #eceee8;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:${A}">${r[0]}</td><td valign="top" style="padding:9px 0;border-bottom:1px solid #eceee8;font-size:14px;color:#14171a">${r[1]}</td></tr>`).join('') +
    `</table></td></tr>`;
}

function statsRow(): string {
  return `<tr><td style="padding:0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>` +
    [['71%', 'stat one'], ['2.4×', 'stat two'], ['9 min', 'stat three']].map((r) =>
      `<td width="33%" valign="top" style="background:#f5f6f3;padding:16px 14px"><div style="font-size:26px;font-weight:600;color:${A};line-height:1">${r[0]}</div><div style="color:#6b7269;font-size:12.5px;margin-top:6px">${r[1]}</div></td>`).join('') +
    `</tr></table></td></tr>`;
}

function twoButtonRow(): string {
  return `<tr><td style="padding:0"><table cellpadding="0" cellspacing="0" role="presentation"><tr>` +
    `<td style="padding-right:10px"><a href="{{cta_url}}" style="display:inline-block;background:${A};color:#fff;padding:13px 24px;font-size:14px;font-weight:600">Keep my account</a></td>` +
    `<td><a href="{{unsubscribe_url}}" style="display:inline-block;border:1px solid #d4d8d1;color:#3f4741;padding:12px 22px;font-size:14px">Pause emails</a></td>` +
    `</tr></table></td></tr>`;
}

function h(text: string, size: HeadingBlock['size'], color: HeadingBlock['color'], align: BlockAlign = 'left'): HeadingBlock {
  return { id: genId('h'), type: 'heading', text, size, color, align };
}
function t(text: string, size: TextBlock['size'], color: TextBlock['color'], align: BlockAlign = 'left'): TextBlock {
  return { id: genId('t'), type: 'text', text, size, color, align };
}
function btn(label: string, url = '{{cta_url}}', bg = '', color = '', align: BlockAlign = 'left', size: ButtonBlock['size'] = 'md'): ButtonBlock {
  return { id: genId('btn'), type: 'button', label, url, bg, color, align, size };
}
function html(raw: string): HtmlBlock {
  return { id: genId('x'), type: 'html', html: raw };
}
function section(blocks: Block[], opts: Partial<Omit<Section, 'id' | 'blocks'>> = {}): Section {
  return { id: genId('sec'), background: 'none', padding: 'lg', blocks, ...opts };
}

export const STARTER_DOCUMENTS: Record<DesignKey, Section[]> = {
  blank: [
    section([t('Start typing…', 'md', 'muted')]),
  ],
  announcement: [
    section([
      h('Announcement', 'sm', 'accent'),
      h('We are moving to a new sending relay', 'lg', 'ink'),
      t('Hi {{first_name}}, on 14 September all outbound mail from {{company_name}} moves to our new relay. Nothing changes for you, but if you maintain your own SPF record you will want to re-check it before then.', 'md', 'muted'),
      btn('Read the details'),
    ]),
  ],
  newsletter: [
    section([h('Newsletter', 'sm', 'white'), h('{{issue_title}}', 'lg', 'white')], { background: 'solid' }),
    section([h('01 — Update', 'sm', 'accent'), h('Section one heading', 'md', 'ink'), t('Write the body copy for your first update here.', 'md', 'muted')], { padding: 'md' }),
    section([{ id: genId('div'), type: 'divider' }], { padding: 'sm' }),
    section([h('02 — Update', 'sm', 'accent'), h('Section two heading', 'md', 'ink'), t('Write the body copy for your second update here.', 'md', 'muted'), btn('Read the full issue')], { padding: 'md' }),
  ],
  welcome: [
    section([h('Welcome', 'sm', 'accent'), h('Your account is ready', 'xl', 'ink'), t('Three things worth doing in your first ten minutes.', 'md', 'muted')]),
    section([html(numberedList(['Set up your profile.', 'Invite your team.', 'Explore the dashboard.']))], { padding: 'md' }),
    section([btn('Get started')], { padding: 'md' }),
  ],
  order: [
    section([h('Order {{order_id}}', 'sm', 'accent'), h('Thanks, {{first_name}} — we are on it', 'lg', 'ink')]),
    section([html(lineItems())], { padding: 'md' }),
    section([btn('View order')], { padding: 'md' }),
  ],
  reset: [
    section([h('Security', 'sm', 'accent'), h('Here is your one-time code', 'lg', 'ink'), t('Enter it to finish signing in. It expires in 10 minutes and can only be used once.', 'md', 'muted')]),
    section([html(dashedCode('{{reset_code}}'))], { padding: 'md' }),
    section([t('If you did not ask for this code, someone may have your password. <a href="{{cta_url}}">Lock the account</a>.', 'sm', 'muted')], { padding: 'md' }),
  ],
  launch: [
    section([h('New', 'sm', 'white'), h('{{launch_name}}', 'xl', 'white')], { background: 'solid' }),
    section([t('Hi {{first_name}} — here is what is new.', 'md', 'muted')], { padding: 'md' }),
    section([html(featureRow())], { padding: 'md' }),
    section([btn('See what shipped')], { padding: 'md' }),
  ],
  event: [
    section([html(eventHeader())], { padding: 'sm' }),
    section([h('Running order', 'sm', 'accent'), html(agendaRows())], { padding: 'md' }),
    section([btn('RSVP')], { padding: 'md' }),
  ],
  promo: [
    section([h('48 hours only', 'sm', 'white', 'center'), html('<tr><td align="center" style="padding:8px 0 0"><div style="color:#fff;font-size:74px;line-height:.92;font-weight:600;letter-spacing:-.03em">30%</div><div style="color:#fff;font-size:17px;letter-spacing:.04em;margin-top:6px">off</div></td></tr>')], { background: 'solid' }),
    section([t('{{first_name}}, this is the last discount of the year.', 'md', 'muted', 'center')], { padding: 'md' }),
    section([html(dashedCode('SAVE30', 'center')), t('Expires Friday 23:59 UTC · one use per account', 'sm', 'muted', 'center')], { padding: 'md' }),
    section([btn('Claim the discount', '{{cta_url}}', '#14171a', '#ffffff', 'center', 'lg')], { padding: 'md' }),
  ],
  story: [
    section([h('Customer story', 'sm', 'accent'), html(`<tr><td style="padding:12px 0 0"><div style="font-size:52px;line-height:.7;color:${A}">&ldquo;</div><div style="color:#14171a;font-size:22px;line-height:1.45;font-weight:500;margin-top:6px">Write your customer quote here.</div><div style="color:#6b7269;font-size:13px;margin-top:14px;letter-spacing:.02em">Name · Title, Company</div></td></tr>`)]),
    section([html(statsRow())], { padding: 'md' }),
    section([btn('Read the case study')], { padding: 'md' }),
  ],
  winback: [
    section([h('Still there? We will stop emailing', 'lg', 'ink'), t('You have not opened this in a while. One tap keeps everything as it is, the other pauses all mail from us.', 'md', 'muted')]),
    section([html(twoButtonRow())], { padding: 'md' }),
  ],
};
