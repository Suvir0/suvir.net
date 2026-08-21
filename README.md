# suvir.net

Personal site for [suvir.net](https://suvir.net). Next.js App Router, exported
as static HTML and served from GitHub Pages.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Checks:

```bash
npm run lint
npm run typecheck
npm test
```

`npm test` builds the site and asserts against the real exported HTML in `out/`.

## Structure

Three routes, all statically rendered:

| Route     | File                 |
| --------- | -------------------- |
| `/`       | `app/page.tsx`       |
| `/work`   | `app/work/page.tsx`  |
| `/resume` | `app/resume/page.tsx`|

Prose and project data live in `app/content.ts`. Page structure lives in the
route files. Every visual token and responsive rule is in `app/globals.css`.

`app/last-push.tsx` is the only client component. It reads the public GitHub
events API for the "Last push" row and falls back to a plain profile link when
that request fails or is rate limited.

To replace the résumé, overwrite `public/suvir-potdar-resume.pdf` under the same
filename, then check `/resume`.

## Publishing

`npm run build` writes the static site to `out/`. Pushing to `main` runs
`.github/workflows/pages.yml`, which builds and deploys that directory.

The custom domain comes from `public/CNAME`, which the export copies to
`out/CNAME`. GitHub Pages must stay on the GitHub Actions publishing source.

## Content rules

No private hostnames, IP addresses, admin URLs, credentials, live
infrastructure status, or diagrams of the real network. No unverified metrics,
no dead links, no placeholders.
