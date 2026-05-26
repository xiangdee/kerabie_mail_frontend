import SettingsNavClient from './SettingsNavClient';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full">
      <aside className="w-56 border-r shrink-0 pt-8 pb-4 px-3 hidden md:block">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-4">
          Settings
        </p>
        <SettingsNavClient />
      </aside>
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
