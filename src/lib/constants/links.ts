const isDev = (process.env.NEXT_PUBLIC_ENVIRONMENT || '').trim().toLowerCase() === 'development';


export const blackblazebucket = 'https://kerabie-mail.s3.eu-central-003.backblazeb2.com';

export const apiLink = isDev ? 'https://api.local:5000' : 'https://api.kerabie.email';

// This app's own real public URL — used for checkout return/success URLs
// sent to payment providers (Bachs, Flutterwave). window.location.origin
// is the obvious alternative but is localhost while developing, which
// Bachs rejects outright ("success_url must be a publicly accessible URL");
// always using the real deployed origin here works in both dev and
// production, since it IS what window.location.origin resolves to anyway
// once actually running on the live site.
export const siteUrl = 'https://www.kerabie.email';

export const IMAP_HOST = process.env.NEXT_PUBLIC_IMAP_HOST ?? 'imap.kerabie.email';
export const SMTP_HOST = process.env.NEXT_PUBLIC_SMTP_HOST ?? 'smtp.kerabie.email';