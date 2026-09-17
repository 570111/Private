import { neon } from "@neondatabase/serverless";

// Vercel's "Add Postgres" (Neon) integration sets DATABASE_URL; older
// Vercel Postgres setups used POSTGRES_URL — accept either so this works
// regardless of which env var name actually landed in the project.
let neonSql = null;
function getNeonSql() {
  if (!neonSql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL is not set — add a Postgres store to this project in the Vercel dashboard");
    neonSql = neon(url);
  }
  return neonSql;
}
// Same tagged-template call shape as the rest of this file expects
// (`sql\`SELECT ...\``), just lazily resolving the connection on first use
// so importing this module never crashes when the env var isn't set yet.
export function sql(strings, ...values) {
  return getNeonSql()(strings, ...values);
}

let ready = null;

// Idempotent: safe to call on every request. Creates the handful of tables
// this app needs the first time anyone hits an API route after deploy, so
// there is no separate migration step to run by hand.
export function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS people (
        id text PRIMARY KEY,
        label text NOT NULL,
        spouse_term text DEFAULT '老伴',
        progress_index integer DEFAULT 0,
        speech_lang text DEFAULT 'zh-CN',
        custom_chapters jsonb DEFAULT '[]'::jsonb,
        traj text DEFAULT '',
        memoir jsonb,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS answers (
        person_id text NOT NULL,
        question_id text NOT NULL,
        chapter_id text,
        chapter_title text,
        question text,
        answer text,
        photo_url text,
        audio_url text,
        updated_at timestamptz DEFAULT now(),
        PRIMARY KEY (person_id, question_id)
      )`;
      await sql`CREATE TABLE IF NOT EXISTS extra_answers (
        id text PRIMARY KEY,
        person_id text NOT NULL,
        chapter_id text,
        chapter_title text,
        question text,
        answer text,
        photo_url text,
        audio_url text,
        created_at timestamptz DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS family_questions (
        id text PRIMARY KEY,
        person_id text NOT NULL,
        text text NOT NULL,
        from_name text DEFAULT '',
        status text DEFAULT 'pending',
        created_at timestamptz DEFAULT now(),
        answered_at timestamptz
      )`;
    })();
  }
  return ready;
}

export function rowToPerson(r) {
  return {
    id: r.id,
    label: r.label,
    spouseTerm: r.spouse_term,
    progressIndex: r.progress_index,
    speechLang: r.speech_lang,
    customChapters: r.custom_chapters || [],
    traj: r.traj || "",
    memoir: r.memoir || null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function rowToAnswer(r) {
  return {
    chapterId: r.chapter_id,
    chapterTitle: r.chapter_title,
    question: r.question,
    answer: r.answer,
    photoUrl: r.photo_url || undefined,
    audioUrl: r.audio_url || undefined,
    updatedAt: r.updated_at,
  };
}

export function rowToExtra(r) {
  return {
    id: r.id,
    chapterId: r.chapter_id,
    chapterTitle: r.chapter_title,
    question: r.question,
    answer: r.answer,
    photoUrl: r.photo_url || undefined,
    audioUrl: r.audio_url || undefined,
    createdAt: r.created_at,
  };
}

export function rowToFamilyQuestion(r) {
  return {
    id: r.id,
    text: r.text,
    from: r.from_name || "",
    status: r.status,
    createdAt: r.created_at,
    answeredAt: r.answered_at || undefined,
  };
}
