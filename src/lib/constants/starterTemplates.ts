// Pre-built starter templates offered when creating a new one. Table-based
// layout with inline styles throughout — the only markup that renders
// consistently across email clients (Outlook/Gmail strip <style> blocks and
// most CSS layout properties). {{placeholder}} tags are filled in at send
// time via POST /mail/send's variables field.

export interface StarterTemplate {
  id: string;
  label: string;
  description: string;
  subject: string;
  body_html: string;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'announcement',
    label: 'Simple Announcement',
    description: 'A heading, message, and one call-to-action button.',
    subject: '{{title}}',
    body_html: `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <tr>
        <td style="background:#4f46e5;padding:28px 40px;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">{{company_name}}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:40px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a1a;">{{title}}</h1>
          <p style="margin:0 0 24px;color:#5a5a5a;line-height:1.6;">{{message}}</p>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="border-radius:8px;background:#4f46e5;">
                <a href="{{cta_url}}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">{{cta_text}}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 40px;background:#f9fafb;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#999;">You're receiving this from {{company_name}}.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`,
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    description: 'A banner, two content sections, and a footer — for digest-style updates.',
    subject: '{{company_name}} — {{issue_title}}',
    body_html: `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <tr>
        <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;">
          <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#e0e7ff;">Newsletter</p>
          <p style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;">{{issue_title}}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 40px 8px;">
          <h2 style="margin:0 0 10px;font-size:18px;color:#1a1a1a;">{{section_1_heading}}</h2>
          <p style="margin:0;color:#5a5a5a;line-height:1.6;">{{section_1_body}}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 40px 32px;">
          <h2 style="margin:0 0 10px;font-size:18px;color:#1a1a1a;">{{section_2_heading}}</h2>
          <p style="margin:0;color:#5a5a5a;line-height:1.6;">{{section_2_body}}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 40px;background:#f9fafb;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#999;">{{company_name}} · <a href="{{unsubscribe_url}}" style="color:#999;">Unsubscribe</a></p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`,
  },
  {
    id: 'welcome',
    label: 'Welcome Email',
    description: 'A greeting, a short feature list, and a call-to-action — for onboarding new users.',
    subject: 'Welcome to {{company_name}}, {{first_name}}!',
    body_html: `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <tr>
        <td style="padding:40px 40px 24px;text-align:center;">
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;">Welcome, {{first_name}} 👋</h1>
          <p style="margin:0;color:#5a5a5a;line-height:1.6;">We're glad you're here. Here's how to get started with {{company_name}}.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 40px 24px;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#333;">✅ {{feature_1}}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#333;">✅ {{feature_2}}</td></tr>
            <tr><td style="padding:10px 0;color:#333;">✅ {{feature_3}}</td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 40px 40px;text-align:center;">
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="border-radius:8px;background:#4f46e5;">
                <a href="{{cta_url}}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">{{cta_text}}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 40px;background:#f9fafb;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#999;">Sent by {{company_name}}. Questions? Just reply to this email.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`,
  },
];
