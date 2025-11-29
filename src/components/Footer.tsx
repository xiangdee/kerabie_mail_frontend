import { NavLink } from "@/components/NavLink";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Kerabie Email</h3>
            <p className="text-sm opacity-90">
              Reliable business email built for growing teams.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink href="/features" className="opacity-90 hover:opacity-100">
                  Features
                </NavLink>
              </li>
              <li>
                <NavLink href="/downloads" className="opacity-90 hover:opacity-100">
                  Downloads
                </NavLink>
              </li>
              <li>
                <a href="#pricing" className="opacity-90 hover:opacity-100">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink href="/about" className="opacity-90 hover:opacity-100">
                  About
                </NavLink>
              </li>
              <li>
                <NavLink href="/contact" className="opacity-90 hover:opacity-100">
                  Contact
                </NavLink>
              </li>
              <li>
                <NavLink href="/privacy" className="opacity-90 hover:opacity-100">
                  Privacy
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="opacity-90 hover:opacity-100">
                <Mail size={20} />
              </a>
              <a href="#" className="opacity-90 hover:opacity-100">
                <Twitter size={20} />
              </a>
              <a href="#" className="opacity-90 hover:opacity-100">
                <Linkedin size={20} />
              </a>
              <a href="#" className="opacity-90 hover:opacity-100">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-hover pt-8 text-center text-sm opacity-90">
          <p>&copy; 2025 Kerabie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
