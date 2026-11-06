// The boot counter. A Cloudflare Worker plus KV, because GitHub Pages is
// static and cannot count anything on its own. See workers/visits.
//
// With no endpoint configured, or the Worker unreachable, this resolves to
// null and the counter simply is not drawn -- the same way the now-playing
// row on the main site behaves.

const ENDPOINT = import.meta.env.VITE_VISITS_ENDPOINT ?? "";

export async function visits(): Promise<number | null> {
  if (!ENDPOINT) return null;
  try {
    const response = await fetch(ENDPOINT, { method: "POST", cache: "no-store" });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    const count = (data as { count?: unknown })?.count;
    return typeof count === "number" && Number.isFinite(count) ? count : null;
  } catch {
    return null;
  }
}
