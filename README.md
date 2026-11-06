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

Two things live here. The main site is `app/`. `beta/` is a separate Vite +
Three.js workspace that builds the experimental version at `/beta/` — see
`beta/PLAN.md`. The two share nothing but the repository and the deploy.

Three routes on the main site, all statically rendered:

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

Two Cloudflare Workers back optional rows: `workers/now-playing` for the track
on this site, and `workers/visits` for the boot counter on the beta rack. Both
are configured by an environment variable and both simply do not render when it
is unset, so neither is required for the site to build or deploy.

The résumé PDF is generated from `resume-src/resume.html`; see the README in
that directory. Edit the HTML and regenerate rather than replacing the PDF, and
keep the filename `public/suvir-potdar-resume.pdf`.

## The beta rack

`beta/` is a server rack you can walk up to, power on and read: the same facts
as this site, told by the machine instead of the page. Procedural geometry, no
model files, no audio files, ~266 KB gzipped.

```bash
npm run dev:beta   # http://localhost:5173/beta/
```

It ships the whole of its content as plain HTML and only replaces that with the
WebGL scene when it knows it can. Crawlers, browsers without WebGL, screen
readers and anyone with reduced motion get a readable page.

Nothing on the main site links to it.

## Publishing

`npm run build` runs `next build` and then the beta build, in that order — the
Next export wipes `out/` first, so beta has to write into it afterwards.
Pushing to `main` runs `.github/workflows/pages.yml`, which builds and deploys
that directory.

The custom domain comes from `public/CNAME`, which the export copies to
`out/CNAME`. GitHub Pages must stay on the GitHub Actions publishing source.

## Temporary redirects

`public/about/`, `public/engineering/`, and `public/projects/**` are meta-refresh
stubs for URLs that existed before the 2026 rewrite. GitHub Pages cannot issue a
real 302, so each one is a static page that redirects to its closest replacement.

**Added 2026-08-21. Delete after 2026-09-21**, along with the matching test at the
bottom of `tests/rendered-html.test.mjs`.

## Content rules

No private hostnames, IP addresses, admin URLs, credentials, live
infrastructure status, or diagrams of the real network. No unverified metrics,
no dead links, no placeholders.
