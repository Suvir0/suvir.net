# Suvir Potdar Portfolio

Personal portfolio for [suvir.net](https://suvir.net), built with React,
TypeScript, vinext, and custom CSS.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build:pages
```

## Updating content

Most personal content lives in `app/content.ts`:

- `profile` controls contact links and the availability line.
- `projects` controls homepage project rows and case-study routes.
- `skillGroups` controls the grouped skills section.

Homepage narrative, education, and experience copy lives in `app/page.tsx`.
Visual tokens and responsive rules live in `app/globals.css`.

The primary site routes are `/`, `/about`, `/projects`, `/engineering`, and
`/resume`. Project case studies continue to use `/projects/[slug]`.

To update the résumé, replace `public/suvir-potdar-resume.pdf` while keeping
that filename. Verify `/resume` after replacement.

## Publishing

`npm run build:pages` creates the static `out/` artifact used by GitHub Pages.
Pushes to `main` deploy that artifact through `.github/workflows/pages.yml`.

`npm run build` continues to validate the Sites-compatible build. The Sites
project association is stored in `.openai/hosting.json`; do not replace its
`project_id` when saving a new version of the existing site.

The public production domain is `suvir.net`. GitHub Pages must remain configured
to use that custom domain and its GitHub Actions publishing source.

## Content safety

Do not add private hostnames, IP addresses, administration URLs, credentials,
live infrastructure status, or detailed diagrams of the real network. Omit
unverified metrics and unavailable links. Do not add placeholders.
