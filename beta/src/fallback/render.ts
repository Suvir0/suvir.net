import {
  about,
  changelog,
  mistakes,
  mistakesNote,
  profile,
  rebuildClose,
  rebuilds,
  resume,
  rightNow,
  units,
} from "../content.ts";

// Runs at build time, inside the Vite config. It must stay free of anything
// browser-only, because there is no DOM here.
//
// What this produces is the page. The WebGL scene is an enhancement layered
// over it, and main.ts only removes this markup once it knows it can draw
// something better.

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const paras = (lines: string[]) => {
  const out: string[] = [];
  let buf: string[] = [];
  for (const line of lines) {
    if (line === "") {
      if (buf.length) out.push(buf.join(" "));
      buf = [];
    } else buf.push(line);
  }
  if (buf.length) out.push(buf.join(" "));
  return out.map((p) => `<p>${esc(p)}</p>`).join("\n");
};

export function renderFallback(): string {
  const visible = units.filter((u) => !u.secret);

  const projects = visible
    .map(
      (u) => `
      <article class="unit">
        <h3>${esc(u.title)}</h3>
        <p class="meta">${esc(u.meta)}</p>
        ${paras(u.body)}
        ${u.hard.length ? `<h4>The hard part</h4>${paras(u.hard)}` : ""}
        ${u.stack ? `<p class="meta">${esc(u.stack)}</p>` : ""}
        <p class="links">
          ${u.live ? `<a href="${esc(u.live)}">Live</a>` : ""}
          ${u.source ? `<a href="${esc(u.source)}">Source</a>` : ""}
        </p>
      </article>`,
    )
    .join("\n");

  const now = rightNow
    .map(([term, value]) => `<div><dt>${esc(term)}</dt><dd>${esc(value)}</dd></div>`)
    .join("\n");

  const history = rebuilds
    .map(
      (r) => `
      <article class="unit">
        <h3>${r.n}. ${esc(r.os)}</h3>
        <p class="meta">on ${esc(r.hardware)}</p>
        ${paras(r.body)}
        <p class="meta">${esc(r.note)}</p>
      </article>`,
    )
    .join("\n");

  const wrongs = mistakes
    .map(
      (m) => `
      <article class="unit">
        <h3>${esc(m.lead)}</h3>
        ${paras(m.body)}
      </article>`,
    )
    .join("\n");

  const changes = changelog
    .map((c) => `<div><dt>${esc(c.date)}</dt><dd>${esc(c.text)}</dd></div>`)
    .join("\n");

  return `
    <main id="fallback">
      <header>
        <p class="kicker">suvir.net / beta — the rack</p>
        <h1>${esc(profile.name)}</h1>
        <p class="meta">${esc(profile.location)} · ${esc(profile.school)} · graduating ${esc(profile.graduation)}</p>
      </header>

      <section>
        ${paras(about)}
      </section>

      <section>
        <h2>Work</h2>
        ${projects}
      </section>

      <section>
        <h2>The server, rebuild by rebuild</h2>
        <p class="meta">Five rebuilds, three operating systems, one gaming PC. Newest first.</p>
        ${history}
        ${paras(rebuildClose)}
      </section>

      <section>
        <h2>What I got wrong</h2>
        <p class="meta">${esc(mistakesNote)}</p>
        ${wrongs}
      </section>

      <section>
        <h2>Résumé</h2>
        ${paras(resume.summary)}
        <p class="links"><a href="${esc(resume.href)}">Download the one-page PDF</a></p>
      </section>

      <section>
        <h2>Right now</h2>
        <dl>${now}</dl>
      </section>

      <section>
        <h2>Changes to this page</h2>
        <dl>${changes}</dl>
      </section>

      <footer>
        <p>
          <a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a> ·
          <a href="${esc(profile.github)}">GitHub</a> ·
          <a href="${esc(profile.linkedin)}">LinkedIn</a> ·
          <a href="/">the main site</a>
        </p>
        <p class="meta" id="fallback-reason"></p>
      </footer>
    </main>`;
}
