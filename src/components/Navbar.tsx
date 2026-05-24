import { Link } from "@tanstack/react-router";
import { Github, BookOpen, Info, Cpu, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  hideLinks?: boolean;
  showBack?: boolean;
}

export function Navbar({ hideLinks = false, showBack = false }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Cpu className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-semibold tracking-tight">PulseRTL</span>
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground font-medium">RTL Verification & Timing Analysis Workspace</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5">
          {showBack && (
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold shadow-sm h-8.5">
                <ArrowLeft className="h-3.5 w-3.5 text-slate-500" /> Back to Verifier
              </Button>
            </Link>
          )}

          {!hideLinks && (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/synthesizer">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-primary font-semibold hover:bg-sky-50/50 hover:text-primary">
                  <Cpu className="h-4 w-4 text-primary" /> Synthesizer
                </Button>
              </Link>
              <Link to="/docs">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <BookOpen className="h-4 w-4" /> Docs
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <Info className="h-4 w-4" /> About
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
