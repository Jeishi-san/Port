// @ts-nocheck
import { NextResponse } from "next/server";
import { getDb, initDb, saveDb, queryAll, queryOne, runStmt, lastInsertId } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const db = getDb();
    const rows = await queryAll(db, "SELECT * FROM projects ORDER BY created_at DESC");
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
    const columns = Object.keys(body).join(", ");
    const placeholders = Object.keys(body).map(() => "?").join(", ");
    const values = Object.values(body);
    const sql = "INSERT INTO projects (" + columns + ") VALUES (" + placeholders + ")";
    await runStmt(db, sql, values);
    const newId = await lastInsertId(db);
    const newRow = await queryOne(db, "SELECT * FROM projects WHERE id = ?", [newId]);
    saveDb();
    return NextResponse.json(newRow, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
