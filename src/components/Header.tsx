'use client';
import { NavLink } from "@/components/NavLink";
import { Corners } from "@/components/ui/corners";
import { blackblazebucket } from "@/lib/constants/links";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/downloads", label: "Downloads" },
  { href: "/blog", label: "Blog" },
  { href: "/partner", label: "Partner" },
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-md">
      <div className="container mx-auto flex h-[70px] items-center gap-7 px-4">
        <NavLink href="/" className="mr-auto flex items-center">
          <Image src={blackblazebucket + "/assets/images/logo.png"} alt="Kerabie" width={44} height={27} priority />
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-5 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              className="text-sm text-foreground transition-colors hover:text-primary"
              activeClassName="text-primary font-medium"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <NavLink
            href="/auth/login"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Sign in
          </NavLink>
          <NavLink
            href="/auth/register"
            className="blueprint relative inline-flex items-center gap-2 border border-primary bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:px-4"
          >
            <Corners className="text-white/55" />
            Get free mailbox
            <ArrowRight size={14} className="hidden sm:inline" />
          </NavLink>

          {/* Mobile Menu Button */}
          <button
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="flex h-[42px] w-[42px] items-center justify-center border border-border bg-white transition-colors hover:bg-muted lg:hidden"
          >
            <span className="grid w-[18px] gap-[5px]">
              <span
                className="block h-[1.5px] bg-foreground transition-transform duration-200"
                style={{ transform: mobileMenuOpen ? "translateY(6.5px) rotate(45deg)" : "none" }}
              />
              <span
                className="block h-[1.5px] bg-foreground transition-opacity duration-200"
                style={{ opacity: mobileMenuOpen ? 0 : 1 }}
              />
              <span
                className="block h-[1.5px] bg-foreground transition-transform duration-200"
                style={{ transform: mobileMenuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none" }}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          className="relative overflow-hidden border-t border-white/10 bg-[#1A1F1E] px-4 pb-7 pt-5 lg:hidden"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,237,235,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(232,237,235,.05) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        >
          <div className="relative grid gap-0.5">
            {NAV_LINKS.map((link, i) => (
              <NavLink
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between gap-3 border-b border-white/10 py-4 text-lg font-semibold text-[#E8EDEB] transition-colors hover:text-[#8FB3A6] last:border-b-0"
              >
                {link.label}
                <span className="font-mono text-[11px] text-[#8A9E98]">{String(i + 1).padStart(2, "0")}</span>
              </NavLink>
            ))}

            <div className="mt-4 grid gap-2.5">
              <NavLink
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="blueprint relative flex items-center justify-center gap-2 border border-primary bg-primary px-4 py-4 text-[15px] font-semibold text-white"
              >
                <Corners className="text-white/55" />
                Get free mailbox
                <ArrowRight size={15} />
              </NavLink>
              <NavLink
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 border border-white/30 px-4 py-4 text-[15px] font-semibold text-[#E8EDEB]"
              >
                Sign in
              </NavLink>
            </div>

            <span className="mt-4 flex items-center gap-2 font-mono text-[10.5px] tracking-wider text-[#8A9E98]">
              <span className="block h-1.5 w-1.5 animate-[k-pulse_2s_infinite] bg-[#4CAF80]" />
              SUPPORT ONLINE — REPLIES UNDER 2H
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
