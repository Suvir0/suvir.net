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
  type Rebuild,
  type Unit,
} from "../content";
import { Lines, textWidth, type Doc } from "./doc";
import { C, TextScreen, wrap } from "./textscreen";

// Everything the KVM can show. The content screens are documents (see doc.ts);
// the boot sequence, the boot menu and the root menu are painted directly,
// because they are states rather than pages.
//
// Nothing here assumes a column count. The same code paints the 80x30 grid a
// laptop gets and the 53x20 grid a phone gets.

const LED_GLYPH: Record<string, [string, string]> = {
  ok: ["●", C.text],
  busy: ["●", C.accent],
  idle: ["●", C.dim],
  dark: ["○", "#1d3a2b"],
};

function topBar(s: TextScreen, left: string, right: string) {
  s.fill(0, 0, s.cols, 1, C.dim);
  s.write(1, 0, left.toUpperCase(), C.bg);
  s.write(s.cols - right.length - 1, 0, right.toUpperCase(), C.bg);
}

function leds(s: TextScreen, col: number, row: number, states: readonly string[]) {
  states.forEach((state, i) => {
    const [glyph, colour] = LED_GLYPH[state] ?? LED_GLYPH.dark!;
    s.write(col + i * 2, row, glyph, colour);
  });
}

// ---- power-on self test ------------------------------------------------

export type PostLine = { text: string; colour?: string; delay: number };

// Kept under fifty columns so the same script reads on both grids.
export const POST_SCRIPT: PostLine[] = [
  { text: "SUVIR.NET BIOS v5.0 -- rebuild 5 of 5", colour: C.bright, delay: 240 },
  { text: "Copyright (C) 2026 Suvir Potdar.", colour: C.dim, delay: 300 },
  { text: "", delay: 120 },
  { text: "CPU     : 1 operator, 17, New Jersey", delay: 170 },
  { text: "Memory  : 5 rebuilds, 3 systems ..... OK", delay: 190 },
  { text: "", delay: 90 },
  { text: "Detecting storage devices ...", delay: 260 },
  { text: "  bay 0  njemail   682 districts  [READY]", delay: 130 },
  { text: "  bay 1  practice  3714 questions [READY]", delay: 130 },
  { text: "  bay 2  roon-rp   signed + SBOM  [READY]", delay: 130 },
  { text: "  bay 3  ripuz     rewriting      [ HOLD]", colour: C.accent, delay: 130 },
  { text: "  bay 4  gts       shipped 2025   [READY]", delay: 130 },
  { text: "", delay: 140 },
  { text: "Network : Cloudflare DNS, tunnels ... OK", delay: 200 },
  { text: "Auth    : Authentik ................. OK", delay: 170 },
  { text: "Metrics : Grafana ................... OK", delay: 220 },
  { text: "", delay: 160 },
  { text: "Press any key for the boot menu.", colour: C.dim, delay: 420 },
];

/** The kernel lines for whichever rebuild you chose to boot. */
export function bootScript(rebuild: Rebuild): PostLine[] {
  const root = rebuild.os.split(",")[0]!.toLowerCase();
  return [
    { text: rebuild.boot, colour: C.bright, delay: 420 },
    { text: "Loading initial ramdisk ...", delay: 300 },
    { text: "", delay: 80 },
    { text: `[ 0.000000] root=/dev/${root} ro`, colour: C.dim, delay: 150 },
    { text: `[ 0.214881] hw: ${rebuild.hardware}`, colour: C.dim, delay: 180 },
    { text: "[ 0.612043] systemd: multi-user reached", colour: C.dim, delay: 200 },
    { text: "[ 1.108210] docker: 44 containers up", colour: C.dim, delay: 180 },
    { text: "[ 1.640557] cloudflared: tunnel up", colour: C.dim, delay: 180 },
    { text: "[ 2.002914] authentik: ready", colour: C.dim, delay: 160 },
    { text: "", delay: 120 },
    { text: `suvir.net login: ${rebuild.n === 5 ? "suvir" : "suvir (historical)"}`, delay: 360 },
  ];
}

export function drawPost(s: TextScreen, script: PostLine[], shown: number, caret: boolean) {
  s.clear();
  const window = s.rows - 3;
  const start = Math.max(0, shown - window);
  for (let i = start; i < shown && i < script.length; i++) {
    const line = script[i]!;
    s.write(1, 1 + (i - start), line.text, line.colour ?? C.text);
  }
  if (caret && shown <= script.length) {
    const row = 1 + Math.min(shown, script.length) - start;
    if (row >= 0 && row < s.rows) s.write(1, row, "█", C.text);
  }
}

// ---- boot menu ---------------------------------------------------------

/**
 * The five rebuilds, as the thing they actually were: entries you pick
 * between. Ubuntu is the default and boots on its own, which is also what
 * happens in real life.
 */
export function drawGrub(s: TextScreen, selected: number, secondsLeft: number | null) {
  s.clear();
  s.write(2, 1, s.narrow ? "GNU GRUB 2.12" : "GNU GRUB  version 2.12", C.bright);

  const left = 2;
  const width = s.cols - 4;
  s.frame(left, 3, width, rebuilds.length + 2, C.dim);

  rebuilds.forEach((rebuild, i) => {
    const row = 4 + i;
    const on = i === selected;
    if (on) s.fill(left + 1, row, width - 2, 1, C.dim);
    const mark = rebuild.n === 5 ? "*" : " ";
    const right = s.narrow ? `${rebuild.n}/5` : `rebuild ${rebuild.n} of 5`;
    s.write(left + 2, row, mark + rebuild.os, on ? C.bg : C.text);
    s.write(left + width - right.length - 2, row, right, on ? C.bg : C.dim);
  });

  let row = 4 + rebuilds.length + 2;
  for (const line of wrap(rebuilds[selected]?.note ?? "", s.cols - 8).slice(0, 2)) {
    s.write(4, row, line, C.dim);
    row += 1;
  }

  row += s.narrow ? 1 : 2;
  if (s.narrow) {
    s.write(4, row, "↑↓ select. Enter boots.", C.dim);
    row += 1;
  } else {
    s.write(4, row, "Use the ↑ and ↓ keys to select which entry is highlighted.", C.dim);
    s.write(4, row + 1, "Press enter to boot the selected OS.", C.dim);
    row += 3;
  }

  if (row < s.rows - 2) {
    s.write(
      4,
      row,
      secondsLeft === null
        ? "Countdown stopped. Pick one."
        : s.narrow
          ? `Booting automatically in ${secondsLeft}s.`
          : `The highlighted entry will be executed automatically in ${secondsLeft}s.`,
      secondsLeft === null ? C.dim : C.accent,
    );
  }

  s.rule(s.rows - 2, C.dim);
  s.write(1, s.rows - 1, "↑↓ move   ENTER boot", C.dim);
}

// ---- root menu ---------------------------------------------------------

export type MenuRow = {
  label: string;
  meta: string;
  group: string;
  unit?: Unit;
  doc?: (width: number) => Doc;
};

export function drawMenu(
  s: TextScreen,
  rows: MenuRow[],
  selected: number,
  booted: Rebuild,
  boots: number | null,
) {
  s.clear();
  // The boot count only appears once the Worker has answered. If it never
  // does, the bar reads exactly as it did before.
  const count = boots === null ? "" : `· boot #${boots.toLocaleString("en-US")} `;
  topBar(
    s,
    " suvir.net",
    s.narrow ? `${booted.os} ${count}` : `rack 01 · ${booted.os} ${count}`,
  );

  s.write(2, 2, profile.name.toUpperCase(), C.bright);
  if (!s.narrow) s.write(2 + profile.name.length + 2, 2, `· ${profile.location}`, C.dim);
  s.write(
    2,
    3,
    s.narrow
      ? `${profile.location} · class of 2027`
      : `${profile.school} · graduating ${profile.graduation}`,
    C.dim,
  );
  s.rule(s.narrow ? 4 : 5, C.dim, 2, s.cols - 4);

  // One row per entry. The wide grid gets a heading per group and the
  // metadata column; the narrow grid gets a blank row between the groups and
  // leaves the metadata to the overlay, because there is no room for both.
  let row = s.narrow ? 6 : 7;
  let group = "";
  rows.forEach((entry, i) => {
    if (entry.group !== group) {
      group = entry.group;
      if (i > 0) row += 1;
      if (!s.narrow) {
        s.write(2, row, group.toUpperCase(), C.accent);
        row += 1;
      }
    }
    const on = i === selected;
    if (on) s.fill(2, row, s.cols - 4, 1, C.shadow);
    s.write(3, row, on ? "▶" : " ", C.accent);
    s.write(5, row, entry.label.padEnd(13), on ? C.bright : C.text);
    if (!s.narrow) s.write(19, row, entry.meta.slice(0, s.cols - 30), C.dim);
    if (entry.unit) leds(s, s.cols - 9, row, entry.unit.leds);
    row += 1;
  });

  // Whatever is left of the glass goes to the facts people actually want.
  row += 1;
  if (row < s.rows - 7) {
    s.rule(row, C.shadow, 2, s.cols - 4);
    s.write(2, row + 1, "RIGHT NOW", C.accent);
    rightNow.forEach(([term, value], i) => {
      const y = row + 2 + i;
      if (y >= s.rows - 2) return;
      s.write(4, y, term.padEnd(13), C.dim);
      s.write(18, y, value.slice(0, s.cols - 22), C.text);
    });
  }

  s.rule(s.rows - 2, C.dim);
  s.write(
    1,
    s.rows - 1,
    s.narrow ? "↑↓ move   ENTER open" : "↑↓ move   ENTER open   ? help   drag to look",
    C.dim,
  );
}

/** Shown on the dark glass before anyone has touched the switch. */
export function drawCold(s: TextScreen) {
  s.clear();
  s.centre(Math.floor(s.rows / 2) - 1, "PRESS POWER", C.dim);
}

// ---- documents ---------------------------------------------------------

const short = (url: string) => url.replace(/^https?:\/\//, "");

export function unitDoc(unit: Unit, cols: number): Doc {
  const l = new Lines(textWidth(cols));
  l.para(unit.body);
  if (unit.hard.length) {
    l.head("THE HARD PART");
    l.para(unit.hard);
  }
  if (unit.stack) {
    l.head("STACK");
    l.text(unit.stack, C.dim);
  }
  if (unit.live || unit.source) {
    l.blank();
    if (unit.live) l.push(short(unit.live), C.link);
    if (unit.source) l.push(short(unit.source), C.link);
  }

  const hints = ["ESC back"];
  if (unit.live) hints.push("O open live");
  if (unit.source) hints.push("S source");

  return {
    tag: `u${unit.u} · ${unit.slug}`,
    title: unit.title,
    subtitle: unit.meta,
    lines: l.out,
    hints,
    leds: unit.leds,
    live: unit.live,
    source: unit.source,
  };
}

export function aboutDoc(cols: number): Doc {
  const l = new Lines(textWidth(cols));
  l.para(about);
  l.head("RIGHT NOW");
  for (const [term, value] of rightNow) l.field(term, value, 13);
  l.head("REACH ME");
  l.push(profile.email, C.link);
  l.push(short(profile.github), C.link);
  l.push(short(profile.linkedin), C.link);
  return {
    tag: " about",
    title: "WHO IS RUNNING THIS",
    subtitle: `${profile.location} · graduating ${profile.graduation}`,
    lines: l.out,
    hints: ["ESC back", "E email", "G github"],
  };
}

export function serverDoc(cols: number): Doc {
  const l = new Lines(textWidth(cols));
  l.text("Five rebuilds, three operating systems, one gaming PC. Newest first.", C.dim);
  for (const rebuild of rebuilds) {
    l.head(`${rebuild.n}.  ${rebuild.os.toUpperCase()}`);
    l.push(`on ${rebuild.hardware}`, C.shadow, 4);
    l.blank();
    l.para(rebuild.body, C.text, 4);
    l.blank();
    l.text(rebuild.note, C.dim, 4);
  }
  l.blank();
  l.rule();
  l.blank();
  l.para(rebuildClose);
  return {
    tag: " the server",
    title: s_title("THE SERVER, REBUILD BY REBUILD", "THE SERVER", cols),
    subtitle: "2023 to now",
    lines: l.out,
    hints: ["ESC back"],
  };
}

export function mistakesDoc(cols: number): Doc {
  const l = new Lines(textWidth(cols));
  l.text(mistakesNote, C.dim);
  mistakes.forEach((mistake, i) => {
    l.head(`${i + 1}.  ${mistake.lead}`);
    l.blank();
    l.para(mistake.body, C.text, 4);
  });
  return {
    tag: " mistakes",
    title: "WHAT I GOT WRONG",
    subtitle: s_title("three things I would rather say myself", "three of them", cols),
    lines: l.out,
    hints: ["ESC back"],
  };
}

export function resumeDoc(cols: number): Doc {
  const l = new Lines(textWidth(cols));
  l.para(resume.summary);
  l.head("EDUCATION");
  for (const [term, value] of resume.education) l.field(term, value);
  l.head("COURSEWORK");
  l.field("in progress", resume.coursework.inProgress);
  l.blank();
  l.field("completed", resume.coursework.completed);
  l.head("SHIPPED");
  for (const unit of units.filter((u) => !u.secret)) {
    l.field(unit.slug, `${unit.meta}. ${unit.stack}`);
  }
  l.blank();
  l.rule();
  l.blank();
  l.push("The full one-page PDF:", C.text);
  l.push(`suvir.net${resume.href}`, C.link);
  return {
    tag: " resume",
    title: "RÉSUMÉ",
    subtitle: "one page, kept current",
    lines: l.out,
    hints: ["ESC back", "D the PDF"],
    live: resume.href,
  };
}

export function changelogDoc(cols: number): Doc {
  const width = textWidth(cols);
  const l = new Lines(width);
  l.text("What has changed here, and when.", C.dim);
  l.blank();
  for (const change of changelog) {
    l.push(change.date, C.accent);
    for (const line of wrap(change.text, width - 4)) l.push(line, C.text, 4);
    l.blank();
  }
  return {
    tag: " changelog",
    title: s_title("CHANGES TO THIS PAGE", "CHANGELOG", cols),
    subtitle: "newest first",
    lines: l.out,
    hints: ["ESC back"],
  };
}

/**
 * What is on the sled you just pulled out. Every number here is about the
 * project, not about any machine that exists -- the site's content rule says
 * no live infrastructure status, and an invented one would read as a real one.
 */
export function driveDoc(unit: Unit, cols: number): Doc {
  const l = new Lines(textWidth(cols));
  l.push(`/dev/${unit.slug.replace(/[^a-z0-9]/g, "")}`, C.bright);
  l.blank();
  l.field("model", unit.title, 16);
  l.field("status", unit.leds.every((x) => x === "dark") ? "SPUN DOWN" : "ONLINE", 16);
  l.field("shipped", unit.meta, 16);
  if (unit.stack) l.field("built with", unit.stack, 16);
  l.blank();
  l.rule();
  l.blank();
  l.push("SMART ATTRIBUTES", C.accent);
  l.blank();
  l.field("self-assessment", "PASSED", 16);
  l.field("reallocated", "0", 16);
  l.field("known bugs", unit.hard.length ? "1, written down" : "none recorded", 16);
  l.blank();
  l.text(
    unit.hard.length ? unit.hard.join(" ") : "Nothing here went wrong worth recording.",
    C.dim,
  );
  return {
    tag: `drive \u00b7 ${unit.slug}`,
    title: "DRIVE PULLED",
    subtitle: "push it back with esc",
    lines: l.out,
    hints: ["ESC reseat"],
    leds: unit.leds,
  };
}

export function helpDoc(cols: number): Doc {
  const l = new Lines(textWidth(cols));
  l.text("Everything here works from the keyboard. It also works from the mouse.", C.dim);
  l.head("ANYWHERE");
  l.field("esc", "back one level");
  l.field("?", "this screen");
  l.head("ON THE MENU");
  l.field("up / down", "move between entries (w and s also work)");
  l.field("enter", "open the selected entry");
  l.head("READING");
  l.field("up / down", "scroll");
  l.field("o", "open the live site in a new tab");
  l.field("s", "open the source repository");
  l.field("d", "download the résumé PDF");
  l.head("THE RACK ITSELF");
  l.field("drag", "look around");
  l.field("scroll", "move closer or further back");
  l.field("click a 1U", "open that unit directly");
  l.blank();
  l.rule();
  l.blank();
  l.text(
    "There is one unit in this rack with no label on it. It is not a blanking plate.",
    C.dim,
  );
  return { tag: " help", title: "KEYS", lines: l.out, hints: ["ESC back"] };
}

/** Long titles do not fit the narrow grid's header row. */
const s_title = (long: string, short: string, cols: number) => (cols < 60 ? short : long);
