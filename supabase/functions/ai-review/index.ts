import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors() });
  try {
    const { summary } = await req.json();
    const key = Deno.env.get("AI_API_KEY");
    const endpoint = Deno.env.get("AI_API_URL") || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    const model = Deno.env.get("AI_MODEL") || "gemini-2.0-flash";
    if (!key) throw new Error("AI_API_KEY secret is not configured.");
    const prompt = `You are a careful trading journal analyst. Review only the supplied historical journal data. Do not invent missing facts, do not predict prices, and do not issue buy/sell signals. Clearly state when sample size is small. Identify observed strengths, risks, repeated behavioral patterns, and 3 measurable review actions. Explain that correlation is not proof of causation. Data: ${JSON.stringify(summary)}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: 0.2 })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result?.error?.message || "AI provider request failed");
    const review = result?.choices?.[0]?.message?.content || "No review content returned.";
    return new Response(JSON.stringify({ review }), { headers: { ...cors(), "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error.message || error) }), { status: 400, headers: { ...cors(), "Content-Type": "application/json" } });
  }
});
function cors() {
  return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
}
