export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-4 sm:px-8 sm:py-7">
      {children}
    </div>
  );
}
