import { NextResponse } from "next/server";
import { getClient, MODEL_DEFAULT } from "@/lib/anthropic";

// Streams the memoir back as it's written, plain text chunks — the client
// reads the response body directly and re-renders on every chunk, the same
// live-typing effect the Claude Artifact's sample() onText gave for free.
export async function POST(req) {
  const client = getClient();
  if (!client) return NextResponse.json({ error: "not_configured", message: "ANTHROPIC_API_KEY is not set" }, { status: 500 });

  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = client.messages.stream({
          model: MODEL_DEFAULT,
          max_tokens: 8000,
          messages: [{ role: "user", content: prompt }],
        });
        s.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
        await s.finalMessage();
      } catch (e) {
        // Mid-stream failure: the client already has whatever text arrived
        // before this; it decides whether that's enough to keep.
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
