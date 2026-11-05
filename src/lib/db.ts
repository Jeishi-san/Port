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

    await client.execute(`
      CREATE TABLE IF NOT EXISTS projects (
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
      );
      CREATE TABLE IF NOT EXISTS skill_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT DEFAULT "Code",
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES skill_categories(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        company TEXT NOT NULL,
        period TEXT NOT NULL,
        location TEXT,
        description TEXT,
        tech TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS experience_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        experience_id INTEGER NOT NULL,
        achievement TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS education (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        degree TEXT NOT NULL,
        institution TEXT NOT NULL,
        period TEXT NOT NULL,
        location TEXT,
        description TEXT,
        tech TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS education_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        education_id INTEGER NOT NULL,
        achievement TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (education_id) REFERENCES education(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS portfolio_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        avatar_url TEXT DEFAULT "/avatar.svg",
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

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
    ["TaskFlow", "Full Stack", "A task management application that helps users organize daily tasks, set priorities, and track progress with drag-and-drop functionality.", "100+ tasks managed", JSON.stringify(["React", "Node.js", "PostgreSQL", "Tailwind CSS"]), "https://taskflow-demo.example.com", "https://github.com/example/taskflow", 1],
    ["WeatherWise", "Frontend", "A responsive weather dashboard that displays real-time weather conditions and 7-day forecasts using the OpenWeatherMap API.", "5 cities tracked", JSON.stringify(["React", "TypeScript", "Tailwind CSS", "REST API"]), "https://weatherwise-demo.example.com", "https://github.com/example/weatherwise", 1],
    ["StudyHub", "Full Stack", "A student collaboration platform for sharing study materials, forming study groups, and tracking assignment deadlines.", "50+ users", JSON.stringify(["Next.js", "Tailwind CSS", "Firebase", "JavaScript"]), "https://studyhub-demo.example.com", "https://github.com/example/studyhub", 1],
    ["CodeSnippet", "Frontend", "A personal code snippet manager for saving, categorizing, and quickly retrieving reusable code blocks across projects.", "200+ snippets", JSON.stringify(["React", "Tailwind CSS", "localStorage", "JavaScript"]), "https://codesnippet-demo.example.com", "https://github.com/example/codesnippet", 0],
    ["BudgetTracker", "Backend", "A personal finance application that tracks income and expenses, generates monthly spending reports, and sets budget goals.", "$10k+ tracked", JSON.stringify(["Python", "Flask", "SQLite", "HTML/CSS"]), "https://budgettracker-demo.example.com", "https://github.com/example/budgettracker", 0],
    ["Personal Portfolio", "Frontend", "This portfolio website built with Next.js 16, Tailwind CSS v4, and shadcn/ui, featuring dark mode support and responsive design.", "1 site built", JSON.stringify(["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"]), "https://alexmorgan.dev", "https://github.com/example/portfolio", 0],
  ];

  for (const p of projects) {
    await runStmt(db, `INSERT INTO projects (title, category, description, metrics, tags, live_url, github_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, p);
  }
}

async function seedSkills(db: any) {
  const categories = [
    ["Frontend Development", "Code", ["HTML5", "CSS3", "JavaScript (ES6+)", "TypeScript", "React", "Tailwind CSS", "shadcn/ui", "Git & GitHub"]],
    ["Backend Development", "Database", ["Node.js", "Express", "Python", "REST APIs", "SQLite", "PostgreSQL", "Firebase"]],
    ["Tools & Practices", "Cpu", ["VS Code", "Postman", "Figma", "Responsive Design", "Web Accessibility", "Agile Fundamentals", "Testing Basics"]],
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
    ["Software Engineering Intern", "TechStart Solutions", "Summer 2025", "Remote", "Assisted in building customer-facing features for a SaaS dashboard, wrote unit tests, and participated in daily standups and code reviews.", JSON.stringify(["React", "TypeScript", "Jest", "Git"]), ["Built 3 reusable React components adopted across the product dashboard.", "Fixed 15+ bugs and improved test coverage by 12% in the frontend codebase.", "Collaborated with a team of 5 engineers using Agile sprint cycles."]],
    ["IT Support Intern", "City IT Services", "Summer 2024", "San Francisco, CA", "Provided technical support for 100+ employees, managed hardware inventory, and assisted with onboarding new workstations.", JSON.stringify(["Windows", "macOS", "Active Directory", "Ticketing Systems"]), ["Resolved 40+ support tickets weekly with a 95% satisfaction rating.", "Documented troubleshooting procedures in the internal knowledge base.", "Set up and configured 20+ employee workstations."]],
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
    ["Bachelor of Science in Computer Science", "State University", "2022 - 2026", "San Francisco, CA", "Focused on software engineering, web development, and database systems.", JSON.stringify(["JavaScript", "React", "Node.js", "PostgreSQL", "Git"]), ["Developed a full-stack capstone project: a student collaboration platform with 50+ active users.", "Completed coursework in Data Structures, Algorithms, Web Development, and Database Systems.", "Member of the university's ACM chapter and hackathon participant."]],
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
