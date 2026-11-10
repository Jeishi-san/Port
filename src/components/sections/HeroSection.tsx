"use client";

import React from "react";
import { ChevronRight, Mail, Copy, Check, Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/StatCard";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import type { Project, Education, Experience } from "@/app/page";

interface HeroSectionProps {
  projects: Project[];
  education: Education[];
  experiences: Experience[];
  copied: boolean;
  handleCopyEmail: () => void;
}

export function HeroSection({ projects, education, experiences, copied, handleCopyEmail }: HeroSectionProps) {
  const emailAddress = "pasaportejohnchristian@gmail.com";

  const githubContributions = projects.reduce(
    (acc, p) => acc + (parseInt(p.metrics.match(/\\d+/)?.[0] || "0") || 0),
    0
  );

  return (
    <section id="about" className="pt-16 pb-20 md:pt-24 md:pb-28 scroll-mt-[80px]">
      <div className="flex flex-col items-start gap-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span>Available for entry-level & internship opportunities</span>
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-gradient">
          Building things that matter, one line of code at a time.
        </h1>

        <p className="text-xl text-muted-foreground sm:text-2xl leading-relaxed">
          I&apos;m <span className="font-semibold text-foreground">John Christian Pasaporte</span>, a BSIT
          graduate majoring in Information Security with hands-on experience supporting enterprise
          infrastructure and end users. I combine practical technical troubleshooting with a security-first
          approach to maintain high system availability and ensure data integrity across organizational
          workflows.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a href="#projects" className={buttonVariants({ size: "lg", className: "gap-2 shadow-xs cursor-pointer" })}>
            View Projects <ChevronRight className="size-4" />
          </a>
          <a href="/resume.pdf" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "lg", className: "gap-2 cursor-pointer" })}>
            <Download className="size-4" /> View Resume
          </a>
          <a href="#contact" className={buttonVariants({ variant: "outline", size: "lg", className: "gap-2 cursor-pointer" })}>
            <Mail className="size-4" /> Get in Touch
          </a>
          <button
            onClick={handleCopyEmail}
            className={buttonVariants({ variant: "ghost", size: "lg", className: "gap-2 text-muted-foreground hover:text-foreground cursor-pointer" })}
          >
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            <span>{copied ? "Copied address" : emailAddress}</span>
          </button>
        </div>

        <div className="flex items-center gap-4 pt-4 text-muted-foreground">
          <span className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Connect:</span>
          <a href="https://github.com/Jeishi-san" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground p-1" aria-label="GitHub Profile">
            <GithubIcon className="size-5" />
          </a>
          <a href="https://linkedin.com/in/john-christian-pasaporte26" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground p-1" aria-label="LinkedIn Profile">
            <LinkedinIcon className="size-5" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-8 sm:grid-cols-4 w-full border-t border-border/60 mt-4">
          <StatCard value={projects.length} label="Projects Built" />
          <StatCard value={education.length} label="Degree Earned" />
          <StatCard value={experiences.length} label="Internships" />
          <StatCard value={`${githubContributions}+`} label="GitHub Contributions" />
        </div>
      </div>
    </section>
  );
}
