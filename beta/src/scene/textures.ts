import * as THREE from "three";

// Every texture in the scene is drawn into a canvas at runtime. Nothing is
// downloaded, which is the whole reason this site is a fraction of the weight
// of the thing that inspired it.

function canvas(w: number, h: number) {
  const el = document.createElement("canvas");
  el.width = w;
  el.height = h;
  const ctx = el.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return { el, ctx };
}

function finish(el: HTMLCanvasElement, repeat: [number, number] = [1, 1]) {
  const tex = new THREE.CanvasTexture(el);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 8;
  return tex;
}

/**
 * Horizontal brush streaks. Used as a roughness map so steel catches the rim
 * light along its length instead of reading as a uniform plastic slab.
 */
export function brushedRoughness(): THREE.Texture {
  const { el, ctx } = canvas(512, 512);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const y = Math.random() * 512;
    const x = Math.random() * 512;
    const len = 40 + Math.random() * 260;
    const v = 96 + Math.random() * 96;
    ctx.strokeStyle = `rgba(${v},${v},${v},${0.06 + Math.random() * 0.16})`;
    ctx.lineWidth = Math.random() < 0.85 ? 1 : 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (Math.random() - 0.5) * 1.5);
    ctx.stroke();
  }
  return finish(el, [3, 1]);
}

/**
 * A vented blanking plate or chassis face: dark metal with a field of punched
 * slots. Returned as albedo and roughness so the slots read as holes without
 * any actual geometry.
 */
export function ventPanel(cols = 34, rows = 5): { map: THREE.Texture; rough: THREE.Texture } {
  const w = 1024;
  const h = 256;
  const a = canvas(w, h);
  const r = canvas(w, h);

  a.ctx.fillStyle = "#2a2d31";
  a.ctx.fillRect(0, 0, w, h);
  r.ctx.fillStyle = "#9a9a9a";
  r.ctx.fillRect(0, 0, w, h);

  const padX = w * 0.06;
  const padY = h * 0.22;
  const cellW = (w - padX * 2) / cols;
  const cellH = (h - padY * 2) / rows;
  const slotW = cellW * 0.52;
  const slotH = cellH * 0.46;

  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const x = padX + cx * cellW + (cellW - slotW) / 2;
      const y = padY + cy * cellH + (cellH - slotH) / 2;
      const rad = slotH / 2;

      // The hole itself, plus a one-pixel lip above it so the punched edge
      // catches light the way a real stamped panel does.
      a.ctx.fillStyle = "#07080a";
      roundRect(a.ctx, x, y, slotW, slotH, rad);
      a.ctx.fill();
      a.ctx.fillStyle = "rgba(255,255,255,0.05)";
      roundRect(a.ctx, x, y - 1, slotW, 1.4, 0.7);
      a.ctx.fill();

      r.ctx.fillStyle = "#ffffff";
      roundRect(r.ctx, x, y, slotW, slotH, rad);
      r.ctx.fill();
    }
  }

  // Faint brushing over the whole plate.
  a.ctx.globalAlpha = 0.5;
  for (let i = 0; i < 700; i++) {
    const y = Math.random() * h;
    a.ctx.strokeStyle = `rgba(255,255,255,${0.012 + Math.random() * 0.02})`;
    a.ctx.beginPath();
    a.ctx.moveTo(Math.random() * w, y);
    a.ctx.lineTo(Math.random() * w, y);
    a.ctx.stroke();
  }
  a.ctx.globalAlpha = 1;

  return { map: finish(a.el), rough: finish(r.el) };
}

/** A plain dark chassis face with brushing and a subtle top-edge highlight. */
export function plainPanel(tint = "#26292d"): THREE.Texture {
  const { el, ctx } = canvas(512, 128);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 900; i++) {
    const y = Math.random() * 128;
    ctx.strokeStyle = `rgba(255,255,255,${0.01 + Math.random() * 0.025})`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, y);
    ctx.lineTo(Math.random() * 512, y);
    ctx.stroke();
  }
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, "rgba(255,255,255,0.07)");
  grad.addColorStop(0.12, "rgba(255,255,255,0)");
  grad.addColorStop(0.9, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);
  return finish(el);
}

/**
 * The silkscreened label strip on a unit's front panel. Drawn at a real
 * physical aspect so the type does not stretch when it maps onto the plate.
 */
export function labelStrip(text: string, dim = false): THREE.Texture {
  const w = 512;
  const h = 64;
  const { el, ctx } = canvas(w, h);
  ctx.fillStyle = "#191b1e";
  ctx.fillRect(0, 0, w, h);
  ctx.font = "600 26px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = dim ? "#4a4f55" : "#b9c2cb";
  ctx.fillText(text.toUpperCase(), 18, h / 2 + 1);
  return finish(el);
}

/** Honeycomb fan guard, used on the fan units. */
export function fanGuard(): THREE.Texture {
  const s = 512;
  const { el, ctx } = canvas(s, s);
  ctx.fillStyle = "#101214";
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = "#3a3f45";
  ctx.lineWidth = 7;
  const r = 30;
  const dx = r * Math.sqrt(3);
  const dy = r * 1.5;
  for (let row = -1; row * dy < s + r; row++) {
    for (let col = -1; col * dx < s + dx; col++) {
      const cx = col * dx + (row % 2 ? dx / 2 : 0);
      const cy = row * dy;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + r * 0.88 * Math.cos(ang);
        const py = cy + r * 0.88 * Math.sin(ang);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  return finish(el);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
