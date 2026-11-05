// @ts-nocheck
import { NextResponse } from "next/server";
import { getDb, initDb, saveDb, queryOne, runStmt } from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await initDb();
    const db = getDb();
    const body = await request.json();
    if (body.type === "category") {
      runStmt(db, "UPDATE skill_categories SET name = ?, icon = ? WHERE id = ?", [body.name, body.icon, id]);
      const updated = queryOne(db, "SELECT * FROM skill_categories WHERE id = ?", [id]);
      saveDb();
      return NextResponse.json(updated);
    } else {
      runStmt(db, "UPDATE skills SET name = ? WHERE id = ?", [body.name, id]);
      const updated = queryOne(db, "SELECT * FROM skills WHERE id = ?", [id]);
      saveDb();
      return NextResponse.json(updated);
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await initDb();
    const db = getDb();
    const type = request.headers.get("x-type") || "skill";
    if (type === "category") {
      runStmt(db, "DELETE FROM skill_categories WHERE id = ?", [id]);
    } else {
      runStmt(db, "DELETE FROM skills WHERE id = ?", [id]);
    }
    saveDb();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
