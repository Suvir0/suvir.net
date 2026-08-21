/**
 * Proxies one Last.fm call so the API key never reaches the browser.
 *
 * Returns the currently playing track and nothing else. If nothing is
 * scrobbling, the track list comes back empty — listening history never
 * leaves this Worker.
 *
 * Secrets:  LASTFM_API_KEY   (wrangler secret put LASTFM_API_KEY)
 * Vars:     LASTFM_USER      (wrangler.jsonc)
 */

const ENDPOINT = "https://ws.audioscrobbler.com/2.0/";

const ALLOWED_ORIGINS = new Set([
  "https://suvir.net",
  "http://localhost:3000",
]);

const EMPTY = { recenttracks: { track: [] } };

function headersFor(request) {
  const origin = request.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://suvir.net",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=30",
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
        headers: { ...headersFor(request), "Access-Control-Allow-Methods": "GET, OPTIONS" },
      });
    }

    if (request.method !== "GET") {
      return json({ error: "method not allowed" }, request, 405);
    }

    const url = new URL(ENDPOINT);
    url.searchParams.set("method", "user.getrecenttracks");
    url.searchParams.set("user", env.LASTFM_USER);
    url.searchParams.set("api_key", env.LASTFM_API_KEY);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    let data;
    try {
      // Edge cache, so a burst of visitors costs one upstream request.
      const upstream = await fetch(url, { cf: { cacheTtl: 30, cacheEverything: true } });
      if (!upstream.ok) return json(EMPTY, request);
      data = await upstream.json();
    } catch {
      return json(EMPTY, request);
    }

    const track = data?.recenttracks?.track?.[0];
    if (track?.["@attr"]?.nowplaying !== "true") return json(EMPTY, request);

    // Rebuild by hand rather than forwarding upstream: only these fields ship.
    return json(
      {
        recenttracks: {
          track: [
            {
              name: track.name,
              url: track.url,
              artist: { "#text": track.artist?.["#text"] },
              "@attr": { nowplaying: "true" },
            },
          ],
        },
      },
      request,
    );
  },
};
