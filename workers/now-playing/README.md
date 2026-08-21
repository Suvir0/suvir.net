# now-playing worker

Serves the currently playing Last.fm track to suvir.net. Exists so the API key
stays server-side instead of being inlined into a static bundle.

## Deploy

1. Get a key at <https://www.last.fm/api/account/create>.
2. Put your username in `wrangler.jsonc` under `vars.LASTFM_USER`.
3. From this directory:

   ```
   npx wrangler secret put LASTFM_API_KEY
   npx wrangler deploy
   ```

4. Take the deployed URL and set it as `NEXT_PUBLIC_LASTFM_ENDPOINT` — in
   `.env.local` for local development, and as a repository variable named
   `LASTFM_ENDPOINT` for the Pages build.

With no endpoint configured the widget renders nothing, so the site is fine
before this is deployed.

## What it returns

The playing track only:

```json
{"recenttracks":{"track":[{"name":"…","url":"…","artist":{"#text":"…"},"@attr":{"nowplaying":"true"}}]}}
```

Nothing scrobbling returns `{"recenttracks":{"track":[]}}`. Past tracks are never
included, so no listening history leaves the Worker.
