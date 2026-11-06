"use client";

import React, { useState, useEffect, useRef } from "react";
import { Trash2, Edit3, X, Code, Database, LogOut, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("projects");
  const [errorMessage, setErrorMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/avatar.svg");
  const [isDragOver, setIsDragOver] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    title: "", category: "", description: "", metrics: "",
    tags: "", liveUrl: "", githubUrl: "", featured: false,
  });

  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Code");
  const [newSkillName, setNewSkillName] = useState("");

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [newExperience, setNewExperience] = useState({
    role: "", company: "", period: "", location: "", description: "", tech: "", achievements: "",
  });

  const [education, setEducation] = useState<Education[]>([]);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [newEducation, setNewEducation] = useState({
    degree: "", institution: "", period: "", location: "", description: "", tech: "", achievements: "",
  });

  const [confirmDelete, setConfirmDelete] = useState<{
    id: number;
    type: "project" | "skill" | "category" | "experience" | "education";
    catId?: number;
  } | null>(null);

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
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setErrorMessage("Invalid password");
        return;
      }
      setAuthenticated(true);
      setErrorMessage("");
    } catch {
      setErrorMessage("Login failed");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setAuthenticated(false);
    setPassword("");
    setErrorMessage("");
  };

  // All hooks must be called before any conditional return
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
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
        body: JSON.stringify({ avatarUrl }),
      });
      const updated = await res.json();
      setAvatarUrl(updated.avatar_url || "/avatar.svg");
    } catch (e) {
      setErrorMessage("Failed to save avatar URL");
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

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8">
          <CardHeader className="flex flex-col space-y-2 text-center">
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <p className="text-xs text-muted-foreground">Enter the admin password to manage portfolio content.</p>
            {errorMessage && (
              <p className="text-xs text-destructive">{errorMessage}</p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <label className="text-xs font-medium text-foreground block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage("");
                }}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
              <Button type="submit" className="w-full">Unlock Admin</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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

    if (editingProject) {
      const res = await fetch("/api/projects/" + editingProject.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
        body: JSON.stringify(body),
      });
      const updated = await res.json();
      setProjects(projects.map((p) => (p.id === editingProject!.id ? { ...updated, featured: Boolean(updated.featured) } : p)));
      setEditingProject(null);
    } else {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
        body: JSON.stringify(body),
      });
      const created = await res.json();
      setProjects([{ ...created, featured: Boolean(created.featured) }, ...projects]);
    }
    resetNewProject();
  }

  async function deleteProject(id: number) {
    setConfirmDelete({ id, type: "project" });
    return;
  }

  function resetNewProject() {
    setNewProject({ title: "", category: "", description: "", metrics: "", tags: "", liveUrl: "", githubUrl: "", featured: false });
  }

  function startEditProject(p: Project) {
    setEditingProject(p);
    setNewProject({ ...p, tags: p.tags.join(", "), featured: Boolean(p.featured) });
  }

  async function saveCategory() {
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
      body: JSON.stringify({ type: "category", name: newCatName, icon: newCatIcon }),
    });
    const cat = await res.json();
    setSkillCategories([...skillCategories, { ...cat, skills: [] }]);
    setNewCatName("");
    setNewCatIcon("Code");
  }

  async function saveSkill(catId: number) {
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
  }

  async function updateCategory(id: number, name: string, icon: string) {
    const res = await fetch("/api/skills/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
      body: JSON.stringify({ type: "category", name, icon }),
    });
    const updated = await res.json();
    setSkillCategories(skillCategories.map((c) => (c.id === id ? { ...updated, skills: c.skills } : c)));
  }

  async function updateSkill(catId: number, skillId: number, name: string) {
    const res = await fetch("/api/skills/" + skillId, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
      body: JSON.stringify({ name }),
    });
    const updated = await res.json();
    setSkillCategories(skillCategories.map((c) =>
      c.id === catId ? { ...c, skills: c.skills.map((s) => (s.id === skillId ? { ...updated } : s)) } : c
    ));
  }

  async function deleteSkillItem(id: number, type: "category" | "skill", catId?: number) {
    setConfirmDelete({ id, type, catId });
    return;
    const res = await fetch("/api/skills/" + id, {
      method: "DELETE",
      headers: { "x-type": type },
    });
    if (res.ok) {
      if (type === "category") {
        setSkillCategories(skillCategories.filter((c) => c.id !== id));
      } else if (catId !== undefined) {
        setSkillCategories(skillCategories.map((c) =>
          c.id === catId ? { ...c, skills: c.skills.filter((s) => s.id !== id) } : c
        ));
      }
    }
  }

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

    if (editingExperience) {
      const res = await fetch("/api/experience/" + editingExperience.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
        body: JSON.stringify(body),
      });
      const updated = await res.json();
      setExperiences(experiences.map((e) => (e.id === editingExperience!.id ? updated : e)));
      setEditingExperience(null);
    } else {
      const res = await fetch("/api/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
        body: JSON.stringify(body),
      });
      const created = await res.json();
      setExperiences([created, ...experiences]);
    }
    resetNewExperience();
  }

  async function deleteExperience(id: number) {
    setConfirmDelete({ id, type: "experience" });
    return;
  }

  function resetNewExperience() {
    setNewExperience({ role: "", company: "", period: "", location: "", description: "", tech: "", achievements: "" });
  }

  function startEditExperience(e: Experience) {
    setEditingExperience(e);
    setNewExperience({ ...e, tech: e.tech.join(", "), achievements: e.achievements.join("\\n") });
  }

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

    if (editingEducation) {
      const res = await fetch("/api/education/" + editingEducation.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
        body: JSON.stringify(body),
      });
      const updated = await res.json();
      setEducation(education.map((e) => (e.id === editingEducation!.id ? updated : e)));
      setEditingEducation(null);
    } else {
      const res = await fetch("/api/education", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + password },
        body: JSON.stringify(body),
      });
      const created = await res.json();
      setEducation([created, ...education]);
    }
    resetNewEducation();
  }

  async function deleteEducation(id: number) {
    setConfirmDelete({ id, type: "education" });
    return;
  }

  function resetNewEducation() {
    setNewEducation({ degree: "", institution: "", period: "", location: "", description: "", tech: "", achievements: "" });
  }

  function startEditEducation(e: Education) {
    setEditingEducation(e);
    setNewEducation({ ...e, tech: e.tech.join(", "), achievements: e.achievements.join("\\n") });
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return;
    const { id, type, catId } = confirmDelete;
    switch (type) {
      case "project":
        await fetch("/api/projects/" + id, { method: "DELETE", headers: { "Authorization": "Bearer " + password } });
        setProjects(projects.filter((p) => p.id !== id));
        break;
      case "skill":
        const res = await fetch("/api/skills/" + id, {
          method: "DELETE",
          headers: { "x-type": "skill", "Authorization": "Bearer " + password },
        });
        if (res.ok && catId !== undefined) {
          setSkillCategories(skillCategories.map((c) =>
            c.id === catId ? { ...c, skills: c.skills.filter((s) => s.id !== id) } : c
          ));
        }
        break;
      case "category":
        await fetch("/api/skills/" + id, {
          method: "DELETE",
          headers: { "x-type": "category", "Authorization": "Bearer " + password },
        });
        setSkillCategories(skillCategories.filter((c) => c.id !== id));
        break;
      case "experience":
        await fetch("/api/experience/" + id, { method: "DELETE", headers: { "Authorization": "Bearer " + password } });
        setExperiences(experiences.filter((e) => e.id !== id));
        break;
      case "education":
        await fetch("/api/education/" + id, { method: "DELETE", headers: { "Authorization": "Bearer " + password } });
        setEducation(education.filter((e) => e.id !== id));
        break;
    }
    setConfirmDelete(null);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="size-5 text-primary" />
            <span className="font-semibold text-lg">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Logged in as admin</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50 flex items-center gap-4">
        <label className="text-sm font-medium text-foreground">Avatar Image URL</label>
        <input
          type="text"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="/avatar.svg"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
        />
        <Button onClick={saveAvatarUrl}>Save Avatar</Button>
      </div>

      <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-medium text-foreground">Drag & Drop Avatar</span>
          <Button size="sm" onClick={() => fileInputRef.current?.click()}>
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
        <div
          className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border/50 text-muted-foreground"
          } transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver ? (
            <span className="text-primary font-medium">Drop image here...</span>
          ) : (
            <div className="flex items-center gap-2">
              <Database className="size-6" />
              <span className="text-sm text-muted-foreground">Drag and drop an image file here</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">Supports PNG, JPG, GIF, WebP (max 2MB)</p>
        </div>
        {avatarPreview && (
          <div className="mt-4 flex items-center gap-3">
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="w-16 h-16 rounded-full border border-border object-cover"
            />
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Preview</span>
              <Button size="sm" variant="outline" onClick={() => setAvatarUrl(avatarPreview)}>
                Use This Image
              </Button>
            </div>
          </div>
        )}
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Portfolio Content Manager</h1>
          <Button onClick={() => fetchAll()} className="flex items-center gap-1">
            <RefreshCcw className="size-4" /> Refresh
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          {["projects", "skills", "experience", "education"].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn("text-sm font-medium transition-all", activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

          {activeTab === "projects" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Projects ({projects.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-3">
                    {projects.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                        <div>
                          <div className="font-medium">{p.title}</div>
                          <div className="text-xs text-muted-foreground">{p.category}</div>
                          <div className="text-xs text-muted-foreground mt-1">{p.metrics}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={p.featured ? "default" : "outline"} className="text-xs">
                            {p.featured ? "Featured" : "Regular"}
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={() => startEditProject(p)} className="p-1">
                            <Edit3 className="size-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteProject(p.id)} className="p-1">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {projects.length === 0 && <div className="text-center text-muted-foreground py-4">No projects</div>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{editingProject ? "Edit Project" : "Add Project"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); saveProject(); }} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Title</label>
                      <input
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Category</label>
                      <input
                        value={newProject.category}
                        onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Description</label>
                      <textarea
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        rows={3}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 resize-y"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Metrics</label>
                      <input
                        value={newProject.metrics}
                        onChange={(e) => setNewProject({ ...newProject, metrics: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Tags (comma-separated)</label>
                      <input
                        value={newProject.tags}
                        onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Live URL</label>
                      <input
                        value={newProject.liveUrl}
                        onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">GitHub URL</label>
                      <input
                        value={newProject.githubUrl}
                        onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProject.featured}
                        onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })}
                      />
                      <label className="text-xs font-medium text-foreground">Featured</label>
                    </div>
                    <Button type="submit" className="w-full bg-primary text-primary-foreground">
                      {editingProject ? "Update" : "Create"}
                    </Button>
                    {editingProject && (
                      <Button type="button" variant="outline" onClick={() => { setEditingProject(null); resetNewProject(); }} className="w-full">
                        Cancel
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Skill Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-4">
                    {skillCategories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 p-1 rounded bg-primary/10 text-primary">
                            <Code className="size-4" />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={cat.name}
                              onChange={(e) => updateCategory(cat.id, e.target.value, cat.icon)}
                              className="bg-transparent border-none focus:ring-0 font-medium"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => deleteSkillItem(cat.id, "category")} className="p-1">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Name</label>
                      <input
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Icon (lucide name)</label>
                      <input
                        value={newCatIcon}
                        onChange={(e) => setNewCatIcon(e.target.value)}
                        placeholder="Code"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <Button onClick={saveCategory} className="w-full">Add Category</Button>
                  </div>
                </CardContent>
              </Card>

              {skillCategories.map((cat) => (
                <Card key={cat.id}>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>{cat.name}</CardTitle>
                    <Badge variant="secondary">{cat.skills.length} skills</Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-2">
                      {cat.skills.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border/50">
                          <input
                            type="text"
                            value={s.name}
                            onChange={(e) => updateSkill(cat.id, s.id, e.target.value)}
                            className="bg-transparent border-none focus:ring-0 w-full"
                          />
                          <Button variant="destructive" size="sm" onClick={() => deleteSkillItem(s.id, "skill", cat.id)} className="p-1">
                            <X className="size-4" />
                          </Button>
                        </div>
                      ))}
                      {cat.skills.length === 0 && <div className="text-center text-muted-foreground text-xs py-2">No skills yet</div>}
                    </div>
                    <div className="pt-3 space-y-2">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground block mb-1">New Skill Name</label>
                        <input
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <Button onClick={() => saveSkill(cat.id)} className="w-full text-xs">Add Skill</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "experience" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Experience ({experiences.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-4">
                    {experiences.map((e) => (
                      <div key={e.id} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{e.role}</div>
                          <Badge variant="secondary" className="text-xs">{e.period}</Badge>
                        </div>
                        <div className="text-sm">{e.company}</div>
                        <div className="text-xs text-muted-foreground">{e.location}</div>
                        <p className="text-sm text-muted-foreground mt-2">{e.description}</p>
                        <div className="flex gap-1 mt-2">
                          {e.tech.map((t: string) => (
                            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="ghost" size="sm" onClick={() => startEditExperience(e)} className="p-1">
                            <Edit3 className="size-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteExperience(e.id)} className="p-1">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{editingExperience ? "Edit Experience" : "Add Experience"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); saveExperience(); }} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Role</label>
                      <input
                        value={newExperience.role}
                        onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Company</label>
                      <input
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Period</label>
                      <input
                        value={newExperience.period}
                        onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Location</label>
                      <input
                        value={newExperience.location}
                        onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Description</label>
                      <textarea
                        value={newExperience.description}
                        onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                        rows={3}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 resize-y"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Tech (comma-separated)</label>
                      <input
                        value={newExperience.tech}
                        onChange={(e) => setNewExperience({ ...newExperience, tech: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Achievements (one per line)</label>
                      <textarea
                        value={newExperience.achievements}
                        onChange={(e) => setNewExperience({ ...newExperience, achievements: e.target.value })}
                        rows={4}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 resize-y"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-primary-foreground">
                      {editingExperience ? "Update" : "Create"}
                    </Button>
                    {editingExperience && (
                      <Button type="button" variant="outline" onClick={() => { setEditingExperience(null); resetNewExperience(); }} className="w-full">
                        Cancel
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "education" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Education ({education.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-4">
                    {education.map((e) => (
                      <div key={e.id} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{e.degree}</div>
                          <Badge variant="secondary" className="text-xs">{e.period}</Badge>
                        </div>
                        <div className="text-sm">{e.institution}</div>
                        <div className="text-xs text-muted-foreground">{e.location}</div>
                        <p className="text-sm text-muted-foreground mt-2">{e.description}</p>
                        <div className="flex gap-1 mt-2">
                          {e.tech.map((t: string) => (
                            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="ghost" size="sm" onClick={() => startEditEducation(e)} className="p-1">
                            <Edit3 className="size-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteEducation(e.id)} className="p-1">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
          </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{editingEducation ? "Edit Education" : "Add Education"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); saveEducation(); }} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Degree</label>
                      <input
                        value={newEducation.degree}
                        onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Institution</label>
                      <input
                        value={newEducation.institution}
                        onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Period</label>
                      <input
                        value={newEducation.period}
                        onChange={(e) => setNewEducation({ ...newEducation, period: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Location</label>
                      <input
                        value={newEducation.location}
                        onChange={(e) => setNewEducation({ ...newEducation, location: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Description</label>
                      <textarea
                        value={newEducation.description}
                        onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                        rows={3}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 resize-y"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Tech (comma-separated)</label>
                      <input
                        value={newEducation.tech}
                        onChange={(e) => setNewEducation({ ...newEducation, tech: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground block mb-1">Achievements (one per line)</label>
                      <textarea
                        value={newEducation.achievements}
                        onChange={(e) => setNewEducation({ ...newEducation, achievements: e.target.value })}
                        rows={4}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 resize-y"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-primary-foreground">
                      {editingEducation ? "Update" : "Create"}
                    </Button>
                    {editingEducation && (
                      <Button type="button" variant="outline" onClick={() => { setEditingEducation(null); resetNewEducation(); }} className="w-full">
                        Cancel
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
          </div>
          )}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card p-6 rounded-xl border border-border/80 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
              <p className="text-muted-foreground mb-6">Are you sure you want to delete this item? This cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
              </div>
            </div>
          </div>
        )}
        </main>
    </div>
  );
}
