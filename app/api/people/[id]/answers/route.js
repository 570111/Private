import { NextResponse } from "next/server";
import { sql, ensureSchema, rowToAnswer } from "@/lib/db";

export async function GET(req, { params }) {
  await ensureSchema();
  const { id } = await params;
  const { rows } = await sql`SELECT * FROM answers WHERE person_id = ${id}`;
  const map = {};
  rows.forEach((r) => { map[r.question_id] = rowToAnswer(r); });
  return NextResponse.json(map);
}

// Upsert one answer, keyed by (person, question) — answering the same
// question again (going back and editing) just overwrites it in place.
export async function PUT(req, { params }) {
  await ensureSchema();
  const { id } = await params;
  const body = await req.json();
  await sql`
    INSERT INTO answers (person_id, question_id, chapter_id, chapter_title, question, answer, photo_url, audio_url, updated_at)
    VALUES (${id}, ${body.questionId}, ${body.chapterId}, ${body.chapterTitle}, ${body.question}, ${body.answer}, ${body.photoUrl || null}, ${body.audioUrl || null}, now())
    ON CONFLICT (person_id, question_id) DO UPDATE SET
      chapter_id = EXCLUDED.chapter_id,
      chapter_title = EXCLUDED.chapter_title,
      question = EXCLUDED.question,
      answer = EXCLUDED.answer,
      photo_url = EXCLUDED.photo_url,
      audio_url = EXCLUDED.audio_url,
      updated_at = now()
  `;
  return NextResponse.json({ ok: true });
}
