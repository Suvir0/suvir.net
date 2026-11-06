# suvir.net/beta — "The Rack"

A dark room with one server rack in it, lit almost entirely by its own LEDs and
the glow of a KVM screen. You power it on, it POSTs, and each 1U in the rack is
a project. Same facts as the main site, told by the machine instead of the page.

Status: **all four phases are built.** `npm run dev:beta`, then open
http://localhost:5173/beta/.

The one thing not done here is deploying the boot-counter Worker, which needs
a Cloudflare account — see `workers/visits/README.md`. Until it is deployed the
counter simply does not render.

---

## Why a rack and not a Game Boy

The reference ([sadok.mx](https://sadok.mx)) works because Sadok is a designer
and a Game Boy Color is a nostalgic consumer object that flatters that. The main
site at suvir.net is about one thing: the server. Five rebuilds, three operating
systems, one gaming PC, 44 containers, Cloudflare tunnels, Grafana dashboards
checked more than necessary, a capital letter taking down the media stack at
3 a.m.

A rack is the same trick told honestly. It is also, as far as I can find, not a
thing anyone has built.

---

## Decisions already made

| Question | Answer |
| --- | --- |
| Concept | The Rack |
| Art direction | Dark room, near-photoreal, procedural geometry |
| Approach | Phased, aiming large |
| Code location | Separate Vite app in `beta/`, builds into `out/beta/` |
| Content | Reuse `app/content.ts`, trimmed to fit a screen |
| Access | Unlinked from the main site, full HTML fallback |
| Extras | Sound, visitor counter, easter eggs |
| Explicitly out | Live server data (README forbids exposing infra status) |

---

## What the reference actually does

Taken apart on 2026-11-05, for reference on what the bar is:

- Astro shell, one WebGL island. Raw Three.js, not React Three Fiber. GSAP for motion.
- `gameboy.glb`, 1.1 MB, loaded through GLTFLoader with DRACO + KTX2 compression.
- The screen is a canvas texture on the screen mesh, with text drawn from four
  bitmap font atlases (`pressstart-8`, `emerald-16`, `tiny-5`, `capcom-6`).
  That is why it looks genuinely pixelated rather than like CSS text at a small size.
- Audio: three MP3s plus a sprite sheet (`ui.json` + `ui.mp3`) for interface blips.
- `POST /api/visit` drives the "visitor #31,412" counter.
- ~3.5 MB total, roughly 10 s to interactive, works on mobile with tappable
  on-screen buttons and visible key hints.
- Flow: loading → "turn up volume / click to power on" → flip the physical power
  switch → boot jingle → title menu (PROJECTS / BLOG / ABOUT) → project carousel
  with A=OPEN, B=BACK.

We beat its payload easily, because our geometry is generated in code rather
than downloaded.

---

## The scene

Everything is procedural. No `.glb`, no Blender, no model downloads.

**Rack chassis.** Two posts, top and bottom frame, standard 19" proportions,
12U tall. Built from boxes with small bevels.

**Each 1U.** A front panel with a vent grille, a label strip, two or three
emissive LEDs, a couple of drive bays. Vent patterns and brushed-metal streaks
come from small canvases generated at runtime and used as roughness/normal maps.

**KVM at the top.** A 4:3 LCD panel. Its screen is a `CanvasTexture` — this is
the content surface for the entire site.

**Patch panel.** A row of RJ45 ports with a handful of cables as
`CatmullRomCurve3` tubes with a realistic sag.

**PDU at the bottom.** A rocker power switch that is clickable and animates.

**Fans.** Three or four with rotating blade geometry.

**Floor.** Probably none — just void with a soft contact shadow, so the rack
appears to hang in the dark.

### Lighting and post

No ambient light at all. One cold rim light from behind-left so the steel edges
read. Everything else is the rack's own emission: LEDs, drive activity, and one
`RectAreaLight` driven by the KVM so its blue spills believably onto the panels
below it.

Post chain: `RenderPass` → `UnrealBloomPass` (high threshold, so only LEDs and
screens bloom) → a custom pass for film grain, vignette, and slight chromatic
aberration → `OutputPass`.

Reflections come from a tiny environment map generated at runtime with
`PMREMGenerator` — a gradient plus a few bright rectangles. Steel reads as metal
with no HDRI download.

### Performance budget

- Under 40 draw calls, under 60k triangles. Instance the vents, merge the frame.
- Device pixel ratio capped at 2, or 1.5 on mobile.
- Stop rendering entirely when the tab is hidden, or when idle with nothing animating.
- Target: interactive in under 2 s on a mid-range laptop.

---

## Interaction

### States

1. **COLD.** The rack is nearly invisible. One rocker switch glows faintly.
   "Power on." Any key or any click also works.
2. **POST.** The KVM runs a BIOS power-on self test — memory count, drive
   detection — while the LEDs sweep on one unit at a time with a tick. About
   3 s, skippable.
3. **BOOT MENU.** A GRUB-style list of the five rebuilds, Ubuntu preselected,
   3 s countdown, auto-boots. Arrow keys pick another one. Picking an older
   rebuild re-grades the whole scene — this is an easter egg, see below.
4. **BROWSE.** The main state. Three-quarter camera. Hover a 1U and it
   highlights, its label brightens, and the KVM shows a one-line summary. Drag
   to orbit (clamped — no going behind or underneath). Scroll to dolly, clamped.
5. **DETAIL.** Click a unit: the camera dollies in, the unit slides out on its
   rails, and the KVM fills with that project. Esc or B or a click away slides
   it back.

### Controls

Keyboard throughout: `↑` `↓` move between units, `Enter` opens, `Esc` backs out,
`M` mutes, `?` shows help, `~` opens the hidden shell. Full keyboard operability
is not optional — it is also most of the accessibility story.

Mobile: page scroll is locked so drag maps cleanly to orbit, tap targets grow,
the camera starts framed for portrait, and key hints are replaced with
on-screen buttons the way the reference does it.

---

## The KVM screen

The screen renders to a fixed 640×480 canvas, then upscales onto the screen mesh
with `NearestFilter` so the pixels stay crisp and deliberate instead of blurry.
A fragment shader adds scanlines, a slight barrel curve, and phosphor bleed.

Font: **Px437 IBM VGA 8×16** — a free, pixel-accurate reproduction of the IBM
PC's text-mode font. It is exactly correct for a BIOS POST screen and costs
nothing to license.

Screens to build:

| Screen | Source |
| --- | --- |
| `boot` | POST sequence |
| `grub` | the five rebuilds from `rebuilds[]` |
| `main` | root menu |
| `about` | the intro prose, trimmed |
| `work/<slug>` ×5 | from `work[]` — what it is, the hard part, stack, links |
| `server` | rebuild history, long form |
| `mistakes` | from `mistakes[]` |
| `resume` | summary plus a link out to the PDF |
| `changelog` | from `changelog[]` |
| `help` | key reference |

Content is trimmed hard. The main site's njemail paragraph is 90 words; on a
640×480 screen it becomes three lines that keep the numbers and drop the setup.

---

## The fallback, which we build first

`beta/index.html` ships with **all of the content as real HTML**, generated at
build time from the same content file. On load, if WebGL is available and
`prefers-reduced-motion` is not set, the script hides that markup and mounts the
canvas over it. Otherwise the page simply is a readable page.

This means crawlers and link previews get real content, no-WebGL and older
browsers get the site, screen readers get the site, and reduced-motion users get
the site plus a "load it anyway" button.

It is cheap if we do it on day one and expensive to retrofit, so it goes in
Phase 1.

---

## Extras

### Sound

Synthesized in WebAudio rather than downloaded. A POST beep is a square wave, a
relay click is a filtered noise burst, fan hum is filtered brown noise, a servo
whirr is a swept sawtooth. Zero files, zero licensing, zero payload, and it
suits the subject better than sampled audio would.

Muted by default (browsers block autoplay regardless). Speaker toggle persisted
to `localStorage`. Anything genuinely not synthesizable comes from CC0 sources.

### Visitor counter

A Cloudflare Worker plus KV, following the same shape as the existing
`workers/now-playing`. Displayed in the rack's own idiom:

```
POWER-ON HOURS    01847
BOOT COUNT        #31,412   ← you
```

Fails invisibly when the Worker is unreachable, exactly like the now-playing row
on the main site.

### Easter eggs

- **The unlabeled 1U.** A dead unit at the bottom of the rack, dark, no label.
  Click it: the HP ProBook from 2015. First one. Still works. Lives in a drawer.
- **Booting an older rebuild.** Pick Proxmox or Unraid from the GRUB menu and
  the whole scene re-grades to that era — Unraid's orange, Proxmox's grey.
- **A pullable drive** in one of the bays.
- **The hidden shell** on `~`, with a handful of commands that actually run.
- **Konami code.**

---

## Build setup

```
suvir.net/
  app/                     untouched
  beta/
    package.json           workspace member
    vite.config.ts         base: '/beta/', outDir: '../out/beta'
    index.html
    src/
      main.ts
      content.ts           trimmed, derived from ../app/content.ts
      scene/               rack.ts  materials.ts  lights.ts  post.ts
      screen/              canvas.ts  font.ts  screens/*.ts
      input/               keyboard.ts  pointer.ts  touch.ts
      audio/               synth.ts
      fallback/            build-time HTML generation
  package.json             workspaces: ["beta"]
```

Root `build` script becomes `next build && npm -w beta run build`. Order
matters: Next's static export wipes `out/`, so beta has to build after it.

Dependencies for beta: `three`, `vite`, `typescript`. Nothing else. The
post-processing passes ship inside `three/examples/jsm`. GSAP is not needed —
about forty lines of easing helpers covers every animation here.

`.gitignore` already ignores `/out/`, so nothing generated gets committed. The
GitHub Pages workflow needs no changes at all.

A second entry goes in `.claude/launch.json` for the beta dev server on 5173.

A test gets added to `tests/rendered-html.test.mjs` asserting that
`out/beta/index.html` contains the fallback content, so the fallback can never
silently break.

---

## Phases

**Phase 1 — vertical slice. DONE.** Vite workspace wired into the build. Dark
room with a floor and a contact shadow. Procedural 24U rack: cabinet, five
project units, a 5U KVM console, a 24-port patch panel with drooping cables,
two fan rows, a PDU, vented blanking plates, and the unlabelled unit. Materials,
light rig, bloom and grade. Power switch → POST → boot → menu → unit detail and
an about screen. Orbit, pinch, hover, click any unit on the rack, full keyboard
navigation. The HTML fallback, with a way back into the scene.

Shipped weight: **255 KB gzipped, one file, no models and no audio.** The
reference site is roughly 3.5 MB.

What Phase 1 deliberately left: sound, the GRUB rebuild menu, the easter eggs,
the visitor counter, and a real mobile layout. The phone currently gets the
desktop framing with the overlay collisions fixed, which is legible but not
designed.

**Phase 2 — the whole site. DONE.** Every screen and all the content. The
boot menu offers the five rebuilds, Ubuntu default on a four-second countdown,
and whichever you pick is named in the kernel messages, the HUD and the KVM's
title bar for the rest of the session.

Content screens became scrollable documents (`screen/doc.ts`): a title, a stack
of styled lines, a viewport and a scrollbar. That is what made the long ones
possible. Six new screens: the full rebuild history, what I got wrong, the
résumé, the changelog, keys, and the hidden unit's own page.

The root menu is now two groups, UNITS and ELSEWHERE, with the right-now facts
filling the rest of the glass. Opening a unit is a two-beat camera move: push in
as the 1U slides out of the rack, then lift to the display. Zooming out slides
the camera's aim down to the middle of the cabinet, so pulling back is how you
find the parts nothing has pointed you at -- including the unlabelled unit at
U3. Opening anything to read gives that zoom back.

Keyboard throughout: arrows or wasd or hjkl, enter, esc, page up and down, home
and end, `?` for keys, `o` `s` `d` `e` `g` for the links. The font atlas grew
accented and typographic characters so RÉSUMÉ renders.

Shipped weight: **260 KB gzipped**, still one JS file and a 6.4 KB HTML page,
still no models and no audio.

**Phase 3 — everywhere. DONE.**

*The grid adapts.* A phone cannot read eighty columns: the display lands on a
few hundred device pixels and that is three or four per glyph. So the text
screen is no longer a fixed 80x30. Under 760px it switches to **53x20 at 12x24
cells** -- the same ~640x480 texture spent on a third fewer characters at half
again the size, which is the difference between legible and not. Rotating a
tablet across the boundary rebuilds the display and re-wraps whatever document
is open.

*The camera solves rather than guesses.* Framing distance now comes from the
geometry: solve for where the panel covers a given fraction of the viewport
width, with the fraction rising from 0.5 on a laptop to 0.92 on a phone. The
three-quarter angle squares up in step with it -- a laptop keeps the angle,
a phone looks at the glass straight on, because at that distance the offset
pushes the panel off the side of the frame.

*Touch.* An on-screen pad (up, enter, down, esc) that replays its buttons as
the keys they stand for, so there is still exactly one place deciding what a
key does. Overlay hints drop key names on touch, where they are noise.

*Performance.* **206 draw calls down to 41.** The patch panel's 96 ports and
latches became two instanced meshes, the PDU's 24 sockets and pins two more,
each fan's seven blades one merged geometry, and the thirteen blanking plates
two merged meshes -- one per material. Pixel ratio starts at the device's own
and steps down only if the frame rate asks, measured over two seconds so one
slow frame never triggers it.

*Accessibility.* With the scene running the readable page is moved off screen,
not removed -- `display: none` would delete it from the accessibility tree and
hand a screen reader a canvas and nothing else. There is a skip link to it, a
polite live region announcing each screen, and the canvas is `aria-hidden`.
Four tests now hold all of that in place.

Shipped weight: **262 KB gzipped**, one JS file, a 6.9 KB HTML page, no models
and no audio.

**Phase 4 — character. DONE.**

*Sound, synthesised.* No files, no licences, nothing downloaded. A POST beep is
a square wave, a relay click is a filtered noise burst, the fans are brown
noise through a low-pass, a drive sled is a swept saw, the power rocker is a
noise burst over a falling sine. Muted until asked, remembered in
`localStorage`, toggled with `M` or the control in the corner. The
AudioContext is created inside the gesture that powers the rack on, because
that is the only moment a browser will allow it.

*The display changes with the rebuild.* Boot an older entry from the menu and
the KVM becomes the monitor that rebuild ran on: Ubuntu keeps full colour,
Proxmox goes amber, Unraid orange, the 2015 laptop white monochrome. Two
uniforms in the CRT shader collapse the image to luminance and tint it, and
the light the panel spills onto the rack below changes with it. It says "this
was three years ago" better than a caption would.

*The boot counter.* `workers/visits`, a Cloudflare Worker over one KV integer.
It stores a number and nothing else — no addresses, no fingerprints, no
per-visitor record, which is the only reason a counter is worth having. It
counts on power-on rather than page load, so a bounce is not a boot, and the
row never renders if the endpoint is unset or the Worker is down.

*The shell.* `~` from the menu opens a real prompt: `ls`, `cat`, `open`,
`units`, `whoami`, `uname`, `uptime`, `neofetch`, `clear`, `exit`, with history
on the arrows and tab completion. `uname` reports whichever rebuild you booted.
Nothing in it reports anything about the actual server — a fake `docker ps`
naming real services would break this repository's own content rule with extra
steps.

*The drive.* Every unit's bay pulls out, but only once that unit is already
extended, so nobody finds it before they have found the unit. It shows a SMART
readout about the project rather than about any machine that exists. Esc
reseats it; Esc again closes the unit.

*Konami.* Up up down down left right left right B A. Every LED to maximum, the
fans to four times speed, the bloom up, and a five-note fanfare.

Shipped weight: **266 KB gzipped, two files.** Still no models and no audio —
a test now fails if an audio or model file ever appears in the build.

---

## What is deliberately not here

**The résumé PDF is linked, not embedded.** The rack points at
`/suvir-potdar-resume.pdf` on the main site rather than rendering it.

**No live server data.** This was asked about in planning and ruled out: the
repository's content rules forbid exposing live infrastructure status, and the
shell, the POST screen and the SMART readouts all stay on the right side of
that. Every number any of them prints is about a project, not a machine.

**The font is still system monospace thresholded to 1-bit**, rather than a true
Px437 IBM VGA atlas. It looks right and costs nothing; `screen/font.ts` has the
seam if it is ever worth swapping.

**Nothing links to /beta.** That is the setting chosen in planning. When it
should go live, add it to `app/site-header.tsx` and delete the assertion in
`tests/rendered-html.test.mjs` that currently forbids it.
