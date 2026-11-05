// @ts-nocheck
import { NextResponse } from "next/server";
import { getDb, initDb, saveDb, queryOne, runStmt } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const db = getDb();
    const row = queryOne(db, "SELECT * FROM portfolio_settings WHERE id = 1");
    return NextResponse.json(row || { avatar_url: "/avatar.svg" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await initDb();
    const db = getDb();
    const body = await request.json();
    runStmt(db, "UPDATE portfolio_settings SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1", [body.avatarUrl || "/avatar.svg"]);
    const updated = queryOne(db, "SELECT * FROM portfolio_settings WHERE id = 1");
    saveDb();
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const db = getDb();
    const body = await request.json();
    const { avatarUrl } = body;
    if (!avatarUrl || !avatarUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image data URL" }, { status: 400 });
    }
    runStmt(db, "UPDATE portfolio_settings SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1", [avatarUrl]);
    const updated = queryOne(db, "SELECT * FROM portfolio_settings WHERE id = 1");
    saveDb();
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
