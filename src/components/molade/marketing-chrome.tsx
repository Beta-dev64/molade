import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./app-shell";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/login", label: "Sign in" },
];

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <BrandMark />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#problem" className="transition-colors hover:text-foreground">The problem</a>
          <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <Link to="/login" className="transition-colors hover:text-foreground">Sign in</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link to="/register">Get started</Link>
          </Button>
          <button
            className="grid size-9 place-items-center rounded-lg border border-border md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="grid gap-1 border-t border-border/60 px-5 py-4 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="py-2 text-sm text-muted-foreground" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Button asChild size="sm" className="mt-2">
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      )}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 px-5 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <BrandMark />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Know what matters next. A focused academic companion for coursework, deadlines and
            revision.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm text-muted-foreground">
          <Link to="/app" className="hover:text-foreground">Dashboard</Link>
          <Link to="/login" className="hover:text-foreground">Sign in</Link>
          <Link to="/register" className="hover:text-foreground">Create account</Link>
          <Link to="/app/settings" className="hover:text-foreground">Privacy</Link>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-border/60 pt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Molade. Built for students. Data is used only to run the app.
      </div>
    </footer>
  );
}
