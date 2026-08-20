import Image from 'next/image';

export default function AboutBanner() {
  return (
    <div className="pt-16 text-center">
      <span className="inline-flex items-center gap-2.5">
        <span className="grid h-[38px] w-[38px] place-items-center border border-border bg-muted">
          <Image src="/k-leaf-icon.png" width={18} height={18} alt="Kerabie" />
        </span>
        <span className="border border-border bg-muted px-5 py-2.5 text-xs font-semibold tracking-[.1em] text-primary-hover">
          ABOUT KERABIE
        </span>
      </span>

      <h1 className="mx-auto mt-5 mb-3 max-w-[24ch] text-4xl leading-[1.08] tracking-tight sm:text-[54px]">
        Built for businesses that need email to <span className="text-primary">just work</span>
      </h1>
      <p className="mx-auto max-w-[60ch] text-base text-muted-foreground">
        Kerabie delivers a stable, secure and fully optimised email experience that respects your
        mailbox as it scales. From high deliverability to intuitive features, we help businesses
        communicate with clarity and confidence.
      </p>
    </div>
  );
}
