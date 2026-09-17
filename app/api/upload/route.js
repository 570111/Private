import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "not_configured", message: "BLOB_READ_WRITE_TOKEN is not set" }, { status: 500 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!file) return NextResponse.json({ error: "invalid_request", message: "no file" }, { status: 400 });

  try {
    const safeName = String(file.name || "upload").replace(/[^\w.-]/g, "_");
    const blob = await put(`uploads/${Date.now()}-${safeName}`, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    return NextResponse.json({ error: "upstream_error", message: String(e && e.message || e) }, { status: 502 });
  }
}
