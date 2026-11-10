"use client";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/20 py-8 text-center text-sm text-muted-foreground">
      <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">John Christian Pasaporte</span>
          <span>- 2026</span>
          <span>-</span>
          <span>All rights reserved.</span>
        </div>

        <div className="flex items-center gap-4">
          <a href="#about" className="hover:text-foreground transition-colors">
            Back to top
          </a>
          <span>-</span>
          <span className="text-\[12px\] text-muted-foreground/80">
            Built with Next.js 16, Tailwind CSS v4 & shadcn/ui
          </span>
        </div>
      </div>
    </footer>
  );
}
