// A 1-bit text-mode font built at runtime from whatever monospace face the
// machine has. Each glyph is drawn once into a cell, thresholded so there is
// no antialiasing left, and cached as an atlas. Blitting from that atlas is
// what makes the KVM read as a real character-cell display rather than as
// small CSS text on a plane.
//
// Phase 2 can swap this for a true bitmap face (Px437 IBM VGA 8x16) by
// replacing buildAtlas; nothing else needs to know.

const ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("");
const EXTRA =
  "░▒▓█▀▄▌▐■□●○◆·←→↑↓─│┌┐└┘├┤┬┴┼═║╔╗╚╝╣╠╦╩╬▲▼♪✓" +
  // Accented forms the content actually uses, plus the typographic
  // punctuation that sneaks in from copy written elsewhere.
  "ÉéÁáÍíÓóÚúÀàÈèÑñÜüÖöÇç—–…“”‘’";
export const CHARSET = ASCII + EXTRA;

const INDEX = new Map<string, number>();
for (let i = 0; i < CHARSET.length; i++) INDEX.set(CHARSET[i]!, i);

const ATLAS_COLS = 16;
const ATLAS_ROWS = Math.ceil(CHARSET.length / ATLAS_COLS);

/** Threshold above which a subpixel counts as "on". */
const CUTOFF = 108;

function buildMask(cellW: number, cellH: number): HTMLCanvasElement {
  const el = document.createElement("canvas");
  el.width = ATLAS_COLS * cellW;
  el.height = ATLAS_ROWS * cellH;
  const ctx = el.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable");

  ctx.font = `${Math.round(cellH * 0.82)}px ui-monospace, SFMono-Regular, Menlo, "DejaVu Sans Mono", Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";

  for (let i = 0; i < CHARSET.length; i++) {
    const cx = (i % ATLAS_COLS) * cellW + cellW / 2;
    const cy = Math.floor(i / ATLAS_COLS) * cellH + cellH / 2;
    ctx.fillText(CHARSET[i]!, cx, cy + 0.5);
  }

  // Knock out the antialiasing. Anything that survives becomes a hard pixel.
  const img = ctx.getImageData(0, 0, el.width, el.height);
  const d = img.data;
  for (let p = 0; p < d.length; p += 4) {
    const on = d[p + 3]! >= CUTOFF;
    d[p] = 255;
    d[p + 1] = 255;
    d[p + 2] = 255;
    d[p + 3] = on ? 255 : 0;
  }
  ctx.putImageData(img, 0, 0);
  return el;
}

export class Font {
  private readonly mask: HTMLCanvasElement;
  private readonly tinted = new Map<string, HTMLCanvasElement>();

  constructor(
    readonly cellW: number,
    readonly cellH: number,
  ) {
    this.mask = buildMask(cellW, cellH);
  }

  /** The atlas recoloured, built once per colour and then reused. */
  private atlas(colour: string): HTMLCanvasElement {
    const cached = this.tinted.get(colour);
    if (cached) return cached;

    const el = document.createElement("canvas");
    el.width = this.mask.width;
    el.height = this.mask.height;
    const ctx = el.getContext("2d")!;
    ctx.drawImage(this.mask, 0, 0);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = colour;
    ctx.fillRect(0, 0, el.width, el.height);
    this.tinted.set(colour, el);
    return el;
  }

  /** Blit one character cell. Unknown characters draw nothing. */
  draw(ctx: CanvasRenderingContext2D, ch: string, col: number, row: number, colour: string) {
    const i = INDEX.get(ch);
    if (i === undefined) return;
    ctx.drawImage(
      this.atlas(colour),
      (i % ATLAS_COLS) * this.cellW,
      Math.floor(i / ATLAS_COLS) * this.cellH,
      this.cellW,
      this.cellH,
      col * this.cellW,
      row * this.cellH,
      this.cellW,
      this.cellH,
    );
  }
}
