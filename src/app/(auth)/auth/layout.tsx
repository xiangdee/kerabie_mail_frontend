export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Decorative side */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div className="flex items-center gap-2 font-bold text-xl">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.15" />
            <path d="M6 10l10 7 10-7" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <rect x="6" y="10" width="20" height="14" rx="2" stroke="white" strokeWidth="2" />
          </svg>
          Kerabie Mail
        </div>

        <blockquote className="space-y-2">
          <p className="text-lg font-medium leading-relaxed">
            &ldquo;Professional email hosting that just works. Fast delivery, rock-solid reliability, and the privacy controls we needed from day one.&rdquo;
          </p>
          <footer className="text-sm opacity-80">Amara O. — CTO, Buildfast Labs</footer>
        </blockquote>

        <div className="space-y-1 text-sm opacity-70">
          <p>Trusted by 1,200+ businesses across Africa and beyond.</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 font-bold text-lg mb-8 lg:hidden">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" fillOpacity="0.15" />
              <path d="M6 10l10 7 10-7" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
              <rect x="6" y="10" width="20" height="14" rx="2" stroke="hsl(var(--primary))" strokeWidth="2" />
            </svg>
            Kerabie Mail
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
