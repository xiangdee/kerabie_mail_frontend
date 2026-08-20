import Image from 'next/image';
import { NavLink } from '@/components/NavLink';
import { Corners } from '@/components/ui/corners';
import { Mail } from 'lucide-react';

export default function EmailFeaturesBanner() {
  return (
    <div className="pt-14 text-center">
      <span className="inline-flex items-center gap-2.5">
        <span className="grid h-[38px] w-[38px] place-items-center border border-border bg-muted">
          <Image src="/k-leaf-icon.png" width={18} height={18} alt="Kerabie" />
        </span>
        <span className="border border-border bg-muted px-5 py-2.5 text-xs font-semibold tracking-[.1em] text-primary-hover">
          OUR FEATURES
        </span>
      </span>

      <h1 className="mx-auto mt-5 mb-3.5 max-w-[24ch] text-4xl leading-[1.1] tracking-tight sm:text-[54px]">
        Maximize engagement with a smart email <span className="text-primary">service</span>
      </h1>
      <p className="mx-auto max-w-[62ch] text-[15.5px] leading-relaxed text-muted-foreground">
        Kerabie Mail empowers businesses with advanced email tools to drive engagement and
        conversions. Automate, personalise and solve every business emailing need.
      </p>

      <div className="mx-auto mt-[22px] flex max-w-[520px] flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="email"
            placeholder="Enter your email"
            className="h-12 w-full border border-border bg-white px-4 pr-10 text-sm outline-none focus:border-primary"
          />
          <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
        <NavLink
          href="/auth/register"
          className="blueprint relative flex h-12 items-center justify-center gap-2 whitespace-nowrap border border-primary bg-primary px-[22px] text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
        >
          <Corners className="text-white/50" />
          Get Kerabie
        </NavLink>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        By submitting this form, you agree to our{' '}
        <NavLink href="/terms" className="underline hover:text-foreground">Terms of Service</NavLink>.
      </p>
    </div>
  );
}
