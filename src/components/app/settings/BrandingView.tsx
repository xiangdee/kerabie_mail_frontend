'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette, Loader2 } from 'lucide-react';
import type { Branding } from '@/lib/types/api.types';

interface Props {
  branding: Branding | undefined;
  isLoading: boolean;
  isSaving: boolean;
  isClearing: boolean;
  onSave: (data: { brand_logo_url: string | null; brand_color: string | null; brand_name: string | null }) => void;
  onClear: () => void;
}

export default function BrandingView({ branding, isLoading, isSaving, isClearing, onSave, onClear }: Props) {
  const [logoUrl, setLogoUrl] = useState('');
  const [color, setColor] = useState('#6b7280');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!branding) return;
    setLogoUrl(branding.brand_logo_url ?? '');
    setColor(branding.brand_color ?? '#6b7280');
    setName(branding.brand_name ?? '');
  }, [branding]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Custom Branding</h1>
        <p className="text-muted-foreground mt-1">
          Your own logo and color instead of Kerabie&apos;s, shown in the webmail app and on the footer of emails you send.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" /> Branding
          </CardTitle>
          <CardDescription>Premium feature — upgrade your plan to enable it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!branding?.enabled ? (
            <div className="text-center py-8 text-muted-foreground">
              <Palette className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Custom branding is a Premium feature.</p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Brand Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Company" />
              </div>
              <div className="space-y-1.5">
                <Label>Logo URL</Label>
                <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
              </div>
              <div className="space-y-1.5">
                <Label>Brand Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-14 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#6b7280" className="max-w-[140px]" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  disabled={isSaving}
                  onClick={() => onSave({ brand_logo_url: logoUrl || null, brand_color: color || null, brand_name: name || null })}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button variant="outline" disabled={isClearing} onClick={onClear}>
                  Clear
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
