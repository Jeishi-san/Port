"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GithubIcon } from "@/components/icons";
import { ArrowUpRight, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Project } from "@/app/page";

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export const ProjectCard = React.memo(({ project, onClick }: ProjectCardProps) => {
  return (
    <Card
      onClick={() => onClick(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(project);
        }
      }}
      className="flex flex-col justify-between border-border/70 hover:border-primary hover:bg-card/80 transition-all duration-200 hover:shadow-md bg-card/60 backdrop-blur-xs group cursor-pointer"
    >
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge variant="secondary" className="text-\[12px\] font-normal">
              {project.category}
            </Badge>
            {project.featured && (
              <span className="inline-flex items-center gap-1 text-\[12px\] font-medium text-amber-500 dark:text-amber-400">
                <Star className="size-3 fill-current" /> Featured
              </span>
            )}
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {project.title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground line-clamp-3 mt-1.5">
            {project.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="rounded-md bg-muted/40 p-2.5 text-sm text-foreground/80 font-mono mb-4 border border-border/40 flex items-center justify-between">
            <span className="text-muted-foreground text-\[12px\]">Impact:</span>
            <span className="font-medium text-primary text-\[12px\]">{project.metrics}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs py-0 px-2 text-muted-foreground border-border/60"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-3 border-t border-border/40 flex items-center justify-between">
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <GithubIcon className="size-3.5" />
          <span>Source</span>
        </a>

        <a
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "link", className: "text-sm font-medium" })}
        >
          <span>Live Preview</span>
          <ArrowUpRight className="size-3.5" />
        </a>
      </CardFooter>
    </Card>
  );
});

ProjectCard.displayName = "ProjectCard";
