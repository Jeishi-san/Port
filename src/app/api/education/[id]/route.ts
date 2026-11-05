// @ts-nocheck
import { NextResponse } from "next/server";
import { getDb, initDb, saveDb, queryAll, queryOne, runStmt, lastInsertId } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await initDb();
    const db = getDb();
    const row = await queryOne(db, "SELECT * FROM education WHERE id = ?", [id]);
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    row.tech = JSON.parse(row.tech || "[]");
    row.achievements = (await queryAll(db, "SELECT achievement FROM education_achievements WHERE education_id = ? ORDER BY sort_order", [id])).map((a: any) => a.achievement);
    return NextResponse.json(row);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await initDb();
    const db = getDb();
    const body = await request.json();
    await runStmt(db, "UPDATE education SET degree = ?, institution = ?, period = ?, location = ?, description = ?, tech = ? WHERE id = ?", [body.degree, body.institution, body.period, body.location, body.description, JSON.stringify(body.tech || []), id]);
    await runStmt(db, "DELETE FROM education_achievements WHERE education_id = ?", [id]);
    if (body.achievements) {
      for (const [i, ach] of body.achievements.entries()) {
        await runStmt(db, "INSERT INTO education_achievements (education_id, achievement, sort_order) VALUES (?, ?, ?)", [id, ach, i]);
      }
    }
    const updated = await queryOne(db, "SELECT * FROM education WHERE id = ?", [id]);
    saveDb();
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await initDb();
    const db = getDb();
    await runStmt(db, "DELETE FROM education WHERE id = ?", [id]);
    saveDb();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
