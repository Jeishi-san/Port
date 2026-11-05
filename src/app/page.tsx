"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Mail,
  Code2,
  Check,
  Copy,
  ArrowUpRight,
  ChevronRight,
  Menu,
  X,
  Send,
  Star,
  Zap,
  Globe,
  Database,
  Cloud,
  Cpu,
  Palette,
  Briefcase,
  GraduationCap,
  Code,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Project = {
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

type SkillCategory = {
  id: number;
  name: string;
  icon: string;
  skills: { id: number; name: string }[];
};

type Experience = {
  id: number;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string;
  tech: string[];
  achievements: string[];
};

type Education = {
  id: number;
  degree: string;
  institution: string;
  period: string;
  location: string;
  description: string;
  tech: string[];
  achievements: string[];
};

export default function PortfolioPage() {
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [avatarUrl, setAvatarUrl] = useState("/avatar.svg");

  const [projects, setProjects] = useState<Project[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  const emailAddress = "alex.morgan@example.com";

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

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
          tags: typeof p.tags === "string" ? JSON.parse(p.tags || "[]") : p.tags,
        }))
      );
      setSkillCategories(skillsRaw);
      setExperiences(
        (experiencesRaw as any[]).map((e) => ({
          ...e,
          tech: typeof e.tech === "string" ? JSON.parse(e.tech || "[]") : e.tech,
        }))
      );
      setEducation(
        (educationRaw as any[]).map((e) => ({
          ...e,
          tech: typeof e.tech === "string" ? JSON.parse(e.tech || "[]") : e.tech,
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

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="#"
            className="group flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-85"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono font-bold text-sm shadow-xs transition-transform group-hover:scale-105 bg-glow">
              <Image src={avatarUrl} alt="Alex Morgan avatar" width={36} height={36} className="size-6 rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold leading-tight">Alex Morgan</span>
              <span className="text-[12px] text-muted-foreground leading-tight">Computer Science Graduate</span>
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
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className={buttonVariants({ size: "sm", className: "w-full justify-center" })}>Hire Me</a>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
              I&apos;m <span className="font-semibold text-foreground">Alex Morgan</span>, a recent Computer Science
              graduate passionate about building accessible, performant web applications. I enjoy learning new
              technologies and turning ideas into working software.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a href="#projects" className={buttonVariants({ size: "lg", className: "gap-2 shadow-xs cursor-pointer" })}>
                View Projects <ChevronRight className="size-4" />
              </a>
              <a href="#contact" className={buttonVariants({ variant: "outline", size: "lg", className: "gap-2 cursor-pointer" })}>
                <Mail className="size-4" /> Get in Touch
              </a>
              <Button variant="ghost" size="lg" onClick={handleCopyEmail} className="gap-2 text-muted-foreground hover:text-foreground">
                {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                <span>{copied ? "Copied address" : "alex.morgan@example.com"}</span>
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-4 text-muted-foreground">
              <span className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Connect:</span>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground p-1" aria-label="GitHub Profile">
                <GithubIcon className="size-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground p-1" aria-label="LinkedIn Profile">
                <LinkedinIcon className="size-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground p-1" aria-label="Twitter Profile">
                <TwitterIcon className="size-5" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8 sm:grid-cols-4 w-full border-t border-border/60 mt-4">
              <div className="flex flex-col">
                <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{projects.length}</span>
                <span className="text-sm text-muted-foreground font-medium">Projects Built</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{education.length}</span>
                <span className="text-sm text-muted-foreground font-medium">Degree Earned</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{experiences.length}</span>
                <span className="text-sm text-muted-foreground font-medium">Internships</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {projects.reduce((acc, p) => acc + (parseInt(p.metrics.match(/\\d+/)?.[0] || "0") || 0), 0)}+
                </span>
                <span className="text-sm text-muted-foreground font-medium">GitHub Contributions</span>
              </div>
            </div>
          </div>
        </section>

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
              {["All", "Full Stack", "Frontend", "Backend"].map((category) => (
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
              <Card
                key={project.id}
                className="flex flex-col justify-between border-border/70 hover:border-primary hover:bg-card/80 transition-all duration-200 hover:shadow-md bg-card/60 backdrop-blur-xs group"
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
                      {project.tags.map((tag: string) => (
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
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <GithubIcon className="size-3.5" />
                    <span>Source</span>
                  </a>

                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <span>Live Preview</span>
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

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
                  {edu.tech.map((t: string) => (
                    <Badge key={t} variant="secondary" className="text-xs font-normal">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

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
                    {exp.tech.map((t: string) => (
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

        <section id="contact" className="py-16 border-t border-border/60 scroll-mt-[80px]">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-2">
                <Mail className="size-4" />
                <span>Get In Touch</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Let&apos;s build something great together.
              </h2>
              <p className="text-base text-muted-foreground mt-3 leading-relaxed">
                I&apos;m actively seeking entry-level opportunities where I can contribute, learn, and grow. Feel free to reach out about internships, junior roles, or just to chat about code.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted border border-border">
                    <Mail className="size-4 text-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Direct Email</div>
                    <button
                      onClick={handleCopyEmail}
                      className="text-base font-medium hover:text-primary transition-colors flex items-center gap-1.5 text-left"
                    >
                      {emailAddress}
                      {copied ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted border border-border">
                    <Globe className="size-4 text-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Location &amp; Availability</div>
                    <div className="text-base font-medium">San Francisco, CA - Open to remote worldwide</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
                {formSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
                      <Check className="size-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Message Sent!</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                      Thank you for reaching out. I typically respond within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Your Name</label>
                        <input
                          type="text"
                          required
                          autoComplete="name"
                          name="name"
                          spellCheck={false}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Sarah Connor"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Your Email</label>
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          name="email"
                          spellCheck={false}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="sarah@example.com"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Message</label>
                      <textarea
                        rows={4}
                        required
                        autoComplete="message"
                        name="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell me about your project, timeline, and goals…"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 resize-y"
                      />
                    </div>

                    <Button type="submit" className="w-full sm:w-auto gap-2">
                      <Send className="size-4" /> Send Message
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-muted/20 py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Alex Morgan</span>
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
    </div>
  );
}
