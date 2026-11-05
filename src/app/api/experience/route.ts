// @ts-nocheck
import { NextResponse } from "next/server";
import { getDb, initDb, saveDb, queryAll, queryOne, runStmt } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const db = getDb();
    const rows = await queryAll(db, "SELECT * FROM experiences ORDER BY created_at DESC");
    for (const row of rows) {
      row.tech = JSON.parse(row.tech || "[]");
      row.achievements = (await queryAll(db, "SELECT achievement FROM experience_achievements WHERE experience_id = ? ORDER BY sort_order", [row.id])).map((a: any) => a.achievement);
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
    await runStmt(db, "INSERT INTO experiences (role, company, period, location, description, tech) VALUES (?, ?, ?, ?, ?, ?)", [body.role, body.company, body.period, body.location, body.description, JSON.stringify(body.tech || [])]);
    const expId = await lastInsertId(db);
    if (body.achievements) {
      for (const [i, ach] of body.achievements.entries()) {
        await runStmt(db, "INSERT INTO experience_achievements (experience_id, achievement, sort_order) VALUES (?, ?, ?)", [expId, ach, i]);
      }
    }
    const newRow = await queryOne(db, "SELECT * FROM experiences WHERE id = ?", [expId]);
    saveDb();
    return NextResponse.json(newRow, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
