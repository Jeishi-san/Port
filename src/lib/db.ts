// @ts-nocheck
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let client: any = null;
let initPromise: Promise<void> | null = null;

export async function initDb(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    client = createClient({
      url: url!,
      authToken: authToken || undefined,
    });

    await client.execute(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        metrics TEXT,
        tags TEXT,
        live_url TEXT,
        github_url TEXT,
        featured INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`);
    await client.execute(`CREATE TABLE IF NOT EXISTS skill_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT DEFAULT "Code",
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`);
    await client.execute(`CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES skill_categories(id) ON DELETE CASCADE
      );`);
    await client.execute(`CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        company TEXT NOT NULL,
        period TEXT NOT NULL,
        location TEXT,
        description TEXT,
        tech TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`);
    await client.execute(`CREATE TABLE IF NOT EXISTS experience_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        experience_id INTEGER NOT NULL,
        achievement TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
      );`);
    await client.execute(`CREATE TABLE IF NOT EXISTS education (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        degree TEXT NOT NULL,
        institution TEXT NOT NULL,
        period TEXT NOT NULL,
        location TEXT,
        description TEXT,
        tech TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`);
    await client.execute(`CREATE TABLE IF NOT EXISTS education_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        education_id INTEGER NOT NULL,
        achievement TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (education_id) REFERENCES education(id) ON DELETE CASCADE
      );`);
    await client.execute(`CREATE TABLE IF NOT EXISTS portfolio_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        avatar_url TEXT DEFAULT "/avatar.svg",
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`);

    const projectCount = (await queryOne(client, "SELECT COUNT(*) as count FROM projects"))?.count;
    if (projectCount === 0) { await seedProjects(client); }
    const skillCatCount = (await queryOne(client, "SELECT COUNT(*) as count FROM skill_categories"))?.count;
    if (skillCatCount === 0) { await seedSkills(client); }
    const expCount = (await queryOne(client, "SELECT COUNT(*) as count FROM experiences"))?.count;
    if (expCount === 0) { await seedExperience(client); }
    const eduCount = (await queryOne(client, "SELECT COUNT(*) as count FROM education"))?.count;
    if (eduCount === 0) { await seedEducation(client); }
    const settingsCount = (await queryOne(client, "SELECT COUNT(*) as count FROM portfolio_settings"))?.count;
    if (settingsCount === 0) { await seedSettings(client); }
  })();

  return initPromise;
}

export function getDb(): any {
  if (!client) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return client;
}

export function saveDb(): void {
  // Turso persists automatically; no local fs write needed.
}

export async function queryAll(db: any, sql: string, params: any[] = []): Promise<any[]> {
  const result = await db.execute(sql, params);
  return result.rows || [];
}

export async function queryOne(db: any, sql: string, params: any[] = []): Promise<any | null> {
  const result = await db.execute(sql, params);
  const rows = result.rows || [];
  return rows[0] || null;
}

export async function runStmt(db: any, sql: string, params: any[] = []): Promise<any> {
  return await db.execute(sql, params);
}

export async function lastInsertId(db: any): Promise<number> {
  const result = await db.execute("SELECT last_insert_rowid() as id");
  return result.rows?.[0]?.id || 0;
}

async function seedProjects(db: any) {
  const projects = [
    ["StegoLock", "Full Stack", "Secure digital document storage platform built with Laravel (PHP), MySQL, and React, incorporating zero-trust and Reconstruction-Dependent Security Model (RDSM) principles. Features access-controlled RESTful API endpoints and structured database schemas for document partitioning, verification, and protected storage.", "3rd Place Best Paper", JSON.stringify(["Laravel", "MySQL", "React", "Zero-Trust", "PHP", "REST API"]), "", "", 1],
    ["Queuing Management System", "Full Stack", "Full-stack digital queuing system to automate customer intake workflows, track service timestamps, and reduce physical counter congestion. Engineered MySQL database schemas to record agent status, transaction durations, and queue performance metrics.", "2024", JSON.stringify(["MySQL", "Full-Stack", "PHP", "Queue Management"]), "", "", 0],
  ];

  for (const p of projects) {
    await runStmt(db, `INSERT INTO projects (title, category, description, metrics, tags, live_url, github_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, p);
  }
}

async function seedSkills(db: any) {
  const categories = [
    ["ICT Infrastructure & Systems", "Cpu", ["Workstation Provisioning & Imaging (Rufus)", "Windows 10/11 Deployment", "Hardware Diagnostics & Assembly", "IT Asset Auditing & Inventory Tracking"]],
    ["Network Administration", "Wifi", ["Structured Cabling (Cat5e/Cat6 Termination, RJ-45)", "Cable Continuity Testing", "Local Area Network (LAN) Troubleshooting", "Basic TCP/IP Configuration"]],
    ["Access Control & Operations", "Shield", ["User Account Management", "Password Resets", "File/Share Permissions", "Helpdesk & Ticketing Support"]],
    ["Software & Security Systems", "Code", ["Zero-Trust Architecture Principles", "Database Administration (MySQL)", "Web Application Development (Laravel, React, NextJS)", "Version Control (Git and Github)"]],
  ];

  for (const [name, icon, skills] of categories) {
    await runStmt(db, "INSERT INTO skill_categories (name, icon) VALUES (?, ?)", [name, icon]);
    const catId = await lastInsertId(db);
    for (const skill of skills) {
      await runStmt(db, "INSERT INTO skills (category_id, name) VALUES (?, ?)", [catId, skill]);
    }
  }
}

async function seedExperience(db: any) {
  const experiences = [
    ["Basic Technical Support Intern", "Concentrix Corporation", "June 2025 - December 2025", "Davao City, Philippines", "Supported enterprise infrastructure and end users on an active BPO production floor, performing OS imaging, network cabling, IT asset auditing, and access control administration with a security-first approach to maintain high system availability and data integrity.", JSON.stringify(["Rufus", "Windows 10/11", "Cat5e/Cat6", "RJ-45", "MySQL", "Git", "Helpdesk Ticketing"]), ["Maintained 100+ production workstations across a 486-hour internship, executing scheduled hardware diagnostics and system maintenance to achieve 98% machine availability.", "Provisioned and standardized OS builds across 30+ desktop endpoints using bootable installation media (Rufus), reducing workstation imaging time from 45 to 25 minutes per unit.", "Fabricated, terminated, and tested Cat5e/Cat6 network patch cables using RJ-45 crimpers and continuity testers to maintain floor network connectivity and minimize workstation drops.", "Audited and logged an inventory of 150+ ICT peripheral assets, restoring 25 tested units to active deployment reserve to prevent replacement procurement costs."]],
  ];

  for (const [role, company, period, location, description, tech, achievements] of experiences) {
    await runStmt(db, "INSERT INTO experiences (role, company, period, location, description, tech) VALUES (?, ?, ?, ?, ?, ?)", [role, company, period, location, description, JSON.stringify(tech)]);
    const expId = await lastInsertId(db);
    for (const [i, ach] of achievements.entries()) {
      await runStmt(db, "INSERT INTO experience_achievements (experience_id, achievement, sort_order) VALUES (?, ?, ?)", [expId, ach, i]);
    }
  }
}

async function seedEducation(db: any) {
  const education = [
    ["Bachelor of Science in Information Technology", "University of Southeastern Philippines - Obrero Campus", "2022 - 2026", "Davao City, Philippines", "Major in Information Security. Focused on information security, web application development, database administration, and ICT infrastructure. Dean's Lister (S.Y. 2023-2026).", JSON.stringify(["Laravel", "React", "NextJS", "MySQL", "Git", "GitHub"]), ["Dean's Lister (S.Y. 2023-2026)", "Designed and implemented StegoLock, a secure document storage platform using Laravel, MySQL, and React with zero-trust principles - awarded 3rd Place, Best Paper Presentation (IT-IS Cluster) at Research Colloquium 2026.", "Civil Service Examination (CSE) Professional Level Passer, August 2025"]],
  ];

  for (const [degree, institution, period, location, description, tech, achievements] of education) {
    await runStmt(db, "INSERT INTO education (degree, institution, period, location, description, tech) VALUES (?, ?, ?, ?, ?, ?)", [degree, institution, period, location, description, JSON.stringify(tech)]);
    const eduId = await lastInsertId(db);
    for (const [i, ach] of achievements.entries()) {
      await runStmt(db, "INSERT INTO education_achievements (education_id, achievement, sort_order) VALUES (?, ?, ?)", [eduId, ach, i]);
    }
  }
}

async function seedSettings(db: any) {
  await runStmt(db, "INSERT INTO portfolio_settings (id, avatar_url) VALUES (1, '/avatar.svg')");
}
