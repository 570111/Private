import { NextResponse } from "next/server";
import { sql, ensureSchema, rowToPerson } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM people ORDER BY created_at ASC`;
  return NextResponse.json(rows.map(rowToPerson));
}

export async function POST(req) {
  await ensureSchema();
  const body = await req.json();
  const id = body.id || ("p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
  await sql`
    INSERT INTO people (id, label, spouse_term, speech_lang)
    VALUES (${id}, ${body.label}, ${body.spouseTerm || "老伴"}, ${body.speechLang || "zh-CN"})
    ON CONFLICT (id) DO NOTHING
  `;
  const { rows } = await sql`SELECT * FROM people WHERE id = ${id}`;
  return NextResponse.json(rows[0] ? rowToPerson(rows[0]) : null);
}
