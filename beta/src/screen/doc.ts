import type { LedState } from "../content";
import { C, TextScreen, wrap } from "./textscreen";

// Most of what the KVM shows is a document: a title, a stack of lines, and
// more of them than fit on the glass. Building them as line arrays rather
// than painting straight to the screen is what makes them scrollable, and it
// keeps every content screen the same shape on either grid.

export type Line = { text: string; colour: string; indent: number };

/** First content row. Everything above it is the title block. */
export const VIEW_TOP = 6;

/** Rows of content a screen of this height can show. */
export const viewRows = (rows: number) => rows - VIEW_TOP - 2;

/** Columns of prose a screen of this width can hold. */
export const textWidth = (cols: number) => cols - 8;

export type Doc = {
  /** Top bar, left. */
  tag: string;
  title: string;
  subtitle?: string;
  lines: Line[];
  /** Bottom bar, before the scroll indicator. */
  hints: string[];
  leds?: readonly LedState[];
  /** Opened by the O and S keys while this doc is up. */
  live?: string;
  source?: string;
};

/** Small builder so the doc functions read like the page they produce. */
export class Lines {
  readonly out: Line[] = [];

  constructor(private readonly width: number) {}

  push(text: string, colour: string = C.text, indent = 0) {
    this.out.push({ text, colour, indent });
    return this;
  }

  blank(n = 1) {
    for (let i = 0; i < n; i++) this.push("", C.text);
    return this;
  }

  /** An accent-coloured section heading with a blank line above it. */
  head(text: string) {
    if (this.out.length) this.blank();
    return this.push(text, C.accent);
  }

  /**
   * Prose from content.ts. Those arrays are soft-wrapped for readability in
   * the source, so consecutive lines are rejoined into a paragraph and
   * re-wrapped to this column width -- wrapping each source line on its own
   * leaves a ragged stub after every one of them. A "" is a real break.
   */
  para(lines: readonly string[], colour: string = C.text, indent = 0) {
    let buffer: string[] = [];
    const flush = () => {
      if (!buffer.length) return;
      for (const w of wrap(buffer.join(" "), this.width - indent)) this.push(w, colour, indent);
      buffer = [];
    };
    for (const line of lines) {
      if (line === "") {
        flush();
        this.blank();
      } else buffer.push(line);
    }
    flush();
    return this;
  }

  /** A single string that has not been wrapped yet. */
  text(line: string, colour: string = C.text, indent = 0) {
    for (const w of wrap(line, this.width - indent)) this.push(w, colour, indent);
    return this;
  }

  /**
   * A term and its value in two columns. On the narrow grid the value gets
   * its own rows instead, because fourteen columns of label out of forty-five
   * leaves nothing to say anything in.
   */
  field(term: string, value: string, width = 14) {
    if (this.width < 56) {
      this.push(term, C.dim);
      for (const line of wrap(value, this.width - 2)) this.push(line, C.text, 2);
      return this;
    }
    wrap(value, this.width - width).forEach((line, i) => {
      this.push((i === 0 ? term.padEnd(width) : " ".repeat(width)) + line, i === 0 ? C.dim : C.text);
    });
    return this;
  }

  rule() {
    return this.push("─".repeat(this.width), C.shadow);
  }
}

/** How far this doc can scroll on the given screen. */
export const maxScroll = (doc: Doc, rows: number) =>
  Math.max(0, doc.lines.length - viewRows(rows));

const LED_GLYPH: Record<LedState, [string, string]> = {
  ok: ["●", C.text],
  busy: ["●", C.accent],
  idle: ["●", C.dim],
  dark: ["○", "#1d3a2b"],
};

export function drawDoc(s: TextScreen, doc: Doc, scroll: number) {
  s.clear();
  const view = viewRows(s.rows);

  s.fill(0, 0, s.cols, 1, C.dim);
  s.write(1, 0, doc.tag.toUpperCase(), C.bg);
  const right = s.narrow ? "ESC BACK" : "ESC TO GO BACK";
  s.write(s.cols - right.length - 1, 0, right, C.bg);
  if (doc.leds && !s.narrow) {
    doc.leds.forEach((state, i) => {
      const [glyph, colour] = LED_GLYPH[state];
      s.write(s.cols - right.length - 9 + i * 2, 0, glyph, colour);
    });
  }

  s.write(2, 2, doc.title, C.bright);
  if (doc.subtitle) s.write(2, 3, doc.subtitle, C.dim);
  s.rule(4, C.dim, 2, s.cols - 4);

  const over = maxScroll(doc, s.rows);
  const top = Math.max(0, Math.min(scroll, over));
  for (let i = 0; i < view; i++) {
    const line = doc.lines[top + i];
    if (!line) break;
    if (line.text) s.write(2 + line.indent, VIEW_TOP + i, line.text, line.colour);
  }

  const hints = [...doc.hints];
  if (over > 0) {
    hints.push("↑↓ scroll");
    drawScrollbar(s, top, over, doc.lines.length, view);
  }

  s.rule(s.rows - 2, C.dim);
  s.write(1, s.rows - 1, hints.join("   ").slice(0, s.cols - 2), C.dim);
}

function drawScrollbar(s: TextScreen, top: number, over: number, total: number, view: number) {
  const col = s.cols - 2;
  for (let i = 0; i < view; i++) s.write(col, VIEW_TOP + i, "│", C.shadow);

  const size = Math.max(1, Math.round((view / total) * view));
  const at = Math.round((top / over) * (view - size));
  for (let i = 0; i < size; i++) s.write(col, VIEW_TOP + at + i, "█", C.dim);
}
