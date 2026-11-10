// @ts-nocheck
import { NextResponse } from "next/server";
import { getDb, initDb, saveDb, queryAll, queryOne, runStmt } from "@/lib/db";

function safeJsonParse(value: any, fallback: any = []): any {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
  }
  return fallback;
}

export async function GET() {
  try {
    await initDb();
    const db = getDb();
    const rows = await queryAll(db, "SELECT * FROM education ORDER BY created_at DESC");
    for (const row of rows) {
      row.tech = safeJsonParse(row.tech, []);
      row.achievements = (await queryAll(db, "SELECT achievement FROM education_achievements WHERE education_id = ? ORDER BY sort_order", [row.id])).map((a: any) => a.achievement);
    }
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const db = getDb();
    const body = await request.json();
    await runStmt(db, "INSERT INTO education (degree, institution, period, location, description, tech) VALUES (?, ?, ?, ?, ?, ?)", [body.degree, body.institution, body.period, body.location, body.description, JSON.stringify(body.tech || [])]);
    const eduId = await lastInsertId(db);
    if (body.achievements) {
      for (const [i, ach] of body.achievements.entries()) {
        await runStmt(db, "INSERT INTO education_achievements (education_id, achievement, sort_order) VALUES (?, ?, ?)", [eduId, ach, i]);
      }
    }
    const newRow = await queryOne(db, "SELECT * FROM education WHERE id = ?", [eduId]);
    saveDb();
    return NextResponse.json(newRow, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
