// Token endpoint for the First Mate Labs voice demo.
// POST /api/demo/session { business, turnstileToken } -> { conversationToken }
//
// 1. Check the Origin header against ALLOWED_ORIGINS.
// 2. Verify the Turnstile token with Cloudflare (siteverify).
// 3. Map the business key to its agent ID. The browser never sends an agent ID.
// 4. Check the call caps in one Durable Object, so the counts are atomic.
// 5. Ask ElevenLabs for a WebRTC conversation token with the API key from a Worker secret.
// Every cap answers with the same 429, so a visitor cannot tell which one was hit.

import { DurableObject } from "cloudflare:workers";

const BUSINESSES = ["dental", "hvac", "roofing", "medspa", "law", "realestate"];

const num = (v, fallback) => (Number.isFinite(Number(v)) && v !== "" && v != null ? Number(v) : fallback);

function limits(env) {
  return {
    perIpPerHour: num(env.PER_IP_PER_HOUR, 5),
    dailyPerAgent: num(env.DAILY_PER_AGENT, 40),
    dailyTotal: num(env.DAILY_TOTAL, 200),
    maxConcurrent: num(env.MAX_CONCURRENT, 4), // plan cap: Free 4, Starter 6, Creator 10, Pro 20
    slotSeconds: num(env.SLOT_SECONDS, 190), // 180 s call + margin; the Worker cannot see a call end
  };
}

function cors(request, env) {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = (env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return { origin, ok: allowed.includes(origin) };
}

function json(body, status, origin) {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (origin) Object.assign(headers, { "Access-Control-Allow-Origin": origin, Vary: "Origin" });
  return new Response(JSON.stringify(body), { status, headers });
}

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyTurnstile(env, token, ip, allowedOrigins) {
  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET);
  form.set("response", token);
  if (ip) form.set("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  if (!res.ok) return false;
  const out = await res.json();
  if (!out.success) return false;
  const hosts = allowedOrigins.map((o) => new URL(o).hostname);
  return !hosts.length || hosts.includes(out.hostname);
}

async function mintToken(env, agentId) {
  const url = `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`;
  const res = await fetch(url, { headers: { "xi-api-key": env.ELEVENLABS_API_KEY } });
  if (!res.ok) throw new Error(`elevenlabs ${res.status}`);
  const { token } = await res.json();
  if (!token) throw new Error("elevenlabs: no token");
  return token;
}

export default {
  async fetch(request, env) {
    const { origin, ok } = cors(request, env);

    if (request.method === "OPTIONS") {
      if (!ok) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          Vary: "Origin",
        },
      });
    }
    if (request.method !== "POST" || new URL(request.url).pathname !== "/api/demo/session") {
      return json({ error: "not found" }, 404);
    }
    if (!ok) return json({ error: "forbidden" }, 403);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "bad request" }, 400, origin);
    }
    const { business, turnstileToken } = body ?? {};
    if (!BUSINESSES.includes(business) || typeof turnstileToken !== "string" || !turnstileToken || turnstileToken.length > 2048) {
      return json({ error: "bad request" }, 400, origin);
    }
    const agentId = JSON.parse(env.AGENT_IDS || "{}")[business];
    if (!agentId) return json({ error: "unavailable" }, 503, origin);

    const ip = request.headers.get("CF-Connecting-IP") ?? "";
    const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
    if (!(await verifyTurnstile(env, turnstileToken, ip, allowedOrigins))) {
      return json({ error: "verification failed" }, 403, origin);
    }

    const gate = env.LIMITS.get(env.LIMITS.idFromName("global"));
    const ticket = await gate.acquire(await sha256(ip), business, limits(env));
    if (!ticket.ok) return json({ error: "busy" }, 429, origin);

    try {
      return json({ conversationToken: await mintToken(env, agentId) }, 200, origin);
    } catch (err) {
      await gate.release(ticket.slot, ticket.keys);
      console.error(err.message);
      return json({ error: "upstream" }, 502, origin);
    }
  },
};

// One instance holds every counter, so two visitors cannot both take the last slot.
export class DemoLimits extends DurableObject {
  async acquire(ipHash, business, cap, now = Date.now()) {
    const hour = Math.floor(now / 3_600_000);
    const day = new Date(now).toISOString().slice(0, 10); // caps reset at 00:00 UTC
    const keys = { ip: `ip:${hour}:${ipHash}`, agent: `day:${day}:${business}`, total: `day:${day}:total` };

    await this.prune(hour, day);
    const slots = ((await this.ctx.storage.get("slots")) ?? []).filter((s) => s.until > now);
    const [ip, agent, total] = await Promise.all([keys.ip, keys.agent, keys.total].map((k) => this.ctx.storage.get(k)));

    if ((ip ?? 0) >= cap.perIpPerHour) return { ok: false };
    if ((agent ?? 0) >= cap.dailyPerAgent) return { ok: false };
    if ((total ?? 0) >= cap.dailyTotal) return { ok: false };
    if (slots.length >= cap.maxConcurrent) return { ok: false };

    const slot = crypto.randomUUID();
    slots.push({ id: slot, until: now + cap.slotSeconds * 1000 });
    await this.ctx.storage.put({
      slots,
      [keys.ip]: (ip ?? 0) + 1,
      [keys.agent]: (agent ?? 0) + 1,
      [keys.total]: (total ?? 0) + 1,
    });
    return { ok: true, slot, keys };
  }

  // Called when ElevenLabs refuses to mint a token, so a failed attempt costs the visitor nothing.
  async release(slot, keys) {
    const slots = ((await this.ctx.storage.get("slots")) ?? []).filter((s) => s.id !== slot);
    const counts = await this.ctx.storage.get(Object.values(keys));
    const next = { slots };
    for (const [k, v] of counts) next[k] = Math.max(0, v - 1);
    await this.ctx.storage.put(next);
  }

  async prune(hour, day) {
    if ((await this.ctx.storage.get("pruned")) === `${day}:${hour}`) return;
    const stale = [];
    for (const k of (await this.ctx.storage.list({ prefix: "ip:" })).keys()) if (!k.startsWith(`ip:${hour}:`)) stale.push(k);
    for (const k of (await this.ctx.storage.list({ prefix: "day:" })).keys()) if (!k.startsWith(`day:${day}:`)) stale.push(k);
    if (stale.length) await this.ctx.storage.delete(stale);
    await this.ctx.storage.put("pruned", `${day}:${hour}`);
  }
}
