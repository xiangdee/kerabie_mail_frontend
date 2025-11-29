'use client';
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <NavLink href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">kerabie.email</span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-8 md:flex">
          <NavLink
            href="/"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            activeClassName="text-primary"
          >
            Home
          </NavLink>
          <NavLink
            href="/features"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            activeClassName="text-primary"
          >
            Features
          </NavLink>
          <NavLink
            href="/about"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            activeClassName="text-primary"
          >
            About
          </NavLink>
          <NavLink
            href="/downloads"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            activeClassName="text-primary"
          >
            Downloads
          </NavLink>
          <NavLink
            href="/contact"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            activeClassName="text-primary"
          >
            Contact
          </NavLink>
          <Button size="sm" className="bg-primary hover:bg-primary-hover">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
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
