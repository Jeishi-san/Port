"use client";

import React, { useMemo } from "react";
import { Code2, Star } from "lucide-react";
import { ProjectCard } from "@/components/ui/ProjectCard";
import type { Project } from "@/app/page";

interface ProjectsSectionProps {
  projects: Project[];
  openProjectDetail: (project: Project) => void;
}

export function ProjectsSection({ projects, openProjectDetail }: ProjectsSectionProps) {
  const categories = ["All", "Full Stack", "Frontend", "Backend"];

  const [activeCategory, setActiveCategory] = React.useState("All");

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  return (
    <section id="projects" className="py-16 border-t border-border/60 scroll-mt-[80px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-2">
            <Code2 className="size-4" />
            <span>Featured Work</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Selected Projects
          </h2>
          <p className="text-base text-muted-foreground mt-1 max-w-xl">
            A collection of academic projects, capstone work, and personal builds created while studying Computer Science.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-muted/60 border border-border/50 self-start">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveCategory(category);
                }
              }}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                activeCategory === category
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} onClick={openProjectDetail} />
        ))}
      </div>
    </section>
  );
}
