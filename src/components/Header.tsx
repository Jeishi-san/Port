"use client";

import React from "react";
import Image from "next/image";
import { Copy, Check, Download, X, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";

interface HeaderProps {
  avatarUrl: string;
  copied: boolean;
  handleCopyEmail: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Header({ avatarUrl, copied, handleCopyEmail, mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const emailAddress = "pasaportejohnchristian@gmail.com";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#"
          className="group flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-85"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono font-bold text-sm shadow-xs transition-transform group-hover:scale-105 bg-glow">
            <Image src={avatarUrl} alt="John Christian Pasaporte avatar" width={36} height={36} className="size-6 rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-tight">John Christian Pasaporte</span>
            <span className="text-[12px] text-muted-foreground leading-tight">Information Security Specialist</span>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-base font-medium text-muted-foreground">
          <a href="#about" className="transition-colors hover:text-foreground">About</a>
          <a href="#projects" className="transition-colors hover:text-foreground">Projects</a>
          <a href="#skills" className="transition-colors hover:text-foreground">Skills</a>
          <a href="#education" className="transition-colors hover:text-foreground">Education</a>
          <a href="#experience" className="transition-colors hover:text-foreground">Experience</a>
          <a href="#contact" className="transition-colors hover:text-foreground">Contact</a>
        </nav>

        <ThemeToggle />

        <div className="hidden sm:flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleCopyEmail} className="gap-1.5 cursor-pointer">
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-500 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span className="text-xs">Copy Email</span>
              </>
            )}
          </Button>
          <a href="/resume.pdf" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm", className: "gap-2 cursor-pointer" })}>
            <Download className="size-3.5" />
            <span className="text-xs">Resume</span>
          </a>
          <a href="#contact" className={buttonVariants({ size: "sm" })}>Hire Me</a>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex p-2 text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-base font-medium">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-1 text-muted-foreground hover:text-foreground">About</a>
            <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="py-1 text-muted-foreground hover:text-foreground">Projects</a>
            <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="py-1 text-muted-foreground hover:text-foreground">Skills</a>
            <a href="#education" onClick={() => setMobileMenuOpen(false)} className="py-1 text-muted-foreground hover:text-foreground">Education</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="py-1 text-muted-foreground hover:text-foreground">Experience</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-1 text-muted-foreground hover:text-foreground">Contact</a>
            <div className="pt-2 flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyEmail} className="w-full justify-center">
                {copied ? "Email Copied!" : "Copy Email"}
              </Button>
              <a href="/resume.pdf" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full justify-center gap-2 cursor-pointer" })}>
                <Download className="size-3.5" />
                <span>Resume</span>
              </a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className={buttonVariants({ size: "sm", className: "w-full justify-center" })}>Hire Me</a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
