import { redirect } from 'next/navigation';

// Webmail is at a separate app (kerabie-mail-webmail).
// Redirect users to the webmail URL.
export default function MailRedirect() {
  redirect(process.env.NEXT_PUBLIC_WEBMAIL_URL ?? 'https://webmail.kerabie.email');
}
