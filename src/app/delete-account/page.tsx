import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Trash2, ShieldAlert, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Delete Account – Kerabie Mail',
  description: 'Request deletion of your Kerabie Mail account and associated data.',
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-muted/30 border-b">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="h-8 w-8 text-destructive" />
            <h1 className="text-4xl font-bold">Delete Your Account</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            You can permanently delete your Kerabie Mail account and all associated data at any time.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto max-w-2xl px-4 space-y-10">

          {/* Option 1 — In-app */}
          <div className="rounded-xl border p-6 space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">1</span>
              Delete from within the app
            </h2>
            <p className="text-muted-foreground">
              The quickest way to delete your account is directly from the app:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Open Kerabie Mail and sign in</li>
              <li>Go to <strong>Settings → Security</strong></li>
              <li>Scroll to <strong>Danger zone</strong></li>
              <li>Tap <strong>Delete account</strong> and confirm with your password</li>
            </ol>
            <p className="text-sm text-muted-foreground">
              Your account and all mailboxes, emails, contacts, and calendar data will be permanently deleted immediately.
            </p>
          </div>

          {/* Option 2 — Email request */}
          <div className="rounded-xl border p-6 space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">2</span>
              Request deletion by email
            </h2>
            <p className="text-muted-foreground">
              If you cannot access your account, send a deletion request to our support team:
            </p>
            <a
              href="mailto:support@kerabie.email?subject=Account%20Deletion%20Request"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <Mail className="h-4 w-4" />
              support@kerabie.email
            </a>
            <p className="text-sm text-muted-foreground">
              Include the email address associated with your account. We will process your request within 7 business days.
            </p>
          </div>

          {/* What gets deleted */}
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              What gets deleted
            </h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Your account and all login credentials</li>
              <li>All mailboxes and email messages</li>
              <li>Contacts and calendar data</li>
              <li>Subscription and billing records (after the current period ends)</li>
              <li>AI usage history and preferences</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Deletion is permanent and cannot be undone. If you have an active paid subscription, cancel it before deleting your account to avoid further charges.
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
