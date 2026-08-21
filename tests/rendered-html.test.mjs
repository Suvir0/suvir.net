import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const out = new URL("../out/", import.meta.url);

const page = (path) => readFile(new URL(path, out), "utf8");

test("the notes page carries the narrative", async () => {
  const html = await page("index.html");

  assert.match(html, /<title>Suvir Potdar<\/title>/i);
  assert.match(html, /can(’|&#x27;)t decide on an operating system/);
  assert.match(html, /rebuild by rebuild/);
  assert.match(html, /Ubuntu/);
  assert.match(html, /What I got wrong/);
  assert.match(html, /application\/ld\+json/);
});

test("work lists every project and flags the one on hold", async () => {
  const html = await page("work/index.html");

  for (const title of ["practice.suvir.net", "Roon Rich Presence", "Ripuz", "GuessThatStat"]) {
    assert.match(html, new RegExp(title.replace(/\./g, "\\.")), title);
  }

  assert.match(html, /work-status/);
  assert.match(html, /On hold/);
});

test("the résumé page links the PDF", async () => {
  const html = await page("resume/index.html");

  assert.match(html, /R(é|&#x27;|&eacute;)sum(é|&eacute;), one page/);
  assert.match(html, /suvir-potdar-resume\.pdf/);
});

test("the previous generic site is gone", async () => {
  const html = await page("index.html");

  assert.doesNotMatch(html, /Operating range<\/strong>/);
  assert.doesNotMatch(html, /Selected projects with clear technical depth/);
  assert.doesNotMatch(html, /Toggle color theme/);
});

test("the deployable artifact has what Pages needs", async () => {
  assert.equal((await readFile(new URL("CNAME", out), "utf8")).trim(), "suvir.net");
  await access(new URL("suvir-potdar-resume.pdf", out));
  await access(new URL("og.png", out));
});

// Temporary: added 2026-08-21 with the redirect stubs, delete both after 2026-09-21.
test("old URLs still redirect to their closest replacement", async () => {
  const moved = [
    ["about/index.html", "/"],
    ["engineering/index.html", "/"],
    ["projects/index.html", "/work/"],
    ["projects/guess-that-stat/index.html", "/work/"],
    ["projects/infrastructure-lab/index.html", "/"],
    ["projects/ripuz/index.html", "/work/"],
    ["projects/roon-rich-presence/index.html", "/work/"],
  ];

  for (const [path, target] of moved) {
    const html = await page(path);
    assert.match(html, new RegExp(`refresh" content="0; url=${target}"`), path);
    assert.match(html, new RegExp(`canonical" href="https://suvir\\.net${target}"`), path);
    assert.match(html, /location\.replace/, path);
    assert.match(html, /Remove after 2026-09-21/, path);
  }
});
