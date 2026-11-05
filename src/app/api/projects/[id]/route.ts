// @ts-nocheck
import { NextResponse } from "next/server";
import { getDb, initDb, saveDb, queryAll, queryOne, runStmt } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await initDb();
    const db = getDb();
    const row = queryOne(db, "SELECT * FROM projects WHERE id = ?", [id]);
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
    const values = [...Object.values(body), id];
    runStmt(db, "UPDATE projects SET " + setClause + " WHERE id = ?", values);
    const updated = queryOne(db, "SELECT * FROM projects WHERE id = ?", [id]);
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
    runStmt(db, "DELETE FROM projects WHERE id = ?", [id]);
    saveDb();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
