import { NextResponse } from "next/server";
import { getClient, textFromMessage, parseLenientJson, MODEL_DEFAULT } from "@/lib/anthropic";

export async function POST(req) {
  const client = getClient();
  if (!client) return NextResponse.json({ error: "not_configured", message: "ANTHROPIC_API_KEY is not set" }, { status: 500 });

  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  try {
    const msg = await client.messages.create({
      model: MODEL_DEFAULT,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const data = parseLenientJson(textFromMessage(msg));
    return NextResponse.json({ data });
  } catch (e) {
    const status = e && e.status === 429 ? 429 : 502;
    return NextResponse.json({ error: status === 429 ? "rate_limited" : "upstream_error", message: String(e && e.message || e) }, { status });
  }
}
