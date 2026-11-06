import * as THREE from "three";
import { Font } from "./font";

/** A small deliberate palette, in the spirit of a text-mode display. */
export const C = {
  bg: "#050a07",
  dim: "#2f6d4c",
  text: "#7dffb0",
  bright: "#ccffdc",
  accent: "#ffc44d",
  warn: "#ff7b5f",
  link: "#6fd3ff",
  shadow: "#0a1510",
} as const;

export type ScreenLayout = {
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
};

/**
 * Two grids, both landing on roughly 640x480 so the 4:3 panel in the rack
 * does not change shape.
 *
 * A phone cannot read the wide one. The display occupies at most a few
 * hundred device pixels of a handset screen, and 80 columns across that is
 * three or four pixels per glyph. The narrow grid spends the same texture on
 * a third fewer characters at half again the size, which is the difference
 * between legible and not.
 */
export const WIDE: ScreenLayout = { cols: 80, rows: 30, cellW: 8, cellH: 16 };
export const NARROW: ScreenLayout = { cols: 53, rows: 20, cellW: 12, cellH: 24 };

export function pickLayout(width = window.innerWidth): ScreenLayout {
  return width < 760 ? NARROW : WIDE;
}

/**
 * A character-cell display that lives on a canvas and ends up as a texture on
 * the KVM. It only repaints when something has actually changed, which is most
 * of the reason this scene can hold its frame rate.
 */
export class TextScreen {
  readonly canvas: HTMLCanvasElement;
  readonly texture: THREE.CanvasTexture;
  readonly cols: number;
  readonly rows: number;
  readonly width: number;
  readonly height: number;
  /** True for the compact grid, so layouts can drop secondary columns. */
  readonly narrow: boolean;

  private readonly ctx: CanvasRenderingContext2D;
  private readonly font: Font;
  private readonly cellW: number;
  private readonly cellH: number;
  private dirty = true;

  constructor(layout: ScreenLayout) {
    this.cols = layout.cols;
    this.rows = layout.rows;
    this.cellW = layout.cellW;
    this.cellH = layout.cellH;
    this.width = layout.cols * layout.cellW;
    this.height = layout.rows * layout.cellH;
    this.narrow = layout.cols < WIDE.cols;

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    const ctx = this.canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    this.font = new Font(layout.cellW, layout.cellH);

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.generateMipmaps = true;

    this.clear();
  }

  /** Call after any batch of writes; the texture uploads on the next commit. */
  touch() {
    this.dirty = true;
  }

  commit() {
    if (!this.dirty) return;
    this.texture.needsUpdate = true;
    this.dirty = false;
  }

  clear(colour: string = C.bg) {
    this.ctx.fillStyle = colour;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.dirty = true;
  }

  /** Write a string at a cell position. Clipped, never wrapped. */
  write(col: number, row: number, text: string, colour: string = C.text) {
    if (row < 0 || row >= this.rows) return;
    for (let i = 0; i < text.length; i++) {
      const c = col + i;
      if (c < 0) continue;
      if (c >= this.cols) break;
      const ch = text[i]!;
      if (ch !== " ") this.font.draw(this.ctx, ch, c, row, colour);
    }
    this.dirty = true;
  }

  /** Write centred on the full width. */
  centre(row: number, text: string, colour: string = C.text) {
    this.write(Math.max(0, Math.floor((this.cols - text.length) / 2)), row, text, colour);
  }

  /** A filled block of cells, for highlight bars and panels. */
  fill(col: number, row: number, w: number, h: number, colour: string) {
    this.ctx.fillStyle = colour;
    this.ctx.fillRect(col * this.cellW, row * this.cellH, w * this.cellW, h * this.cellH);
    this.dirty = true;
  }

  /** A single-line rule. */
  rule(row: number, colour: string = C.dim, col = 0, w = this.cols) {
    this.write(col, row, "─".repeat(Math.max(0, w)), colour);
  }

  /** A light box frame. */
  frame(col: number, row: number, w: number, h: number, colour: string = C.dim) {
    const inner = Math.max(0, w - 2);
    this.write(col, row, "┌" + "─".repeat(inner) + "┐", colour);
    for (let y = 1; y < h - 1; y++) {
      this.write(col, row + y, "│", colour);
      this.write(col + w - 1, row + y, "│", colour);
    }
    this.write(col, row + h - 1, "└" + "─".repeat(inner) + "┘", colour);
  }

  dispose() {
    this.texture.dispose();
  }
}

export function wrap(text: string, width: number): string[] {
  if (text.length <= width) return [text];
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line.length === 0) line = word;
    else if (line.length + 1 + word.length <= width) line += " " + word;
    else {
      out.push(line);
      line = word;
    }
  }
  if (line) out.push(line);
  return out;
}
