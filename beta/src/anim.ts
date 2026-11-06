// Forty lines instead of a dependency. Everything in this scene is either a
// value easing toward a target or a timed tween.

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Frame-rate independent exponential smoothing. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const easeOutBack = (t: number) => {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

/** A tween you step by hand from the render loop. */
export class Tween {
  private elapsed = 0;
  private running = false;

  constructor(
    private duration: number,
    private ease: (t: number) => number = easeInOutCubic,
  ) {}

  start(duration = this.duration) {
    this.duration = duration;
    this.elapsed = 0;
    this.running = true;
  }

  /** Returns eased progress 0..1. */
  step(dt: number): number {
    if (!this.running) return 1;
    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      this.running = false;
      return 1;
    }
    return this.ease(this.elapsed / this.duration);
  }

  get active() {
    return this.running;
  }
}
