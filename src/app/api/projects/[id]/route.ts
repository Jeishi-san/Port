// @ts-nocheck
import { NextResponse } from "next/server";
import { getDb, initDb, saveDb, queryAll, queryOne, runStmt } from "@/lib/db";

function serializeValue(v: any): any {
  if (Array.isArray(v)) return JSON.stringify(v);
  return v;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await initDb();
    const db = getDb();
    const row = await queryOne(db, "SELECT * FROM projects WHERE id = ?", [id]);
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
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
    const setClause = Object.keys(body).map((k) => k + " = ?").join(", ");
    const values = [...Object.values(body).map(serializeValue), id];
    await runStmt(db, "UPDATE projects SET " + setClause + " WHERE id = ?", values);
    const updated = await queryOne(db, "SELECT * FROM projects WHERE id = ?", [id]);
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
    await runStmt(db, "DELETE FROM projects WHERE id = ?", [id]);
    saveDb();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
