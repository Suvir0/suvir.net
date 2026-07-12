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
```

## Updating content

Most personal content lives in `app/content.ts`:

- `profile` controls contact links and the availability line.
- `projects` controls homepage project rows and case-study routes.
- `skillGroups` controls the grouped skills section.

Homepage narrative, education, and experience copy lives in `app/page.tsx`.
Visual tokens and responsive rules live in `app/globals.css`.

To update the résumé, replace `public/suvir-potdar-resume.pdf` while keeping
that filename. Verify `/resume` after replacement.

## Publishing

Run `npm run build` before publishing. The Sites project association is stored
in `.openai/hosting.json`; do not replace its `project_id` when saving a new
version of the existing site.

The initial deployment is private for content review. Promote access or connect
the final custom domain only after the copy and résumé have been approved.

## Content safety

Do not add private hostnames, IP addresses, administration URLs, credentials,
live infrastructure status, or detailed diagrams of the real network. Omit
unverified metrics and unavailable links instead of adding placeholders.
