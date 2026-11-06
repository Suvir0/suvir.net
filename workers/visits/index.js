/**
 * The boot counter for suvir.net/beta. GitHub Pages is static and cannot
 * count anything, so this does.
 *
 * It stores one integer. No addresses, no fingerprints, no per-visitor
 * record of any kind — there is nothing in KV that could identify anybody,
 * which is the only reason a counter is worth having.
 *
 * Bindings: VISITS (KV namespace, see wrangler.jsonc)
 */

const KEY = "boots";

const ALLOWED_ORIGINS = new Set([
  "https://suvir.net",
  "http://localhost:5173",
]);

function headersFor(request) {
  const origin = request.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://suvir.net",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

function json(body, request, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: headersFor(request) });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { ...headersFor(request), "Access-Control-Allow-Methods": "GET, POST, OPTIONS" },
      });
    }

    // GET reads, POST counts. The page only POSTs when someone actually
    // powers the rack on, so a bounce is not a boot.
    if (request.method !== "GET" && request.method !== "POST") {
      return json({ error: "method not allowed" }, request, 405);
    }

    let count;
    try {
      count = Number((await env.VISITS.get(KEY)) ?? 0);
      if (!Number.isFinite(count) || count < 0) count = 0;

      if (request.method === "POST") {
        count += 1;
        // KV is eventually consistent, so two visitors in the same instant can
        // land on the same number. A counter that is occasionally one behind
        // is fine; a counter that costs a durable object is not.
        await env.VISITS.put(KEY, String(count));
      }
    } catch {
      return json({ count: null }, request);
    }

    return json({ count }, request);
  },
};
