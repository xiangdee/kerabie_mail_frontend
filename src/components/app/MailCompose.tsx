'use client';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { X, Minus, Maximize2, Send, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context/auth.context';
import { mailService } from '@/lib/services/mail.service';

interface MailComposeProps {
  mailbox: string;
  replyTo?: { id: string; subject: string; from: string };
  onClose: () => void;
}

export function MailCompose({ mailbox, replyTo, onClose }: MailComposeProps) {
  const { token } = useAuth();
  const [minimized, setMinimized] = useState(false);
  const [toInput, setToInput] = useState(replyTo ? replyTo.from : '');
  const [ccInput, setCcInput] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [composing, setComposing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAi, setShowAi] = useState(false);
  const [tone, setTone] = useState<'professional' | 'friendly' | 'formal' | 'casual'>('professional');
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!toInput.trim() || !subject.trim()) {
      toast.error('Please fill in recipient and subject');
      return;
    }
    setSending(true);
    const res = await mailService.sendEmail(token, {
      mailbox,
      to: toInput.split(',').map((e) => e.trim()).filter(Boolean),
      cc: ccInput ? ccInput.split(',').map((e) => e.trim()).filter(Boolean) : undefined,
      subject,
      body_html: body.replace(/\n/g, '<br>'),
      body_text: body,
      reply_to_id: replyTo?.id,
    });
    setSending(false);
    if (res.status === true) {
      toast.success('Message sent');
      onClose();
    } else {
      toast.error('Failed to send message');
    }
  };

  const handleAiCompose = async () => {
    if (!aiPrompt.trim()) return;
    setComposing(true);
    const res = await mailService.aiCompose(token, {
      prompt: aiPrompt,
      tone,
      subject_hint: subject || undefined,
    });
    setComposing(false);
    if (res.status === true) {
      const data = res.response as { subject?: string; body: string };
      if (data.subject && !subject) setSubject(data.subject);
      setBody(data.body);
      setShowAi(false);
      setAiPrompt('');
      toast.success('AI draft ready');
    } else {
      toast.error('AI compose failed');
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 right-6 z-50 w-[520px] bg-background border border-border rounded-t-xl shadow-2xl flex flex-col',
        minimized ? 'h-12' : 'h-[560px]'
      )}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 h-12 border-b bg-muted/50 rounded-t-xl cursor-pointer select-none"
        onClick={() => minimized && setMinimized(false)}
      >
        <span className="text-sm font-medium truncate">
          {replyTo ? `Re: ${replyTo.subject}` : 'New message'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setMinimized((v) => !v); }}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button className="p-1 rounded hover:bg-muted transition-colors">
            <Maximize2 className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Fields */}
          <div className="flex flex-col border-b text-sm">
            <div className="flex items-center gap-2 px-3 py-2 border-b">
              <span className="text-muted-foreground w-6">To</span>
              <Input
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                placeholder="recipient@example.com"
                className="border-0 shadow-none focus-visible:ring-0 h-auto py-0 px-0"
              />
              <button
                onClick={() => setShowCc((v) => !v)}
                className="text-xs text-muted-foreground hover:text-foreground ml-auto shrink-0"
              >
                Cc
              </button>
            </div>

            {showCc && (
              <div className="flex items-center gap-2 px-3 py-2 border-b">
                <span className="text-muted-foreground w-6">Cc</span>
                <Input
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  placeholder="cc@example.com"
                  className="border-0 shadow-none focus-visible:ring-0 h-auto py-0 px-0"
                />
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-muted-foreground w-16">Subject</span>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="border-0 shadow-none focus-visible:ring-0 h-auto py-0 px-0"
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {showAi ? (
              <div className="flex-1 p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI Compose</span>
                  <button onClick={() => setShowAi(false)} className="ml-auto text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want to write... e.g. 'Follow up on the proposal I sent last week'"
                  className="flex-1 text-sm resize-none h-28"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Tone:</span>
                  {(['professional', 'friendly', 'formal', 'casual'] as const).map((t) => (
                    <Badge
                      key={t}
                      variant={tone === t ? 'default' : 'outline'}
                      className="cursor-pointer text-xs capitalize"
                      onClick={() => setTone(t)}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
                <Button size="sm" onClick={handleAiCompose} disabled={composing || !aiPrompt.trim()} className="w-full">
                  {composing ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Sparkles className="mr-2 h-3 w-3" />}
                  {composing ? 'Composing...' : 'Generate draft'}
                </Button>
              </div>
            ) : (
              <Textarea
                ref={bodyRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message..."
                className="flex-1 border-0 shadow-none focus-visible:ring-0 resize-none rounded-none text-sm p-3 h-full"
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 px-3 py-2 border-t">
            <Button size="sm" onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Send className="mr-2 h-3 w-3" />}
              Send
            </Button>
            <button
              onClick={() => setShowAi((v) => !v)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              AI Compose
            </button>
            <div className="ml-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-40 p-1">
                  <button
                    onClick={onClose}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted text-destructive"
                  >
                    Discard draft
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
