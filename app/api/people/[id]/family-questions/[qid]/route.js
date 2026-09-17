import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

// Mark one family-submitted question as answered — called right after the
// interview saves the answer that resolved it.
export async function PATCH(req, { params }) {
  await ensureSchema();
  const { id, qid } = await params;
  await sql`
    UPDATE family_questions SET status = 'answered', answered_at = now()
    WHERE id = ${qid} AND person_id = ${id}
  `;
  return NextResponse.json({ ok: true });
}
