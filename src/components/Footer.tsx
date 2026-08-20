import { NavLink } from "@/components/NavLink";
import { blackblazebucket } from "@/lib/constants/links";
import { Mail, Twitter, Linkedin } from "lucide-react";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="mt-[88px] bg-primary text-primary-foreground">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 pb-7 pt-[52px] sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Image
            src={blackblazebucket + "/assets/images/logo-white.png"}
            alt="Kerabie"
            width={40}
            height={25}
            className="mb-3"
          />
          <p className="mb-4 max-w-[34ch] text-sm text-white/70">
            Professional email built for growing teams.
          </p>
          <NavLink
            href="/auth/register"
            className="inline-flex items-center gap-2 border border-white/35 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Get free mailbox
          </NavLink>
        </div>

        <div className="grid content-start gap-2.5">
          <span className="font-mono text-[10.5px] tracking-wider text-white/70">PRODUCT</span>
          <NavLink href="/features" className="text-sm text-white/85 transition-colors hover:text-white">Features</NavLink>
          <NavLink href="/downloads" className="text-sm text-white/85 transition-colors hover:text-white">Downloads</NavLink>
          <NavLink href="/pricing" className="text-sm text-white/85 transition-colors hover:text-white">Pricing</NavLink>
        </div>

        <div className="grid content-start gap-2.5">
          <span className="font-mono text-[10.5px] tracking-wider text-white/70">COMPANY</span>
          <NavLink href="/about" className="text-sm text-white/85 transition-colors hover:text-white">About</NavLink>
          <NavLink href="/contact" className="text-sm text-white/85 transition-colors hover:text-white">Contact</NavLink>
          <NavLink href="/partner" className="text-sm text-white/85 transition-colors hover:text-white">Partner</NavLink>
        </div>

        <div className="grid content-start gap-2.5">
          <span className="font-mono text-[10.5px] tracking-wider text-white/70">PRIVACY &amp; LEGAL</span>
          <NavLink href="/privacy" className="text-sm text-white/85 transition-colors hover:text-white">Privacy</NavLink>
          <NavLink href="/refund-policy" className="text-sm text-white/85 transition-colors hover:text-white">Refund Policy</NavLink>
          <NavLink href="/terms" className="text-sm text-white/85 transition-colors hover:text-white">Terms</NavLink>
        </div>
      </div>

      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 border-t border-white/15 px-4 py-4">
        <span className="text-[12.5px] text-white/70">© 2025 Kerabie. All rights reserved.</span>
        <span className="flex gap-3.5">
          <a href="#" aria-label="Twitter" className="text-white/70 transition-colors hover:text-white"><Twitter size={16} /></a>
          <a href="#" aria-label="LinkedIn" className="text-white/70 transition-colors hover:text-white"><Linkedin size={16} /></a>
          <NavLink href="/contact" aria-label="Email" className="text-white/70 transition-colors hover:text-white"><Mail size={16} /></NavLink>
        </span>
      </div>
    </footer>
  );
};
