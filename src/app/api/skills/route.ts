// @ts-nocheck
import { NextResponse } from "next/server";
import { getDb, initDb, saveDb, queryAll, queryOne, runStmt, lastInsertId } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const db = getDb();
    const categories = queryAll(db, "SELECT * FROM skill_categories ORDER BY name");
    for (const cat of categories) {
      cat.skills = queryAll(db, "SELECT * FROM skills WHERE category_id = ? ORDER BY name", [cat.id]);
    }
    return NextResponse.json(categories);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const db = getDb();
    const body = await request.json();
    if (body.type === "category") {
      runStmt(db, "INSERT INTO skill_categories (name, icon) VALUES (?, ?)", [body.name, body.icon || "Code"]);
      const newCat = queryOne(db, "SELECT * FROM skill_categories ORDER BY id DESC LIMIT 1");
      saveDb();
      return NextResponse.json(newCat, { status: 201 });
    } else {
      runStmt(db, "INSERT INTO skills (category_id, name) VALUES (?, ?)", [body.categoryId, body.name]);
      const newSkill = queryOne(db, "SELECT * FROM skills ORDER BY id DESC LIMIT 1");
      saveDb();
      return NextResponse.json(newSkill, { status: 201 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
