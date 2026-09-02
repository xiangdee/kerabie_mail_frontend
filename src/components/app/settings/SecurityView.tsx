'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Monitor, Smartphone, Loader2, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { Session } from '@/lib/hooks/useSecurity';

function deviceIcon(ua: string | null) {
  const lower = (ua ?? '').toLowerCase();
  if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
    return <Smartphone className="h-4 w-4 text-muted-foreground" />;
  }
  return <Monitor className="h-4 w-4 text-muted-foreground" />;
}

function parseDevice(ua: string | null) {
  if (!ua) return 'Unknown device';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return ua.slice(0, 40);
}

export interface SecurityRecommendation {
  id: string;
  title: string;
  desc: string;
  done: boolean;
}

interface Props {
  sessions: Session[];
  isLoading: boolean;
  isRevoking: boolean;
  isRevokingAll: boolean;
  recommendations: SecurityRecommendation[];
  onRevoke: (id: number) => void;
  onRevokeAll: () => void;
}

export default function SecurityView({
  sessions, isLoading, isRevoking, isRevokingAll, recommendations,
  onRevoke, onRevokeAll,
}: Props) {
  const otherSessions = sessions.filter((s) => !s.is_current);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security</h1>
        <p className="text-muted-foreground mt-1">
          Manage active sessions and review account access.
        </p>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Devices currently signed in to your account.
              </CardDescription>
            </div>
            {otherSessions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRevokeAll}
                disabled={isRevokingAll}
                className="text-destructive border-destructive/30 hover:bg-destructive/5"
              >
                {isRevokingAll && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Sign out all other devices
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Shield className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No active sessions found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 border border-border rounded-xl"
                >
                  <div className="shrink-0">{deviceIcon(session.user_agent)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {parseDevice(session.user_agent)}
                      </span>
                      {session.is_current && (
                        <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                          Current session
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.ip_address ?? 'Unknown location'} · Active{' '}
                      {formatDistanceToNow(new Date(session.last_active_at ?? session.created_at), { addSuffix: true })}
                      {' '}· Signed in {format(new Date(session.created_at), 'PP')}
                    </p>
                  </div>
                  {!session.is_current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRevoke(session.id)}
                      disabled={isRevoking}
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      {isRevoking ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <LogOut className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Security recommendations</CardTitle>
          <CardDescription>
            {recommendations.filter((r) => r.done).length} of {recommendations.length} in good shape
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map(({ id, title, desc, done }) => (
            <div key={id} className="flex gap-3 p-3 bg-muted/30 rounded-xl">
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
