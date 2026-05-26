'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Mail, Monitor, Shield, Loader2 } from 'lucide-react';
import type { NotificationPrefs } from '@/lib/hooks/useNotifications';

interface PrefRowProps {
  id: keyof NotificationPrefs;
  label: string;
  description: string;
  prefs: NotificationPrefs;
  onChange: (key: keyof NotificationPrefs, value: boolean) => void;
}

function PrefRow({ id, label, description, prefs, onChange }: PrefRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <Label htmlFor={id} className="cursor-pointer font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch
        id={id}
        checked={prefs[id]}
        onCheckedChange={(v) => onChange(id, v)}
      />
    </div>
  );
}

interface Props {
  prefs: NotificationPrefs;
  isLoading: boolean;
  isSaving: boolean;
  onChange: (key: keyof NotificationPrefs, value: boolean) => void;
  onSave: () => void;
}

export default function NotificationsView({ prefs, isLoading, isSaving, onChange, onSave }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        </div>
        <Card><CardContent className="pt-6 space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Choose what you want to be notified about.
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Notifications sent to your registered email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <PrefRow
            id="email_new_message"
            label="New message"
            description="Get an email when you receive a new message."
            prefs={prefs}
            onChange={onChange}
          />
          <PrefRow
            id="email_weekly_digest"
            label="Weekly digest"
            description="A summary of your mailbox activity each week."
            prefs={prefs}
            onChange={onChange}
          />
          <PrefRow
            id="email_security_alerts"
            label="Security alerts"
            description="Notify me of new sign-ins and suspicious activity."
            prefs={prefs}
            onChange={onChange}
          />
          <PrefRow
            id="email_product_updates"
            label="Product updates"
            description="New features, tips, and announcements from Kerabie."
            prefs={prefs}
            onChange={onChange}
          />
        </CardContent>
      </Card>

      {/* Browser Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Browser Notifications
          </CardTitle>
          <CardDescription>
            Push notifications in the webmail client.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <PrefRow
            id="browser_new_message"
            label="New message"
            description="Show a browser notification when a new message arrives."
            prefs={prefs}
            onChange={onChange}
          />
          <PrefRow
            id="browser_security_alerts"
            label="Security alerts"
            description="Immediate in-browser alerts for security events."
            prefs={prefs}
            onChange={onChange}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save preferences
        </Button>
      </div>
    </div>
  );
}
