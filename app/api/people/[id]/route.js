import { NextResponse } from "next/server";
import { sql, ensureSchema, rowToPerson } from "@/lib/db";

export async function GET(req, { params }) {
  await ensureSchema();
  const { id } = await params;
  const { rows } = await sql`SELECT * FROM people WHERE id = ${id}`;
  return NextResponse.json(rows[0] ? rowToPerson(rows[0]) : null);
}

// Partial update: only fields present in the body are changed. Built with
// COALESCE so one route handles every kind of edit (progress, language,
// custom chapters, the saved memoir, ...) without hand-building SQL per case.
export async function PATCH(req, { params }) {
  await ensureSchema();
  const { id } = await params;
  const patch = await req.json();
  const { rows } = await sql`
    UPDATE people SET
      label = COALESCE(${patch.label ?? null}, label),
      spouse_term = COALESCE(${patch.spouseTerm ?? null}, spouse_term),
      progress_index = COALESCE(${patch.progressIndex ?? null}, progress_index),
      speech_lang = COALESCE(${patch.speechLang ?? null}, speech_lang),
      custom_chapters = COALESCE(${patch.customChapters ? JSON.stringify(patch.customChapters) : null}::jsonb, custom_chapters),
      traj = COALESCE(${patch.traj ?? null}, traj),
      memoir = COALESCE(${patch.memoir ? JSON.stringify(patch.memoir) : null}::jsonb, memoir),
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(rows[0] ? rowToPerson(rows[0]) : null);
}
