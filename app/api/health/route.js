import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

// Reports which settings are present (true/false only — never the values)
// and whether the database actually answers, so a misconfigured deploy
// says what's wrong instead of an empty 500.
export async function GET() {
  const env = {
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    DATABASE_URL: !!(process.env.DATABASE_URL || process.env.POSTGRES_URL),
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
  };
  try {
    await ensureSchema();
    const { rows } = await sql`SELECT count(*)::int AS n FROM people`;
    return NextResponse.json({ ok: true, env, people: rows[0].n });
  } catch (e) {
    return NextResponse.json({ ok: false, env, error: String((e && e.message) || e) }, { status: 500 });
  }
}
