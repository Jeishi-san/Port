"use client";

import React from "react";
import { Zap, Code } from "lucide-react";
import type { SkillCategory } from "@/app/page";

interface SkillsSectionProps {
  skillCategories: SkillCategory[];
}

export function SkillsSection({ skillCategories }: SkillsSectionProps) {
  return (
    <section id="skills" className="py-16 border-t border-border/60 scroll-mt-[80px]">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-2">
          <Zap className="size-4" />
          <span>Competencies</span>
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Skills & Tech Stack
        </h2>
        <p className="text-base text-muted-foreground mt-1 max-w-xl">
          Technologies and tools I&apos;ve learned through coursework, projects, and internships.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillCategories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur-xs transition-all hover:border-border hover:shadow-xs"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Code className="size-4" />
              </div>
              <h3 className="font-semibold text-base text-foreground">{cat.name}</h3>
            </div>

            <ul className="space-y-2">
              {cat.skills.map((skill) => (
                <li
                  key={skill.id}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="size-1.5 rounded-full bg-primary/60" />
                  <span>{skill.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
