"use client";

import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/app/page";

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  if (!isOpen || !project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="bg-card border border-border/80 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-detail-title"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-\[12px\] font-normal">
              {project.category}
            </Badge>
            {project.featured && (
              <span className="inline-flex items-center gap-1 text-\[12px\] font-medium text-amber-500 dark:text-amber-400">
                <span className="size-3 fill-current" /> Featured
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close details"
          >
            <X className="size-5" />
          </button>
        </div>

        <h2 id="project-detail-title" className="text-2xl font-bold tracking-tight text-foreground mb-2">
          {project.title}
        </h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">{project.description}</p>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="rounded-md bg-muted/40 p-2.5 text-sm text-foreground/80 font-mono border border-border/40 flex items-center justify-between w-full">
            <span className="text-muted-foreground text-\[12px\]">Impact:</span>
            <span className="font-medium text-primary text-\[12px\]">{project.metrics}</span>
          </div>
          <div className="flex gap-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                Live Preview <span className="size-4" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                <span className="size-4" /> Source
              </a>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Technologies
          </h3>
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
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Click outside or press Esc to close
        </p>
      </div>
    </div>
  );
}
