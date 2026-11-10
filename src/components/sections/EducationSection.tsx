"use client";

import React from "react";
import { GraduationCap, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Education } from "@/app/page";

interface EducationSectionProps {
  education: Education[];
}

export function EducationSection({ education }: EducationSectionProps) {
  return (
    <section id="education" className="py-16 border-t border-border/60 scroll-mt-[80px]">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-2">
          <GraduationCap className="size-4" />
          <span>Education</span>
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Academic Background
        </h2>
        <p className="text-base text-muted-foreground mt-1 max-w-xl">
          My formal education and academic achievements in Computer Science.
        </p>
      </div>

      <div className="space-y-8">
        {education.map((edu, index) => (
          <div key={index} className="rounded-xl border border-border/70 bg-card/50 p-6 backdrop-blur-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xl font-bold text-foreground">{edu.degree}</h3>
                <div className="text-base font-medium text-primary flex items-center gap-2">
                  <span>{edu.institution}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-sm text-muted-foreground font-normal">{edu.location}</span>
                </div>
              </div>
              <Badge variant="outline" className="w-fit text-sm font-mono text-muted-foreground" translate="no">
                {edu.period}
              </Badge>
            </div>

            <p className="text-base text-muted-foreground mb-4 leading-relaxed">
              {edu.description}
            </p>

            <ul className="space-y-2 mb-4">
              {edu.achievements.map((ach, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-foreground/90">
                  <ChevronRight className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{ach}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
              {edu.tech.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
