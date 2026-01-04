'use client';
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { blackblazebucket } from "@/lib/constants/links";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface HeaderProps {
  variant?: 'default' | 'overlay';
}

export const Header = ({ variant = 'default' }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (variant !== 'overlay') return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant]);

  // Determine if we should use overlay styling (white text on transparent bg)
  const useOverlayStyle = variant === 'overlay' && !isScrolled;
  
  const headerBgClass = useOverlayStyle 
    ? "bg-transparent" 
    : "bg-white shadow-sm";
  
  const textClass = useOverlayStyle 
    ? "text-white" 
    : "text-foreground";
  
  const hoverClass = useOverlayStyle 
    ? "hover:text-white/80" 
    : "hover:text-primary";
  
  const activeClass = useOverlayStyle 
    ? "text-white" 
    : "text-primary";

  const buttonClass = useOverlayStyle
    ? "bg-white text-primary hover:bg-white/90"
    : "bg-primary hover:bg-primary-hover text-primary-foreground";

  const logo = useOverlayStyle
    ? blackblazebucket +"/assets/images/logo-white.png"
    : blackblazebucket +"/assets/images/logo.png";

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${headerBgClass}`}>
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <NavLink href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">
            <Image src={logo} alt="Logo" width={50} height={50} />
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-8 md:flex">
          <NavLink
            href="/"
            className={`text-sm font-medium ${textClass} transition-colors ${hoverClass}`}
            activeClassName={activeClass}
          >
            Home
          </NavLink>
          <NavLink
            href="/features"
            className={`text-sm font-medium ${textClass} transition-colors ${hoverClass}`}
            activeClassName={activeClass}
          >
            Features
          </NavLink>
          <NavLink
            href="/about"
            className={`text-sm font-medium ${textClass} transition-colors ${hoverClass}`}
            activeClassName={activeClass}
          >
            About
          </NavLink>
          <NavLink
            href="/downloads"
            className={`text-sm font-medium ${textClass} transition-colors ${hoverClass}`}
            activeClassName={activeClass}
          >
            Downloads
          </NavLink>
          <NavLink
            href="/contact"
            className={`text-sm font-medium ${textClass} transition-colors ${hoverClass}`}
            activeClassName={activeClass}
          >
            Contact
          </NavLink>
          <Button size="sm" className={buttonClass}>
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden ${textClass}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background md:hidden">
          <div className="container mx-auto space-y-1 px-4 py-4">
            <NavLink
              href="/"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              activeClassName="bg-muted text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              href="/features"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              activeClassName="bg-muted text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </NavLink>
            <NavLink
              href="/about"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              activeClassName="bg-muted text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </NavLink>
            <NavLink
              href="/downloads"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              activeClassName="bg-muted text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Downloads
            </NavLink>
            <NavLink
              href="/contact"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              activeClassName="bg-muted text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </NavLink>
            <div className="pt-2">
              <Button className="w-full bg-primary hover:bg-primary-hover">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};