"use client";

import React from "react";
import { Briefcase, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Experience } from "@/app/page";

interface ExperienceSectionProps {
  experiences: Experience[];
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
    <section id="experience" className="py-16 border-t border-border/60 scroll-mt-[80px]">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-2">
          <Briefcase className="size-4" />
          <span>Internships</span>
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Work Experience
        </h2>
        <p className="text-base text-muted-foreground mt-1 max-w-xl">
          Hands-on experience gained through internships and part-time roles.
        </p>
      </div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:left-3 md:before:left-4 before:h-full before:w-0.5 before:bg-border/60">
        {experiences.map((exp, index) => (
          <div key={index} className="relative flex items-start gap-4 md:gap-6 pl-8 md:pl-10">
            <div className="absolute left-1.5 md:left-2.5 top-1.5 size-3.5 -translate-x-1/2 rounded-full border-2 border-background bg-primary ring-2 ring-primary/20" />

            <div className="flex-1 rounded-xl border border-border/70 bg-card/50 p-6 backdrop-blur-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{exp.role}</h3>
                  <div className="text-base font-medium text-primary flex items-center gap-2">
                    <span>{exp.company}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-sm text-muted-foreground font-normal">{exp.location}</span>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit text-sm font-mono text-muted-foreground" translate="no">
                  {exp.period}
                </Badge>
              </div>

              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                {exp.description}
              </p>

              <ul className="space-y-2 mb-4">
                {exp.achievements.map((ach, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground/90">
                    <ChevronRight className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
                {exp.tech.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
