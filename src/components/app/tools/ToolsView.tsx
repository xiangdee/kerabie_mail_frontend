'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ExternalLink, Webhook, KeyRound, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiLink } from '@/lib/constants/links';
import type { Integration } from '@/lib/types/api.types';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

// Icons already ship in public/images/icons/ — keyed by catalog id so a new
// catalog entry from the backend just falls back to no icon rather than 404s.
const ICONS: Record<string, { src: string; width: number; height: number }> = {
  zapier: { src: '/images/icons/zapier-icon.svg', width: 32, height: 32 },
  n8n: { src: '/images/icons/n8n-icon.png', width: 32, height: 32 },
  make: { src: '/images/icons/make-com.webp', width: 32, height: 32 },
  claude: { src: '/images/icons/claude-icon.svg', width: 32, height: 32 },
};

interface Props {
  integrations: Integration[];
  isLoading: boolean;
}

export default function ToolsView({ integrations, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-none" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-56 rounded-none" />
          <Skeleton className="h-56 rounded-none" />
          <Skeleton className="h-56 rounded-none" />
          <Skeleton className="h-56 rounded-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-none')}>Tools &amp; Integrations</h1>
        <div className="text-console-muted mt-1.5 max-w-[70ch]">
          Connect Kerabie Mail to automation platforms and LLM agents.
        </div>
      </div>

      {integrations.length === 0 ? (
        <div className="border border-console-border bg-white p-12 text-center">
          <p className="text-sm text-console-muted">No integrations available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      )}
    </div>
  );
}

// One block per line the target install surface reads directly off — a copy
// button next to a bare URL still makes the user hand-assemble the actual
// install step themselves. These are already-complete: paste into a shell,
// or drop straight into a client's config file, nothing left to fill in
// besides the API key placeholder.
function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative">
      <pre className={cn(MONO, 'text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-all border border-console-border-soft bg-console-accent-tint px-2.5 py-2 pr-9')}>
        {text}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy"
        className="absolute top-2 right-2 text-console-muted2 hover:text-console-accent"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

// Complete, paste-ready install snippets for the MCP server, one per client
// surface — a Claude Code CLI one-liner, a claude_desktop_config.json block
// (same mcpServers shape most other MCP clients also read), and a raw curl
// sanity check to confirm the key/endpoint work before wiring up a client.
function McpInstallBlock({ url }: { url: string }) {
  const cliCommand = `claude mcp add --transport http kerabie-mail ${url} --header "X-API-Key: YOUR_API_KEY"`;

  const desktopConfig = JSON.stringify(
    {
      mcpServers: {
        'kerabie-mail': {
          url,
          headers: { 'X-API-Key': 'YOUR_API_KEY' },
        },
      },
    },
    null,
    2
  );

  const curlCheck = `curl -X POST ${url} \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`;

  return (
    <Tabs defaultValue="cli" className="w-full">
      <TabsList className="h-8">
        <TabsTrigger value="cli" className="text-xs px-2.5 py-1">Claude Code</TabsTrigger>
        <TabsTrigger value="desktop" className="text-xs px-2.5 py-1">Claude Desktop / JSON</TabsTrigger>
        <TabsTrigger value="curl" className="text-xs px-2.5 py-1">Test with curl</TabsTrigger>
      </TabsList>
      <TabsContent value="cli" className="mt-2 space-y-1.5">
        <p className="text-xs text-console-muted">Run this in a terminal, swapping in a real key from Settings → API Keys:</p>
        <CopyBlock text={cliCommand} />
      </TabsContent>
      <TabsContent value="desktop" className="mt-2 space-y-1.5">
        <p className="text-xs text-console-muted">
          Paste into <span className={MONO}>claude_desktop_config.json</span> (or any other MCP
          client that reads the same <span className={MONO}>mcpServers</span> shape):
        </p>
        <CopyBlock text={desktopConfig} />
      </TabsContent>
      <TabsContent value="curl" className="mt-2 space-y-1.5">
        <p className="text-xs text-console-muted">Sanity-check the server responds before wiring up a client:</p>
        <CopyBlock text={curlCheck} />
      </TabsContent>
    </Tabs>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const icon = ICONS[integration.id];
  const isMcp = integration.kind === 'mcp';
  const mcpUrl = integration.endpoint ? `${apiLink}${integration.endpoint}` : null;

  return (
    <Card className="rounded-none border-console-border">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        {icon ? (
          <Image src={icon.src} alt={`${integration.name} icon`} width={icon.width} height={icon.height} className="shrink-0 size-8 object-contain" />
        ) : (
          <div className="size-8 shrink-0 border border-console-border" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn(DISPLAY, 'font-semibold text-lg leading-tight')}>{integration.name}</p>
            <Badge variant={integration.enabled ? 'secondary' : 'outline'} className="text-[10px]">
              {integration.enabled ? 'Available on your plan' : 'Not available on your plan'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-console-muted">{integration.description}</p>

        {isMcp ? (
          <div className="space-y-2">
            <p className="text-xs text-console-muted">
              Point your MCP-compatible client (Claude Desktop, Claude Code, or any other agent
              that speaks the Model Context Protocol) at this server. Paste this straight into
              your client&apos;s MCP config, swap in a real API key, and you&apos;re connected.
            </p>
            {mcpUrl && <McpInstallBlock url={mcpUrl} />}
            <div className="flex items-center gap-3 flex-wrap pt-1">
              <Button asChild variant="outline" size="sm">
                <Link href="/app/settings/api-keys">
                  <KeyRound className="h-3.5 w-3.5 mr-1.5" /> Get an API key
                </Link>
              </Button>
              <a href={integration.docs_url} target="_blank" rel="noopener noreferrer" className="text-xs text-console-muted hover:text-console-accent transition-colors inline-flex items-center gap-1">
                Docs <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-console-muted">
              Works via webhooks: subscribe a webhook endpoint from Settings → Webhooks, then wire
              it up as the trigger on {integration.name}&apos;s side.
            </p>
            <div className="flex items-center gap-3 flex-wrap pt-1">
              <Button asChild variant="outline" size="sm">
                <Link href="/app/settings/webhooks">
                  <Webhook className="h-3.5 w-3.5 mr-1.5" /> Create a webhook
                </Link>
              </Button>
              <a href={integration.docs_url} target="_blank" rel="noopener noreferrer" className="text-xs text-console-muted hover:text-console-accent transition-colors inline-flex items-center gap-1">
                Docs <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
