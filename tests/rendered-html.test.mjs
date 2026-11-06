import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
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

  for (const title of ["NJ Email Security Census", "practice.suvir.net", "Roon Rich Presence", "Ripuz", "GuessThatStat"]) {
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

  for (const asset of ["favicon.ico", "icon.png", "apple-icon.png", "opengraph-image.png"]) {
    await access(new URL(asset, out));
  }

  // Kept so links shared before the rename still resolve to an image.
  await access(new URL("og.png", out));
});

test("social and tab icons are wired up", async () => {
  const html = await page("index.html");

  assert.match(html, /rel="icon"[^>]*favicon\.ico/);
  assert.match(html, /rel="apple-touch-icon"/);
  // Hashed URL, so changing the image busts every social cache.
  assert.match(html, /og:image"[^>]*opengraph-image\.png\?/);
  assert.match(html, /og:image:alt"[^>]*Suvir Potdar, New Jersey/);
  assert.doesNotMatch(html, /Software, Infrastructure/);
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

// The beta rack is a WebGL scene, but the page it ships has to stand on its
// own: crawlers, browsers without WebGL, screen readers and anyone with
// reduced motion get this markup and nothing else. If these fail, /beta is a
// blank black rectangle for those people.
test("the beta rack ships a readable page, not just a canvas", async () => {
  const html = await page("beta/index.html");

  assert.match(html, /<title>The Rack — Suvir Potdar<\/title>/);
  assert.match(html, /id="fallback"/);

  for (const title of [
    "NJ EMAIL SECURITY CENSUS",
    "PRACTICE.SUVIR.NET",
    "ROON RICH PRESENCE",
    "RIPUZ",
    "GUESSTHATSTAT",
  ]) {
    assert.match(html, new RegExp(title.replace(/\./g, "\\.")), title);
  }

  // The numbers are the point of the njemail entry; losing them in the trim
  // would make the fallback a worse page than the main site.
  assert.match(html, /682 NJ public districts/);
  assert.match(html, /29% publish no DMARC/);

  // The hidden unit stays hidden. It is an easter egg in the scene, so it
  // must not be sitting in the HTML where anyone can read it first.
  assert.doesNotMatch(html, /ProBook/i);

  // A way back to the real site, and the rebuild history.
  assert.match(html, /href="\/"/);
  assert.match(html, /rebuild by rebuild/i);

  // Every rebuild, in order, with its hardware. The boot menu offers these
  // five, so the plain page has to carry the same five.
  for (const os of [
    "Ubuntu",
    "Proxmox, again",
    "Unraid",
    "Proxmox, on my gaming PC",
    "Proxmox, on a 2015 HP laptop",
  ]) {
    assert.match(html, new RegExp(os.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), os);
  }

  // The sections that only exist on the rack's own screens.
  assert.match(html, /What I got wrong/i);
  assert.match(html, /A list of only wins is not believable/);
  assert.match(html, /suvir-potdar-resume\.pdf/);
  assert.match(html, /Changes to this page/i);
});

// The scene is decoration over a real page. If these fail, someone using a
// screen reader, or a keyboard, gets a canvas and nothing else.
test("the beta rack stays usable without looking at it", async () => {
  const html = await page("beta/index.html");

  // A skip link into the readable content, before anything else focusable.
  assert.match(html, /class="skip-link" href="#fallback"/);

  // With the scene running the readable page is moved off screen, never
  // removed. display:none would delete it from the accessibility tree.
  const offScreen = html.match(/body\.webgl #fallback\s*\{[^}]*\}/s)?.[0] ?? "";
  assert.match(offScreen, /clip-path:\s*inset\(50%\)/);
  assert.doesNotMatch(offScreen, /display:\s*none/);

  // Screen changes are announced, and the canvas itself is not read out.
  assert.match(html, /id="announce"[^>]*aria-live="polite"/);
  assert.match(html, /id="stage"[^>]*aria-hidden="true"/);

  // Touch devices get on-screen equivalents for the keys.
  assert.match(html, /id="pad"/);
  for (const key of ["ArrowUp", "ArrowDown", "Enter", "Escape"]) {
    assert.match(html, new RegExp(`data-key="${key}"`), key);
  }

  // Nothing in the scene is a dependency: no model, no audio, one script.
  assert.doesNotMatch(html, /\.glb|\.mp3|\.hdr/);
});

test("the beta rack makes its own noise and counts nobody", async () => {
  const html = await page("beta/index.html");

  // Sound is synthesised, not shipped. If an audio file ever appears here,
  // someone has added a dependency with a licence attached to it.
  assert.doesNotMatch(html, /\.mp3|\.wav|\.ogg|\.m4a/);
  const files = await readdir(new URL("beta/assets/", out));
  for (const file of files) {
    assert.doesNotMatch(file, /\.(mp3|wav|ogg|m4a|glb|gltf|hdr|exr)$/, file);
  }

  // Muted until asked, with a control that says which way it is.
  assert.match(html, /id="sound"[^>]*aria-pressed="false"/);

  // The counter endpoint is configuration, never baked into the source.
  const [script] = files.filter((f) => f.endsWith(".js"));
  const js = await readFile(new URL(`beta/assets/${script}`, out), "utf8");
  assert.doesNotMatch(js, /workers\.dev/, "a Worker URL was hardcoded into the bundle");
});

test("the beta build does not disturb the main site", async () => {
  await access(new URL("index.html", out));
  const home = await page("index.html");
  assert.doesNotMatch(home, /\/beta\//, "the main site must not link to beta yet");
});
