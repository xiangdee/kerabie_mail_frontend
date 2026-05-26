'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (opts: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function AppToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const addToast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = `t-${++counter.current}`;
    setToasts((prev) => [{ ...opts, id }, ...prev].slice(0, 5));
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismiss }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useAppToast must be used within AppToastProvider');
  const { addToast, dismiss } = ctx;

  return {
    dismiss,
    success: (title: string, opts?: Partial<Omit<Toast, 'id' | 'type' | 'title'>>) =>
      addToast({ type: 'success', title, ...opts }),
    error: (title: string, opts?: Partial<Omit<Toast, 'id' | 'type' | 'title'>>) =>
      addToast({ type: 'error', title, duration: 6000, ...opts }),
    warning: (title: string, opts?: Partial<Omit<Toast, 'id' | 'type' | 'title'>>) =>
      addToast({ type: 'warning', title, ...opts }),
    info: (title: string, opts?: Partial<Omit<Toast, 'id' | 'type' | 'title'>>) =>
      addToast({ type: 'info', title, ...opts }),
    undo: (title: string, onUndo: () => void, opts?: Partial<Omit<Toast, 'id' | 'type' | 'title'>>) =>
      addToast({
        type: 'info',
        title,
        action: { label: 'Undo', onClick: onUndo },
        duration: 5000,
        ...opts,
      }),
  };
}

// ── Confirm Dialog (lightweight inline) ───────────────────────────────────────
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  const confirmClass =
    variant === 'danger'
      ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
      : variant === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white';

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl bg-background border border-border shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', confirmClass)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Internal components ───────────────────────────────────────────────────────
const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
  error: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
  info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
};

const PROGRESS: Record<ToastType, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

const BORDER: Record<ToastType, string> = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-blue-500',
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const duration = t.duration ?? 4000;
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (duration === 0) return;
    const step = 100 / (duration / 50);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p - step <= 0) {
          clearInterval(iv);
          setTimeout(onDismiss, 80);
          return 0;
        }
        return p - step;
      });
    }, 50);
    return () => clearInterval(iv);
  }, [duration, onDismiss]);

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 w-80 rounded-xl border border-l-4 bg-background shadow-xl p-4 transition-all duration-300 ease-out',
        BORDER[t.type],
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      )}
    >
      {ICONS[t.type]}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm font-semibold text-foreground">{t.title}</p>
        {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
        {t.action && (
          <button
            onClick={() => { t.action!.onClick(); onDismiss(); }}
            className="flex items-center gap-1 mt-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <Undo2 className="h-3 w-3" />
            {t.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted rounded-b-xl overflow-hidden">
          <div className={cn('h-full', PROGRESS[t.type])} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function ToastContainer() {
  const ctx = useContext(ToastContext)!;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {ctx.toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={() => ctx.dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
