import { NextResponse } from "next/server";
import { sql, ensureSchema, rowToExtra } from "@/lib/db";

export async function GET(req, { params }) {
  await ensureSchema();
  const { id } = await params;
  const { rows } = await sql`SELECT * FROM extra_answers WHERE person_id = ${id} ORDER BY created_at ASC`;
  return NextResponse.json(rows.map(rowToExtra));
}

export async function POST(req, { params }) {
  await ensureSchema();
  const { id } = await params;
  const body = await req.json();
  const extraId = "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  await sql`
    INSERT INTO extra_answers (id, person_id, chapter_id, chapter_title, question, answer, photo_url, audio_url)
    VALUES (${extraId}, ${id}, ${body.chapterId}, ${body.chapterTitle}, ${body.question}, ${body.answer}, ${body.photoUrl || null}, ${body.audioUrl || null})
  `;
  return NextResponse.json({ id: extraId });
}
