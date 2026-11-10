"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Database } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ProjectDetailModal } from "@/components/ui/ProjectDetailModal";

export type Project = {
  id: number;
  title: string;
  category: string;
  description: string;
  metrics: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
};

export type SkillCategory = {
  id: number;
  name: string;
  icon: string;
  skills: { id: number; name: string }[];
};

export type Experience = {
  id: number;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string;
  tech: string[];
  achievements: string[];
};

export type Education = {
  id: number;
  degree: string;
  institution: string;
  period: string;
  location: string;
  description: string;
  tech: string[];
  achievements: string[];
};

function parseJsonOrCsv(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through to csv split
    }
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export default function PortfolioPage() {
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [avatarUrl, setAvatarUrl] = useState("/avatar.svg");

  const [projects, setProjects] = useState<Project[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const emailAddress = "pasaportejohnchristian@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
    }, 4000);
  };

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const closeProjectDetail = () => {
    setModalOpen(false);
    setSelectedProject(null);
  };

  async function fetchData() {
    try {
      const [pRes, sRes, eRes, eduRes, settingsRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/skills"),
        fetch("/api/experience"),
        fetch("/api/education"),
        fetch("/api/settings"),
      ]);
      const projectsRaw = await pRes.json();
      const skillsRaw = await sRes.json();
      const experiencesRaw = await eRes.json();
      const educationRaw = await eduRes.json();
      const settingsRaw = await settingsRes.json();

      setProjects(
        (projectsRaw as any[]).map((p) => ({
          ...p,
          tags: parseJsonOrCsv(p.tags),
        }))
      );
      setSkillCategories(skillsRaw);
      setExperiences(
        (experiencesRaw as any[]).map((e) => ({
          ...e,
          tech: parseJsonOrCsv(e.tech),
        }))
      );
      setEducation(
        (educationRaw as any[]).map((e) => ({
          ...e,
          tech: parseJsonOrCsv(e.tech),
        }))
      );
      setAvatarUrl(settingsRaw?.avatar_url || "/avatar.svg");
    } catch (e) {
      console.error("Failed to fetch portfolio data", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalOpen) closeProjectDetail();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, closeProjectDetail]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Database className="size-5 animate-spin" />
          <span>Loading portfolio…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/10">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded focus:font-semibold focus:outline-none">
        Skip to content
      </a>

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-125 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 size-112 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-10 left-1/4 size-100 rounded-full bg-primary/5 blur-[140px]" />
      </div>

      <Header
        avatarUrl={avatarUrl}
        copied={copied}
        handleCopyEmail={handleCopyEmail}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main id="main-content" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <HeroSection
          projects={projects}
          education={education}
          experiences={experiences}
          copied={copied}
          handleCopyEmail={handleCopyEmail}
        />

        <ProjectsSection projects={projects} openProjectDetail={openProjectDetail} />

        <SkillsSection skillCategories={skillCategories} />

        <EducationSection education={education} />

        <ExperienceSection experiences={experiences} />

        <ContactSection
          emailAddress={emailAddress}
          copied={copied}
          handleCopyEmail={handleCopyEmail}
          formData={formData}
          setFormData={setFormData}
          formSubmitted={formSubmitted}
          handleSubmit={handleSubmit}
        />
      </main>

      <ProjectDetailModal project={selectedProject} isOpen={modalOpen} onClose={closeProjectDetail} />

      <Footer />
    </div>
  );
}
