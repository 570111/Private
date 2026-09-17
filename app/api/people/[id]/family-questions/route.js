import { NextResponse } from "next/server";
import { sql, ensureSchema, rowToFamilyQuestion } from "@/lib/db";

export async function GET(req, { params }) {
  await ensureSchema();
  const { id } = await params;
  const { rows } = await sql`SELECT * FROM family_questions WHERE person_id = ${id} ORDER BY created_at ASC`;
  return NextResponse.json(rows.map(rowToFamilyQuestion));
}

export async function POST(req, { params }) {
  await ensureSchema();
  const { id } = await params;
  const body = await req.json();
  const qId = "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  await sql`
    INSERT INTO family_questions (id, person_id, text, from_name)
    VALUES (${qId}, ${id}, ${body.text}, ${body.from || ""})
  `;
  return NextResponse.json({ id: qId });
}
