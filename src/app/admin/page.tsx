"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Trash2,
  Edit3,
  X,
  Code,
  Database,
  LogOut,
  RefreshCcw,
  Settings,
  User,
  Users,
  BarChart3,
  Clock,
  Mail,
  Phone,
  Download,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Filter,
  Search,
  LayoutGrid,
  List,
  Shield,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

type Tab = "projects" | "skills" | "experience" | "education";

type Toast = {
  id: string;
  type: "success" | "error";
  message: string;
};

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "projects", label: "Projects", icon: LayoutGrid },
  { id: "skills", label: "Skills", icon: Code },
  { id: "experience", label: "Experience", icon: BriefcaseIcon },
  { id: "education", label: "Education", icon: GraduationCapIcon },
];

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
function GraduationCapIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 2v2" />
      <path d="M12 2v2" />
      <path d="M18 2v2" />
    </svg>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [errorMessage, setErrorMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/avatar.svg");
  const [isDragOver, setIsDragOver] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    title: "", category: "", description: "", metrics: "",
    tags: "", liveUrl: "", githubUrl: "", featured: false,
  });
  const [projectFormOpen, setProjectFormOpen] = useState(false);

  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Code");
  const [newSkillName, setNewSkillName] = useState("");
  const [catFormOpen, setCatFormOpen] = useState(false);

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [newExperience, setNewExperience] = useState({
    role: "", company: "", period: "", location: "", description: "", tech: "", achievements: "",
  });
  const [expFormOpen, setExpFormOpen] = useState(false);

  const [education, setEducation] = useState<Education[]>([]);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [newEducation, setNewEducation] = useState({
    degree: "", institution: "", period: "", location: "", description: "", tech: "", achievements: "",
  });
  const [eduFormOpen, setEduFormOpen] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{
    id: number;
    type: "project" | "skill" | "category" | "experience" | "education";
    catId?: number;
  } | null>(null);

  const isLoading = (key: string) => !!loading[key];
  const setLoadingKey = (key: string, value: boolean) =>
    setLoading((prev) => ({ ...prev, [key]: value }));

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok && mounted) {
          setAuthenticated(true);
          fetchAll();
        } else if (mounted) {
          setAuthenticated(false);
        }
      } catch {
        if (mounted) setAuthenticated(false);
      }
    }
    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage("Please enter a password");
      return;
    }
    setLoadingKey("login", true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setErrorMessage("Invalid password");
        setLoadingKey("login", false);
        return;
      }
      setAuthenticated(true);
      setErrorMessage("");
      setLoadingKey("login", false);
    } catch {
      setErrorMessage("Login failed");
      setLoadingKey("login", false);
    }
  };

  const handleLogout = async () => {
    setLoadingKey("logout", true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setAuthenticated(false);
    setPassword("");
    setErrorMessage("");
    setLoadingKey("logout", false);
  };

  async function fetchAll() {
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
  }

  async function saveAvatarUrl() {
    setLoadingKey("avatar", true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
        body: JSON.stringify({ avatarUrl }),
      });
      const updated = await res.json();
      setAvatarUrl(updated.avatar_url || "/avatar.svg");
      addToast("success", "Avatar updated");
    } catch (e) {
      addToast("error", "Failed to save avatar URL");
    } finally {
      setLoadingKey("avatar", false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    processFile(files[0]);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFile(files[0]);
  }

  function processFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Image must be smaller than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarPreview(result);
      setAvatarUrl(result);
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    if (authenticated) fetchAll();
  }, [authenticated]);

  /* ---------- Projects ---------- */
  async function saveProject() {
    const body: any = {
      title: newProject.title,
      category: newProject.category,
      description: newProject.description,
      metrics: newProject.metrics,
      tags: newProject.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
      liveUrl: newProject.liveUrl,
      githubUrl: newProject.githubUrl,
      featured: newProject.featured ? 1 : 0,
    };
    const key = editingProject ? `project-${editingProject.id}` : "project-new";
    setLoadingKey(key, true);
    try {
      if (editingProject) {
        const res = await fetch("/api/projects/" + editingProject.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
          body: JSON.stringify(body),
        });
        const updated = await res.json();
        setProjects(
          projects.map((p) => (p.id === editingProject!.id ? { ...updated, featured: Boolean(updated.featured) } : p))
        );
        addToast("success", `Project "${updated.title}" updated`);
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
          body: JSON.stringify(body),
        });
        const created = await res.json();
        setProjects([{ ...created, featured: Boolean(created.featured) }, ...projects]);
        addToast("success", `Project "${created.title}" created`);
      }
      setEditingProject(null);
      resetNewProject();
      setProjectFormOpen(false);
    } catch {
      addToast("error", "Failed to save project");
    } finally {
      setLoadingKey(key, false);
    }
  }

  async function deleteProject(id: number) {
    setConfirmDelete({ id, type: "project" });
  }

  function resetNewProject() {
    setNewProject({ title: "", category: "", description: "", metrics: "", tags: "", liveUrl: "", githubUrl: "", featured: false });
  }

  function startEditProject(p: Project) {
    setEditingProject(p);
    setNewProject({ ...p, tags: p.tags.join(", "), featured: Boolean(p.featured) });
    setProjectFormOpen(true);
  }

  /* ---------- Skills ---------- */
  async function saveCategory() {
    setLoadingKey("category-new", true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
        body: JSON.stringify({ type: "category", name: newCatName, icon: newCatIcon }),
      });
      const cat = await res.json();
      setSkillCategories([...skillCategories, { ...cat, skills: [] }]);
      setNewCatName("");
      setNewCatIcon("Code");
      setCatFormOpen(false);
      addToast("success", `Category "${cat.name}" created`);
    } catch {
      addToast("error", "Failed to create category");
    } finally {
      setLoadingKey("category-new", false);
    }
  }

  async function saveSkill(catId: number) {
    setLoadingKey("skill-new", true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
        body: JSON.stringify({ categoryId: catId, name: newSkillName }),
      });
      const skill = await res.json();
      setSkillCategories(skillCategories.map((c) =>
        c.id === catId ? { ...c, skills: [...c.skills, skill] } : c
      ));
      setNewSkillName("");
      addToast("success", `Skill "${skill.name}" added`);
    } catch {
      addToast("error", "Failed to add skill");
    } finally {
      setLoadingKey("skill-new", false);
    }
  }

  async function updateCategory(id: number, name: string, icon: string) {
    setLoadingKey(`category-${id}`, true);
    try {
      const res = await fetch("/api/skills/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
        body: JSON.stringify({ type: "category", name, icon }),
      });
      const updated = await res.json();
      setSkillCategories(skillCategories.map((c) => (c.id === id ? { ...updated, skills: c.skills } : c)));
      addToast("success", "Category updated");
    } catch {
      addToast("error", "Failed to update category");
    } finally {
      setLoadingKey(`category-${id}`, false);
    }
  }

  async function updateSkill(catId: number, skillId: number, name: string) {
    setLoadingKey(`skill-${skillId}`, true);
    try {
      const res = await fetch("/api/skills/" + skillId, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
        body: JSON.stringify({ name }),
      });
      const updated = await res.json();
      setSkillCategories(skillCategories.map((c) =>
        c.id === catId ? { ...c, skills: c.skills.map((s) => (s.id === skillId ? { ...updated } : s)) } : c
      ));
      addToast("success", "Skill updated");
    } catch {
      addToast("error", "Failed to update skill");
    } finally {
      setLoadingKey(`skill-${skillId}`, false);
    }
  }

  async function deleteSkillItem(id: number, type: "category" | "skill", catId?: number) {
    setConfirmDelete({ id, type, catId });
  }

  /* ---------- Experience ---------- */
  async function saveExperience() {
    const body: any = {
      role: newExperience.role,
      company: newExperience.company,
      period: newExperience.period,
      location: newExperience.location,
      description: newExperience.description,
      tech: newExperience.tech.split(",").map((t: string) => t.trim()).filter(Boolean),
      achievements: newExperience.achievements.split("\\n").map((a: string) => a.trim()).filter(Boolean),
    };
    const key = editingExperience ? `experience-${editingExperience.id}` : "experience-new";
    setLoadingKey(key, true);
    try {
      if (editingExperience) {
        const res = await fetch("/api/experience/" + editingExperience.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
          body: JSON.stringify(body),
        });
        const updated = await res.json();
        setExperiences(experiences.map((e) => (e.id === editingExperience!.id ? updated : e)));
        addToast("success", `Experience "${updated.role}" updated`);
      } else {
        const res = await fetch("/api/experience", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
          body: JSON.stringify(body),
        });
        const created = await res.json();
        setExperiences([created, ...experiences]);
        addToast("success", `Experience "${created.role}" created`);
      }
      setEditingExperience(null);
      resetNewExperience();
      setExpFormOpen(false);
    } catch {
      addToast("error", "Failed to save experience");
    } finally {
      setLoadingKey(key, false);
    }
  }

  async function deleteExperience(id: number) {
    setConfirmDelete({ id, type: "experience" });
  }

  function resetNewExperience() {
    setNewExperience({ role: "", company: "", period: "", location: "", description: "", tech: "", achievements: "" });
  }

  function startEditExperience(e: Experience) {
    setEditingExperience(e);
    setNewExperience({ ...e, tech: e.tech.join(", "), achievements: e.achievements.join("\\n") });
    setExpFormOpen(true);
  }

  /* ---------- Education ---------- */
  async function saveEducation() {
    const body: any = {
      degree: newEducation.degree,
      institution: newEducation.institution,
      period: newEducation.period,
      location: newEducation.location,
      description: newEducation.description,
      tech: newEducation.tech.split(",").map((t: string) => t.trim()).filter(Boolean),
      achievements: newEducation.achievements.split("\\n").map((a: string) => a.trim()).filter(Boolean),
    };
    const key = editingEducation ? `education-${editingEducation.id}` : "education-new";
    setLoadingKey(key, true);
    try {
      if (editingEducation) {
        const res = await fetch("/api/education/" + editingEducation.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
          body: JSON.stringify(body),
        });
        const updated = await res.json();
        setEducation(education.map((e) => (e.id === editingEducation!.id ? updated : e)));
        addToast("success", `Education "${updated.degree}" updated`);
      } else {
        const res = await fetch("/api/education", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
          body: JSON.stringify(body),
        });
        const created = await res.json();
        setEducation([created, ...education]);
        addToast("success", `Education "${created.degree}" created`);
      }
      setEditingEducation(null);
      resetNewEducation();
      setEduFormOpen(false);
    } catch {
      addToast("error", "Failed to save education");
    } finally {
      setLoadingKey(key, false);
    }
  }

  async function deleteEducation(id: number) {
    setConfirmDelete({ id, type: "education" });
  }

  function resetNewEducation() {
    setNewEducation({ degree: "", institution: "", period: "", location: "", description: "", tech: "", achievements: "" });
  }

  function startEditEducation(e: Education) {
    setEditingEducation(e);
    setNewEducation({ ...e, tech: e.tech.join(", "), achievements: e.achievements.join("\\n") });
    setEduFormOpen(true);
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return;
    const { id, type, catId } = confirmDelete;
    setLoadingKey("delete", true);
    try {
      switch (type) {
        case "project":
          await fetch("/api/projects/" + id, { method: "DELETE", headers: { "Authorization": "Bearer " + password } });
          setProjects(projects.filter((p) => p.id !== id));
          addToast("success", "Project deleted");
          break;
        case "skill": {
          const res = await fetch("/api/skills/" + id, {
            method: "DELETE",
            headers: { "x-type": "skill", "Authorization": "Bearer " + password },
          });
          if (res.ok && catId !== undefined) {
            setSkillCategories(skillCategories.map((c) =>
              c.id === catId ? { ...c, skills: c.skills.filter((s) => s.id !== id) } : c
            ));
          }
          addToast("success", "Skill deleted");
          break;
        }
        case "category": {
          await fetch("/api/skills/" + id, {
            method: "DELETE",
            headers: { "x-type": "category", "Authorization": "Bearer " + password },
          });
          setSkillCategories(skillCategories.filter((c) => c.id !== id));
          addToast("success", "Category deleted");
          break;
        }
        case "experience":
          await fetch("/api/experience/" + id, { method: "DELETE", headers: { "Authorization": "Bearer " + password } });
          setExperiences(experiences.filter((e) => e.id !== id));
          addToast("success", "Experience deleted");
          break;
        case "education":
          await fetch("/api/education/" + id, { method: "DELETE", headers: { "Authorization": "Bearer " + password } });
          setEducation(education.filter((e) => e.id !== id));
          addToast("success", "Education deleted");
          break;
      }
    } catch {
      addToast("error", "Failed to delete item");
    } finally {
      setConfirmDelete(null);
      setLoadingKey("delete", false);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-muted/30 to-background px-4">
        <Card className="w-full max-w-md p-8 shadow-2xl border-border/60">
          <CardHeader className="flex flex-col space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <Database className="size-6 text-primary" />
              <span className="font-bold text-lg tracking-tight">Admin Panel</span>
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <p className="text-xs text-muted-foreground">Enter the admin password to manage portfolio content.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  placeholder="........................"
                />
              </div>
              {errorMessage && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded-lg border border-destructive/20">
                  <AlertCircle className="size-4" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={isLoading("login")}>
                {isLoading("login") ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Unlocking...</span>
                  </>
                ) : (
                  <>Unlock Admin</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="fixed top-6 right-6 z-50 flex w-full max-w-sm flex-col items-end gap-2"
        >
          <div className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300",
            t.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          )}>
            {t.type === "success" ? (
              <CheckCircle className="size-5" />
            ) : (
              <AlertCircle className="size-5" />
            )}
            <span className="text-sm font-medium">{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="opacity-60 hover:opacity-100 transition-opacity p-1"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ))}

      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md backdrop-blur-sm px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 text-primary">
              <Database className="size-5" />
            </div>
            <div>
              <span className="font-semibold text-sm leading-none">Admin Panel</span>
              <p className="text-[11px] text-muted-foreground leading-none">Portfolio content management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border/50 text-xs font-medium text-muted-foreground">
              <User className="size-3.5" />
              <span>Administrator</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1 px-3" disabled={isLoading("logout")}>
              {isLoading("logout") ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <>
                  <LogOut className="size-4" />
                  <span className="text-xs">Sign out</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Projects" value={projects.length} icon={LayoutGrid} color="blue" />
          <StatCard label="Skills" value={skillCategories.reduce((acc, c) => acc + c.skills.length, 0)} icon={Code} color="purple" />
          <StatCard label="Experience" value={experiences.length} icon={BriefcaseIcon} color="orange" />
          <StatCard label="Education" value={education.length} icon={GraduationCapIcon} color="green" />
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Manager</h1>
            <p className="text-sm text-muted-foreground">Manage your portfolio content for the {activeTab} section.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => fetchAll()}
              className="flex items-center gap-2 text-sm px-3 py-1.5"
              disabled={isLoading("refresh")}
            >
              {isLoading("refresh") ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCcw className="size-4" />
              )}
              <span className="text-xs font-medium">Refresh</span>
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "text-sm font-medium transition-all gap-2 px-4",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 border-transparent"
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        <section className="mb-10 rounded-xl border border-border bg-card/50 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold">Avatar</h2>
              <p className="text-sm text-muted-foreground">Set the profile image shown across the portfolio.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">Image URL</label>
              <div className="relative">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="/avatar.svg"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  size="sm"
                  onClick={saveAvatarUrl}
                  className="absolute right-1 top-1"
                  disabled={isLoading("avatar")}
                >
                  {isLoading("avatar") ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">Upload Image</label>
              <div
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-border/50 text-muted-foreground"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Button size="sm" onClick={() => fileInputRef.current?.click()} className="mb-2">
                  <User className="size-3.5" /> Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <p className="text-[11px] text-muted-foreground">PNG, JPG, GIF, WebP (max 2MB)</p>
              </div>
            </div>
          </div>
          {avatarPreview && (
            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/50">
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-12 h-12 rounded-full border border-border object-cover"
              />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Preview</span>
                <Button size="sm" variant="outline" onClick={() => setAvatarUrl(avatarPreview)}>
                  Use This Image
                </Button>
              </div>
            </div>
          )}
        </section>

        <main className="space-y-10">

        {activeTab === "projects" && (
          <ProjectsView
            projects={projects}
            setProjects={setProjects}
            editingProject={editingProject}
            setEditingProject={setEditingProject}
            newProject={newProject}
            setNewProject={setNewProject}
            projectFormOpen={projectFormOpen}
            setProjectFormOpen={setProjectFormOpen}
            password={password}
            saveProject={saveProject}
            deleteProject={deleteProject}
            startEditProject={startEditProject}
            resetNewProject={resetNewProject}
            isLoading={isLoading}
          />
        )}
        {activeTab === "skills" && (
          <SkillsView
            skillCategories={skillCategories}
            setSkillCategories={setSkillCategories}
            newCatName={newCatName}
            setNewCatName={setNewCatName}
            newCatIcon={newCatIcon}
            setNewCatIcon={setNewCatIcon}
            newSkillName={newSkillName}
            setNewSkillName={setNewSkillName}
            catFormOpen={catFormOpen}
            setCatFormOpen={setCatFormOpen}
            password={password}
            saveCategory={saveCategory}
            saveSkill={saveSkill}
            updateCategory={updateCategory}
            updateSkill={updateSkill}
            deleteSkillItem={deleteSkillItem}
            isLoading={isLoading}
          />
        )}
        {activeTab === "experience" && (
          <ExperienceView
            experiences={experiences}
            setExperiences={setExperiences}
            editingExperience={editingExperience}
            setEditingExperience={setEditingExperience}
            newExperience={newExperience}
            setNewExperience={setNewExperience}
            expFormOpen={expFormOpen}
            setExpFormOpen={setExpFormOpen}
            password={password}
            saveExperience={saveExperience}
            deleteExperience={deleteExperience}
            startEditExperience={startEditExperience}
            resetNewExperience={resetNewExperience}
            isLoading={isLoading}
          />
        )}
        {activeTab === "education" && (
          <EducationView
            education={education}
            setEducation={setEducation}
            editingEducation={editingEducation}
            setEditingEducation={setEditingEducation}
            newEducation={newEducation}
            setNewEducation={setNewEducation}
            eduFormOpen={eduFormOpen}
            setEduFormOpen={setEduFormOpen}
            password={password}
            saveEducation={saveEducation}
            deleteEducation={deleteEducation}
            startEditEducation={startEditEducation}
            resetNewEducation={resetNewEducation}
            isLoading={isLoading}
          />
        )}
      </main>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Confirm Delete</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">This action cannot be undone.</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-6">Are you sure you want to delete this item?</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(null)} disabled={isLoading("delete")}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={isLoading("delete")}>
                {isLoading("delete") ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    green: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.blue}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}

const inputBase = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20";
const labelBase = "text-xs font-medium text-foreground block mb-1";

type ProjectsViewProps = {
  projects: any[];
  setProjects: any;
  editingProject: any;
  setEditingProject: any;
  newProject: any;
  setNewProject: any;
  projectFormOpen: boolean;
  setProjectFormOpen: any;
  password: string;
  saveProject: any;
  deleteProject: any;
  startEditProject: any;
  resetNewProject: any;
  isLoading: (key: string) => boolean;
};
function ProjectsView(props: ProjectsViewProps) {
  const {
    projects,
    setProjects,
    editingProject,
    setEditingProject,
    newProject,
    setNewProject,
    projectFormOpen,
    setProjectFormOpen,
    password,
    saveProject,
    deleteProject,
    startEditProject,
    resetNewProject,
    isLoading,
  } = props;

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-3">
        <Card>
          <CardHeader className="flex items-center justify-between pb-3">
            <CardTitle>All Projects ({projects.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{p.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.category}</div>
                    {p.metrics && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{p.metrics}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={p.featured ? "default" : "outline"} className="text-xs px-2 py-1">
                      {p.featured ? "Featured" : "Regular"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditProject(p)}
                      className="p-1.5 opacity-70 group-hover:opacity-100"
                      disabled={isLoading(`project-${p.id}`)}
                    >
                      <Edit3 className="size-3.5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteProject(p.id)}
                      className="p-1.5 opacity-70 group-hover:opacity-100"
                      disabled={isLoading(`project-${p.id}`)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Rocket className="size-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No projects yet. Add your first project below.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-4" /> {editingProject ? "Edit Project" : "Add Project"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); saveProject(); }} className="space-y-4">
              <div className="space-y-2">
                <label className={labelBase}>Title</label>
                <input
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className={inputBase}
                  placeholder="e.g. StegoLock"
                />
              </div>
              <div className="space-y-2">
                <label className={labelBase}>Category</label>
                <input
                  value={newProject.category}
                  onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                  className={inputBase}
                  placeholder="e.g. Full Stack"
                />
              </div>
              <div className="space-y-2">
                <label className={labelBase}>Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                  className={inputBase + " resize-y"}
                  placeholder="Describe the project..."
                />
              </div>
              <div className="space-y-2">
                <label className={labelBase}>Metrics</label>
                <input
                  value={newProject.metrics}
                  onChange={(e) => setNewProject({ ...newProject, metrics: e.target.value })}
                  className={inputBase}
                  placeholder="e.g. 3rd Place Best Paper"
                />
              </div>
              <div className="space-y-2">
                <label className={labelBase}>Tags (comma-separated)</label>
                <input
                  value={newProject.tags}
                  onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                  className={inputBase}
                  placeholder="Laravel, React, MySQL"
                />
              </div>
              <div className="space-y-2">
                <label className={labelBase}>Live URL</label>
                <input
                  value={newProject.liveUrl}
                  onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                  className={inputBase}
                  placeholder="https://demo.example.com"
                />
              </div>
              <div className="space-y-2">
                <label className={labelBase}>GitHub URL</label>
                <input
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                  className={inputBase}
                  placeholder="https://github.com/user/repo"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newProject.featured}
                  onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })}
                  className="rounded bg-background border-border text-primary focus:ring-primary"
                />
                <label className="text-xs font-medium text-foreground">Featured</label>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={isLoading("project-new") || isLoading(`project-${editingProject?.id}`)}>
                {editingProject ? "Update Project" : "Create Project"}
              </Button>
              {editingProject && (
                <Button type="button" variant="outline" onClick={() => { setEditingProject(null); resetNewProject(); setProjectFormOpen(false); }} className="w-full">
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type SkillsViewProps = {
  skillCategories: any[];
  setSkillCategories: any;
  newCatName: string;
  setNewCatName: any;
  newCatIcon: string;
  setNewCatIcon: any;
  newSkillName: string;
  setNewSkillName: any;
  catFormOpen: boolean;
  setCatFormOpen: any;
  password: string;
  saveCategory: any;
  saveSkill: any;
  updateCategory: any;
  updateSkill: any;
  deleteSkillItem: any;
  isLoading: (key: string) => boolean;
};
function SkillsView(props: SkillsViewProps) {
  const {
    skillCategories,
    setSkillCategories,
    newCatName,
    setNewCatName,
    newCatIcon,
    setNewCatIcon,
    newSkillName,
    setNewSkillName,
    catFormOpen,
    setCatFormOpen,
    password,
    saveCategory,
    saveSkill,
    updateCategory,
    updateSkill,
    deleteSkillItem,
    isLoading,
  } = props;

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4" /> Skill Categories ({skillCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              {skillCategories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-2 p-1.5 rounded bg-primary/10 text-primary">
                      <Code className="size-3.5" />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={cat.name}
                        onChange={(e) => updateCategory(cat.id, e.target.value, cat.icon)}
                        className="bg-transparent border-none focus:ring-0 font-medium text-sm text-foreground min-w-0"
                      />
                      <div className="text-[10px] text-muted-foreground">{cat.skills.length} skill{cat.skills.length === 1 ? "" : "s"}</div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteSkillItem(cat.id, "category")}
                    className="p-1.5 opacity-70 group-hover:opacity-100"
                    disabled={isLoading(`category-${cat.id}`)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              {skillCategories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Code className="size-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No categories yet. Add one below.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-4" /> Add Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className={labelBase}>Name</label>
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className={inputBase}
                placeholder="e.g. ICT Infrastructure"
              />
            </div>
            <div className="space-y-2">
              <label className={labelBase}>Icon (lucide name)</label>
              <input
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                placeholder="Code"
                className={inputBase}
              />
            </div>
            <Button onClick={saveCategory} className="w-full bg-primary text-primary-foreground" disabled={isLoading("category-new")}>
              Add Category
            </Button>
          </CardContent>
        </Card>

        {skillCategories.map((cat) => (
          <Card key={cat.id} className="mt-4 overflow-hidden">
            <CardHeader className="flex items-center justify-between pb-3">
              <CardTitle>{cat.name}</CardTitle>
              <Badge variant="secondary" className="text-xs px-2">{cat.skills.length} skills</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {cat.skills.map((s: { id: number; name: string }) => (
                  <div key={s.id} className="flex items-center justify-between p-2 border-b border-border/50 last:border-0">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => updateSkill(cat.id, s.id, e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm text-foreground w-full min-w-0"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSkillItem(s.id, "skill", cat.id)}
                      className="p-1 opacity-70 hover:opacity-100"
                      disabled={isLoading(`skill-${s.id}`)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
                {cat.skills.length === 0 && (
                  <div className="px-4 py-3 text-center text-xs text-muted-foreground">No skills yet</div>
                )}
              </div>
              <div className="px-4 py-3 border-t border-border/50 space-y-2">
                <div className="space-y-2">
                  <label className={cn(labelBase, "text-[10px]")}>New Skill Name</label>
                  <input
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className={inputBase + " text-xs"}
                    placeholder="e.g. Zero-Trust Architecture"
                  />
                </div>
                <Button
                  onClick={() => saveSkill(cat.id)}
                  className="w-full text-xs bg-primary text-primary-foreground"
                  disabled={isLoading("skill-new")}
                >
                  Add Skill
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

type ExperienceViewProps = {
  experiences: any[];
  setExperiences: any;
  editingExperience: any;
  setEditingExperience: any;
  newExperience: any;
  setNewExperience: any;
  expFormOpen: boolean;
  setExpFormOpen: any;
  password: string;
  saveExperience: any;
  deleteExperience: any;
  startEditExperience: any;
  resetNewExperience: any;
  isLoading: (key: string) => boolean;
};
function ExperienceView(props: ExperienceViewProps) {
  const {
    experiences,
    setExperiences,
    editingExperience,
    setEditingExperience,
    newExperience,
    setNewExperience,
    expFormOpen,
    setExpFormOpen,
    password,
    saveExperience,
    deleteExperience,
    startEditExperience,
    resetNewExperience,
    isLoading,
  } = props;

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BriefcaseIcon className="size-4" /> Experience ({experiences.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3">
              {experiences.map((e) => (
                <div key={e.id} className="p-3 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-foreground">{e.role}</div>
                    <Badge variant="secondary" className="text-xs px-2">{e.period}</Badge>
                  </div>
                  <div className="text-sm text-primary/70">{e.company}</div>
                  {e.location && (
                    <div className="text-xs text-muted-foreground mt-0.5">{e.location}</div>
                  )}
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{e.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {e.tech.map((t: string) => (
                      <Badge key={t} variant="outline" className="text-xs px-2">{t}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditExperience(e)}
                      className="p-1 opacity-70 group-hover:opacity-100"
                      disabled={isLoading(`experience-${e.id}`)}
                    >
                      <Edit3 className="size-3.5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteExperience(e.id)}
                      className="p-1 opacity-70 group-hover:opacity-100"
                      disabled={isLoading(`experience-${e.id}`)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {experiences.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="size-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No experience entries yet. Add one below.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-4" /> {editingExperience ? "Edit Experience" : "Add Experience"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); saveExperience(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelBase}>Role</label>
                  <input
                    value={newExperience.role}
                    onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                    className={inputBase}
                    placeholder="e.g. Technical Support Intern"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelBase}>Company</label>
                  <input
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                    className={inputBase}
                    placeholder="e.g. Concentrix"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelBase}>Period</label>
                  <input
                    value={newExperience.period}
                    onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                    className={inputBase}
                    placeholder="e.g. Jun 2025 - Dec 2025"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelBase}>Location</label>
                  <input
                    value={newExperience.location}
                    onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                    className={inputBase}
                    placeholder="e.g. Davao City"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelBase}>Description</label>
                <textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                  rows={3}
                  className={inputBase + " resize-y"}
                  placeholder="Describe the role..."
                />
              </div>
              <div className="space-y-2">
                <label className={labelBase}>Tech (comma-separated)</label>
                <input
                  value={newExperience.tech}
                  onChange={(e) => setNewExperience({ ...newExperience, tech: e.target.value })}
                  className={inputBase}
                  placeholder="Windows, Rufus, MySQL, Git"
                />
              </div>
              <div className="space-y-2">
                <label className={labelBase}>Achievements (one per line)</label>
                <textarea
                  value={newExperience.achievements}
                  onChange={(e) => setNewExperience({ ...newExperience, achievements: e.target.value })}
                  rows={4}
                  className={inputBase + " resize-y"}
                  placeholder="Maintained 100+ workstations...\nReduced imaging time..."
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={isLoading("experience-new") || isLoading(`experience-${editingExperience?.id}`)}>
                {editingExperience ? "Update Experience" : "Create Experience"}
              </Button>
              {editingExperience && (
                <Button type="button" variant="outline" onClick={() => { setEditingExperience(null); resetNewExperience(); setExpFormOpen(false); }} className="w-full">
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type EducationViewProps = {
  education: any[];
  setEducation: any;
  editingEducation: any;
  setEditingEducation: any;
  newEducation: any;
  setNewEducation: any;
  eduFormOpen: boolean;
  setEduFormOpen: any;
  password: string;
  saveEducation: any;
  deleteEducation: any;
  startEditEducation: any;
  resetNewEducation: any;
  isLoading: (key: string) => boolean;
};
function EducationView(props: EducationViewProps) {
  const {
    education,
    setEducation,
    editingEducation,
    setEditingEducation,
    newEducation,
    setNewEducation,
    eduFormOpen,
    setEduFormOpen,
    password,
    saveEducation,
    deleteEducation,
    startEditEducation,
    resetNewEducation,
    isLoading,
  } = props;

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <GraduationCapIcon className="size-4" /> Education ({education.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3">
              {education.map((e) => (
                <div key={e.id} className="p-3 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-foreground">{e.degree}</div>
                    <Badge variant="secondary" className="text-xs px-2">{e.period}</Badge>
                  </div>
                  <div className="text-sm text-primary/70">{e.institution}</div>
                  {e.location && (
                    <div className="text-xs text-muted-foreground mt-0.5">{e.location}</div>
                  )}
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{e.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {e.tech.map((t: string) => (
                      <Badge key={t} variant="outline" className="text-xs px-2">{t}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditEducation(e)}
                      className="p-1 opacity-70 group-hover:opacity-100"
                      disabled={isLoading(`education-${e.id}`)}
                    >
                      <Edit3 className="size-3.5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteEducation(e.id)}
                      className="p-1 opacity-70 group-hover:opacity-100"
                      disabled={isLoading(`education-${e.id}`)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {education.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <GraduationCapIcon className="size-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No education entries yet. Add one below.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-4" /> {editingEducation ? "Edit Education" : "Add Education"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); saveEducation(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelBase}>Degree</label>
                  <input
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                    className={inputBase}
                    placeholder="e.g. BS Information Technology"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelBase}>Institution</label>
                  <input
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                    className={inputBase}
                    placeholder="e.g. University of Southeastern Philippines"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelBase}>Period</label>
                  <input
                    value={newEducation.period}
                    onChange={(e) => setNewEducation({ ...newEducation, period: e.target.value })}
                    className={inputBase}
                    placeholder="e.g. 2022 - 2026"
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelBase}>Location</label>
                  <input
                    value={newEducation.location}
                    onChange={(e) => setNewEducation({ ...newEducation, location: e.target.value })}
                    className={inputBase}
                    placeholder="e.g. Davao City"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelBase}>Description</label>
                <textarea
                  value={newEducation.description}
                  onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                  rows={3}
                  className={inputBase + " resize-y"}
                  placeholder="Describe the program..."
                />
              </div>
              <div className="space-y-2">
                <label className={labelBase}>Tech (comma-separated)</label>
                <input
                  value={newEducation.tech}
                  onChange={(e) => setNewEducation({ ...newEducation, tech: e.target.value })}
                  className={inputBase}
                  placeholder="Laravel, React, NextJS, MySQL"
                />
              </div>
              <div className="space-y-2">
                <label className={labelBase}>Achievements (one per line)</label>
                <textarea
                  value={newEducation.achievements}
                  onChange={(e) => setNewEducation({ ...newEducation, achievements: e.target.value })}
                  rows={4}
                  className={inputBase + " resize-y"}
                  placeholder="Dean's Lister (S.Y. 2023-2026)\nCSE Professional Passer"
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={isLoading("education-new") || isLoading(`education-${editingEducation?.id}`)}>
                {editingEducation ? "Update Education" : "Create Education"}
              </Button>
              {editingEducation && (
                <Button type="button" variant="outline" onClick={() => { setEditingEducation(null); resetNewEducation(); setEduFormOpen(false); }} className="w-full">
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



