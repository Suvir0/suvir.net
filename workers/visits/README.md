# visits worker

The boot counter on suvir.net/beta. Exists because GitHub Pages is static and
cannot count anything.

## Deploy

1. Create the namespace and copy the id it prints into `wrangler.jsonc`:

   ```
   npx wrangler kv namespace create VISITS
   ```

2. From this directory:

   ```
   npx wrangler deploy
   ```

3. Take the deployed URL and set it as `VITE_VISITS_ENDPOINT` — in
   `beta/.env.local` for local development, and as a repository variable named
   `VISITS_ENDPOINT` for the Pages build.

With no endpoint configured the counter never renders, so /beta is fine before
this is deployed. The same is true if the Worker is down.

## What it stores

One integer, under the key `boots`. Nothing else — no addresses, no
fingerprints, no per-visitor record. There is nothing here that could identify
anyone, which is the only reason this is worth having at all.

`POST` increments and returns the new value; `GET` reads without incrementing.
The page only POSTs when someone powers the rack on, so a bounce is not a boot.

```json
{"count":1234}
```

KV is eventually consistent, so two people arriving in the same instant can land
on the same number. A counter that is occasionally one behind is fine; one that
needs a durable object is not.
