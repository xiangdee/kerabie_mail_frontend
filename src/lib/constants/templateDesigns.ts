// Design-recipe library for the Templates editor. Each design is a pure
// function of {accent, font, width, dark, gradient, css} -> HTML string —
// nothing here is persisted server-side (EmailTemplate only stores
// name/subject/body_html), so these recipes exist purely to generate that
// body_html client-side. Table-based layout with inline styles throughout,
// since that's the only markup that renders consistently across email
// clients (Outlook/Gmail strip <style> blocks and most CSS layout props).

export interface TemplateFont {
  id: string;
  label: string;
  google: string; // Google Fonts family spec, empty = no web font
  stack: string;
  note: string;
}

export const TEMPLATE_FONTS: TemplateFont[] = [
  { id: 'Barlow', label: 'Barlow — grotesque', google: 'Barlow:wght@400;500;600;700', stack: "'Barlow',Helvetica,Arial,sans-serif", note: 'Loaded from Google Fonts; falls back to Helvetica.' },
  { id: 'IBM Plex Sans', label: 'IBM Plex Sans — neutral', google: 'IBM+Plex+Sans:wght@400;500;600', stack: "'IBM Plex Sans',Helvetica,Arial,sans-serif", note: 'Wide language coverage, good at small sizes.' },
  { id: 'Spectral', label: 'Spectral — serif', google: 'Spectral:wght@400;500;600', stack: "'Spectral',Georgia,serif", note: 'Serif body copy; pairs with a condensed heading.' },
  { id: 'Space Grotesk', label: 'Space Grotesk — technical', google: 'Space+Grotesk:wght@400;500;700', stack: "'Space Grotesk',Helvetica,Arial,sans-serif", note: 'Distinctive; keep line length short.' },
  { id: 'Georgia', label: 'Georgia — no web font', google: '', stack: "Georgia,'Times New Roman',serif", note: 'Zero network requests. Safest across every client.' },
];

export const TEMPLATE_ACCENTS: { name: string; value: string }[] = [
  { name: 'Kerabie green', value: '#1c6b47' },
  { name: 'Ink', value: '#14171a' },
  { name: 'Clay', value: '#a8503c' },
  { name: 'Indigo', value: '#3f3d9e' },
  { name: 'Amber', value: '#a8781f' },
];

export const DEFAULT_SAMPLE_VALUES: Record<string, string> = {
  first_name: 'Anna',
  company_name: 'Your Company',
  issue_title: 'What shipped this month',
  cta_url: 'https://example.com',
  cta_text: 'Learn more',
  order_id: 'ORD-1029',
  total: '$248.00',
  reset_code: '417-902',
  launch_name: 'New Feature',
  event_title: 'Team meetup',
  unsubscribe_url: 'https://example.com/unsubscribe',
};

export interface DesignBuildOptions {
  accent: string;
  font: string;
  width: number;
  dark: boolean;
  gradient: boolean;
  gradientEnd?: string; // defaults to a darker shade of accent when unset
  css?: string;
}

function fontOf(font: string): TemplateFont {
  return TEMPLATE_FONTS.find((f) => f.id === font) ?? TEMPLATE_FONTS[0];
}

// Solid accent, or a diagonal gradient into gradientEnd (or a darker shade
// of the accent by default) — used for hero/banner backgrounds when
// `gradient` is on.
export function bg(o: DesignBuildOptions): string {
  if (!o.gradient) return o.accent;
  return `linear-gradient(135deg,${o.accent},${o.gradientEnd || shade(o.accent, -18)})`;
}

// Cheap hex-lightness shift (no color library dependency) — negative = darker.
export function shade(hex: string, percent: number): string {
  const n = hex.replace('#', '');
  const num = parseInt(n, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function shell(inner: string, o: DesignBuildOptions): string {
  const f = fontOf(o.font);
  const link = f.google ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${f.google}&display=swap">` : '';
  const dark = o.dark
    ? '@media (prefers-color-scheme:dark){body{background:#14171a!important}.card{background:#1b201d!important}.t{color:#eef1ee!important}.m{color:#a7b0a8!important}}'
    : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${link}` +
    `<style>body{margin:0;padding:0;background:#eceee8;font-family:${f.stack};-webkit-font-smoothing:antialiased}` +
    `a{text-decoration:none}img{border:0}.t{color:#14171a}.m{color:#6b7269}${dark}${o.css || ''}</style></head>` +
    `<body><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center" style="padding:28px 14px">` +
    `<table class="card" width="${o.width}" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:${o.width}px;background:#ffffff;border:1px solid #dcdfd9">` +
    inner + '</table></td></tr></table></body></html>';
}

function kicker(text: string, a: string): string {
  return `<tr><td style="padding:26px 34px 0"><div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${a}">${text}</div></td></tr>`;
}
function btn(label: string, a: string): string {
  return `<tr><td style="padding:26px 34px 0"><a href="{{cta_url}}" style="display:inline-block;background:${a};color:#ffffff;padding:13px 26px;font-size:14px;font-weight:600;letter-spacing:.02em">${label}</a></td></tr>`;
}
export function foot(a: string, extra?: string): string {
  return `<tr><td style="padding:30px 34px 30px"><div style="border-top:1px solid #e6e8e2;padding-top:16px;font-size:12px;line-height:1.7" class="m">` +
    `{{company_name}}<br>${extra || `You are receiving this because you have an account. <a href="{{unsubscribe_url}}" style="color:${a};text-decoration:underline">Unsubscribe</a>.`}` +
    `</div></td></tr>`;
}

export type DesignKey =
  | 'blank' | 'announcement' | 'newsletter' | 'welcome' | 'order' | 'reset'
  | 'launch' | 'event' | 'promo' | 'story' | 'winback';

export interface TemplateDesign {
  key: DesignKey;
  label: string;
  blurb: string;
  subject: string;
  build: (o: DesignBuildOptions) => string;
}

export const TEMPLATE_DESIGNS: Record<DesignKey, TemplateDesign> = {
  blank: {
    key: 'blank',
    label: 'Blank',
    blurb: 'Start from an empty canvas and write your own HTML.',
    subject: '',
    build: (o) => shell(
      '<tr><td style="padding:40px 34px"><p class="m" style="margin:0;font-size:14px;line-height:1.65">Start typing…</p></td></tr>',
      o,
    ),
  },
  announcement: {
    key: 'announcement',
    label: 'Simple Announcement',
    blurb: 'Heading, a short message, one call to action.',
    subject: 'A change to your {{company_name}} account',
    build: (o) => shell(
      kicker('Announcement', o.accent) +
      '<tr><td style="padding:12px 34px 0"><h1 class="t" style="margin:0;font-size:30px;line-height:1.2;font-weight:600;letter-spacing:-.01em">We are moving to a new sending relay</h1></td></tr>' +
      '<tr><td style="padding:14px 34px 0"><p class="m" style="margin:0;font-size:15px;line-height:1.65">Hi {{first_name}}, on 14 September all outbound mail from {{company_name}} moves to our new relay. Nothing changes for you, but if you maintain your own SPF record you will want to re-check it before then.</p></td></tr>' +
      btn('Read the details', o.accent) + foot(o.accent), o),
  },
  newsletter: {
    key: 'newsletter',
    label: 'Newsletter',
    blurb: 'Banner, two content sections, and a footer.',
    subject: '{{company_name}} — {{issue_title}}',
    build: (o) => shell(
      `<tr><td style="background:${bg(o)};padding:30px 34px"><div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.72)">Newsletter</div><div style="color:#fff;font-size:28px;line-height:1.2;font-weight:600;margin-top:8px">{{issue_title}}</div></td></tr>` +
      `<tr><td style="padding:28px 34px 0"><div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${o.accent}">01 — Update</div><h2 class="t" style="margin:8px 0 0;font-size:20px;line-height:1.3;font-weight:600">Section one heading</h2><p class="m" style="margin:8px 0 0;font-size:14.5px;line-height:1.65">Write the body copy for your first update here.</p></td></tr>` +
      '<tr><td style="padding:24px 34px 0"><div style="border-top:1px solid #e6e8e2"></div></td></tr>' +
      `<tr><td style="padding:22px 34px 0"><div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${o.accent}">02 — Update</div><h2 class="t" style="margin:8px 0 0;font-size:20px;line-height:1.3;font-weight:600">Section two heading</h2><p class="m" style="margin:8px 0 0;font-size:14.5px;line-height:1.65">Write the body copy for your second update here.</p></td></tr>` +
      btn('Read the full issue', o.accent) + foot(o.accent), o),
  },
  welcome: {
    key: 'welcome',
    label: 'Welcome Email',
    blurb: 'Greeting, three-step feature list, call to action.',
    subject: 'Welcome to {{company_name}}, {{first_name}}',
    build: (o) => shell(
      kicker('Welcome', o.accent) +
      '<tr><td style="padding:12px 34px 0"><h1 class="t" style="margin:0;font-size:29px;line-height:1.2;font-weight:600">Your account is ready</h1><p class="m" style="margin:12px 0 0;font-size:15px;line-height:1.65">Three things worth doing in your first ten minutes.</p></td></tr>' +
      '<tr><td style="padding:22px 34px 0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation">' +
      ['Set up your profile.', 'Invite your team.', 'Explore the dashboard.'].map((t, i) =>
        `<tr><td width="34" valign="top" style="padding-bottom:16px"><div style="width:24px;height:24px;border:1px solid ${o.accent};color:${o.accent};font-size:12px;text-align:center;line-height:24px">${i + 1}</div></td><td valign="top" style="padding-bottom:16px"><div class="t" style="font-size:14.5px;line-height:1.55">${t}</div></td></tr>`).join('') +
      '</table></td></tr>' + btn('Get started', o.accent) +
      foot(o.accent, 'Need a hand? Reply to this email and a human will answer.'), o),
  },
  order: {
    key: 'order',
    label: 'Order Confirmation',
    blurb: 'Transactional receipt with a line-item table and totals.',
    subject: 'Your order {{order_id}} is confirmed',
    build: (o) => shell(
      kicker(`Order {{order_id}}`, o.accent) +
      '<tr><td style="padding:10px 34px 0"><h1 class="t" style="margin:0;font-size:26px;line-height:1.25;font-weight:600">Thanks, {{first_name}} — we are on it</h1></td></tr>' +
      '<tr><td style="padding:22px 34px 0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-size:14px">' +
      [['Item', '{{total}}']].map((r) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #eceee8" class="t">${r[0]}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #eceee8" class="t">${r[1]}</td></tr>`).join('') +
      `<tr><td style="padding:14px 0" class="t"><strong>Total</strong></td><td align="right" style="padding:14px 0;font-size:18px;font-weight:600;color:${o.accent}">{{total}}</td></tr>` +
      '</table></td></tr>' +
      btn('View order', o.accent) +
      foot(o.accent, 'This is a transactional receipt for your records.'), o),
  },
  reset: {
    key: 'reset',
    label: 'Password Reset',
    blurb: 'One-time code, expiry warning, and a fallback link.',
    subject: 'Your {{company_name}} verification code',
    build: (o) => shell(
      kicker('Security', o.accent) +
      '<tr><td style="padding:12px 34px 0"><h1 class="t" style="margin:0;font-size:26px;line-height:1.25;font-weight:600">Here is your one-time code</h1><p class="m" style="margin:12px 0 0;font-size:15px;line-height:1.65">Enter it to finish signing in. It expires in 10 minutes and can only be used once.</p></td></tr>' +
      `<tr><td style="padding:22px 34px 0"><div style="border:1px dashed ${o.accent};padding:18px;text-align:center;font-family:ui-monospace,Menlo,monospace;font-size:30px;letter-spacing:.16em;color:${o.accent}">{{reset_code}}</div></td></tr>` +
      `<tr><td style="padding:18px 34px 0"><p class="m" style="margin:0;font-size:13.5px;line-height:1.65">If you did not ask for this code, someone may have your password. <a href="{{cta_url}}" style="color:${o.accent};text-decoration:underline">Lock the account</a>.</p></td></tr>` +
      foot(o.accent, 'Sent because a sign-in was attempted for {{first_name}}.'), o),
  },
  launch: {
    key: 'launch',
    label: 'Product Launch',
    blurb: 'Colour-block hero, three specs, one bold call to action.',
    subject: 'Introducing {{launch_name}}',
    build: (o) => shell(
      `<tr><td style="padding:0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>` +
      `<td width="62%" style="background:${bg(o)};padding:44px 30px 44px 34px"><div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.7)">New</div>` +
      `<div style="color:#fff;font-size:36px;line-height:1.05;font-weight:600;margin-top:10px;letter-spacing:-.02em">{{launch_name}}</div></td>` +
      `<td width="38%" style="background:#14171a"></td></tr></table></td></tr>` +
      '<tr><td style="padding:28px 34px 0"><p class="m" style="margin:0;font-size:15px;line-height:1.65">Hi {{first_name}} — here is what is new.</p></td></tr>' +
      '<tr><td style="padding:24px 34px 0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation">' +
      [['01', 'Feature one', 'Detail'], ['02', 'Feature two', 'Detail'], ['03', 'Feature three', 'Detail']].map((r) =>
        `<td width="33%" valign="top" style="border-top:2px solid ${o.accent};padding:12px 12px 0 0"><div style="font-family:ui-monospace,Menlo,monospace;font-size:11px;color:${o.accent}">${r[0]}</div><div class="t" style="font-size:15px;font-weight:600;margin-top:6px">${r[1]}</div><div class="m" style="font-size:13px;margin-top:2px">${r[2]}</div></td>`).join('') +
      '</table></td></tr>' + btn('See what shipped', o.accent) + foot(o.accent), o),
  },
  event: {
    key: 'event',
    label: 'Event Invitation',
    blurb: 'Date block, agenda, venue, and an RSVP button.',
    subject: 'You are invited — {{event_title}}',
    build: (o) => shell(
      `<tr><td style="padding:0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>` +
      `<td width="128" align="center" valign="middle" style="background:${bg(o)};padding:26px 0"><div style="color:rgba(255,255,255,.72);font-size:11px;letter-spacing:.16em;text-transform:uppercase">Date</div>` +
      `<div style="color:#fff;font-size:46px;line-height:1;font-weight:600">18</div></td>` +
      `<td style="background:#14171a;padding:26px 30px"><div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#8e9a91">Invitation</div>` +
      `<div style="color:#fff;font-size:25px;line-height:1.2;font-weight:600;margin-top:8px">{{event_title}}</div></td></tr></table></td></tr>` +
      `<tr><td style="padding:26px 34px 0"><div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${o.accent}">Running order</div>` +
      '<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:10px">' +
      [['18:30', 'Doors open'], ['19:00', 'Main talk'], ['19:45', 'Open floor']].map((r) =>
        `<tr><td width="66" valign="top" style="padding:9px 0;border-bottom:1px solid #eceee8;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:${o.accent}">${r[0]}</td><td valign="top" style="padding:9px 0;border-bottom:1px solid #eceee8;font-size:14px" class="t">${r[1]}</td></tr>`).join('') +
      '</table></td></tr>' + btn('RSVP', o.accent) + foot(o.accent), o),
  },
  promo: {
    key: 'promo',
    label: 'Seasonal Promo',
    blurb: 'Oversized offer figure, dashed code box, expiry line.',
    subject: '48 hours: a special offer from {{company_name}}',
    build: (o) => shell(
      `<tr><td align="center" style="background:${bg(o)};padding:40px 30px"><div style="color:rgba(255,255,255,.72);font-size:11px;letter-spacing:.2em;text-transform:uppercase">48 hours only</div>` +
      '<div style="color:#fff;font-size:74px;line-height:.92;font-weight:600;letter-spacing:-.03em;margin-top:8px">30%</div>' +
      '<div style="color:#fff;font-size:17px;letter-spacing:.04em;margin-top:6px">off</div></td></tr>' +
      '<tr><td align="center" style="padding:28px 34px 0"><p class="m" style="margin:0;font-size:15px;line-height:1.65;max-width:40ch">{{first_name}}, this is the last discount of the year.</p></td></tr>' +
      `<tr><td align="center" style="padding:22px 34px 0"><div style="border:1px dashed ${o.accent};padding:14px 26px;display:inline-block;font-family:ui-monospace,Menlo,monospace;font-size:22px;letter-spacing:.18em;color:${o.accent}">SAVE30</div>` +
      '<div class="m" style="font-size:12.5px;margin-top:10px">Expires Friday 23:59 UTC · one use per account</div></td></tr>' +
      '<tr><td align="center" style="padding:22px 34px 0"><a href="{{cta_url}}" style="display:inline-block;background:#14171a;color:#fff;padding:14px 30px;font-size:14px;font-weight:600;letter-spacing:.03em">Claim the discount</a></td></tr>' +
      foot(o.accent), o),
  },
  story: {
    key: 'story',
    label: 'Customer Story',
    blurb: 'Pull-quote, three proof stats, link to the full case study.',
    subject: 'A customer story worth reading',
    build: (o) => shell(
      kicker('Customer story', o.accent) +
      `<tr><td style="padding:14px 34px 0"><div style="font-size:52px;line-height:.7;color:${o.accent}">&ldquo;</div>` +
      '<div class="t" style="font-size:22px;line-height:1.45;font-weight:500;margin-top:6px">Write your customer quote here.</div>' +
      '<div class="m" style="font-size:13px;margin-top:14px;letter-spacing:.02em">Name · Title, Company</div></td></tr>' +
      '<tr><td style="padding:26px 34px 0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>' +
      [['71%', 'stat one'], ['2.4×', 'stat two'], ['9 min', 'stat three']].map((r) =>
        `<td width="33%" valign="top" style="background:#f5f6f3;padding:16px 14px"><div style="font-size:26px;font-weight:600;color:${o.accent};line-height:1">${r[0]}</div><div class="m" style="font-size:12.5px;margin-top:6px">${r[1]}</div></td>`).join('') +
      '</tr></table></td></tr>' + btn('Read the case study', o.accent) + foot(o.accent), o),
  },
  winback: {
    key: 'winback',
    label: 'Win-back',
    blurb: 'Quiet re-engagement note with two clear choices.',
    subject: 'Still want your {{company_name}} account, {{first_name}}?',
    build: (o) => shell(
      `<tr><td style="padding:34px 34px 0"><div style="width:44px;height:4px;background:${o.accent}"></div>` +
      '<h1 class="t" style="margin:18px 0 0;font-size:27px;line-height:1.25;font-weight:600">Still there? We will stop emailing</h1>' +
      '<p class="m" style="margin:14px 0 0;font-size:15px;line-height:1.65">You have not opened this in a while. One tap keeps everything as it is, the other pauses all mail from us.</p></td></tr>' +
      '<tr><td style="padding:24px 34px 0"><table cellpadding="0" cellspacing="0" role="presentation"><tr>' +
      `<td style="padding-right:10px"><a href="{{cta_url}}" style="display:inline-block;background:${o.accent};color:#fff;padding:13px 24px;font-size:14px;font-weight:600">Keep my account</a></td>` +
      '<td><a href="{{unsubscribe_url}}" style="display:inline-block;border:1px solid #d4d8d1;color:#3f4741;padding:12px 22px;font-size:14px">Pause emails</a></td>' +
      '</tr></table></td></tr>' +
      foot(o.accent), o),
  },
};

export const TEMPLATE_DESIGN_LIST = Object.values(TEMPLATE_DESIGNS);

export function extractTemplateVariables(subject: string | null | undefined, bodyHtml: string): string[] {
  const text = `${subject ?? ''} ${bodyHtml}`;
  const matches = [...text.matchAll(/\{\{\s*([a-zA-Z_]\w*)\s*\}\}/g)].map((m) => m[1]);
  return [...new Set(matches)];
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function fillTemplateVariables(html: string, values: Record<string, string>): string {
  let out = html;
  for (const [k, v] of Object.entries(values)) {
    // {{key}} and {{ key }} (any whitespace inside the braces) both match —
    // extractTemplateVariables already tolerates this, fill has to too.
    out = out.replace(new RegExp(`\\{\\{\\s*${escapeRegExp(k)}\\s*\\}\\}`, 'g'), v);
  }
  return out;
}
