import Anthropic from "@anthropic-ai/sdk";

// "Quick" tier for short, frequent calls (follow-up questions, JSON chapter
// design); "default" tier for the one long, quality-sensitive call (writing
// the memoir itself). Mirrors the modelTier split Claude's own `sample`
// capability offers, just against your own API key instead of the viewer's.
export const MODEL_QUICK = "claude-haiku-4-5-20251001";
export const MODEL_DEFAULT = "claude-sonnet-5";

let client = null;
export function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export function textFromMessage(msg) {
  return (msg.content || []).map((b) => (b.type === "text" ? b.text : "")).join("");
}

// The model is asked for raw JSON but may wrap it in a code fence or add a
// stray sentence; read it the same tolerant way Claude's own sample.json does.
export function parseLenientJson(text) {
  try { return JSON.parse(text); } catch (e) {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) { try { return JSON.parse(fence[1]); } catch (e) {} }
  const start = text.search(/[[{]/);
  const end = Math.max(text.lastIndexOf("]"), text.lastIndexOf("}"));
  if (start >= 0 && end > start) { try { return JSON.parse(text.slice(start, end + 1)); } catch (e) {} }
  throw new Error("invalid_json");
}
