// Every sound here is generated. A POST beep is a square wave, a relay click
// is a filtered noise burst, a fan is brown noise through a low-pass, and a
// drive sled is a swept saw. That costs nothing to ship, nothing to license,
// and suits a rack better than samples of one would.
//
// Muted by default. Browsers block audio until a gesture anyway, and a page
// that makes noise at you unasked is a page people close.

const STORE_KEY = "rack.sound";

export class Sound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private hum: { source: AudioBufferSourceNode; gain: GainNode } | null = null;
  private noise: AudioBuffer | null = null;
  private brown: AudioBuffer | null = null;

  muted: boolean;

  constructor() {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORE_KEY);
    } catch {
      // Private browsing, or storage blocked. Default applies.
    }
    this.muted = stored !== "on";
  }

  /** Must be called from inside a user gesture, or the context stays suspended. */
  unlock() {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
      this.noise = makeNoise(this.ctx, 1, false);
      this.brown = makeNoise(this.ctx, 3, true);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    try {
      localStorage.setItem(STORE_KEY, muted ? "off" : "on");
    } catch {
      // Not being able to remember the choice is not a reason to refuse it.
    }
    if (!this.master || !this.ctx) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.5, this.ctx.currentTime + 0.18);
  }

  // ---- one-shots ------------------------------------------------------

  /** The single POST beep. */
  beep(freq = 980, length = 0.11) {
    this.tone("square", freq, length, 0.1);
  }

  /** A bay reporting in during the self test. */
  tick() {
    this.burst(0.022, 3200, 0.06, "highpass");
  }

  /** Menu movement. */
  blip() {
    this.tone("square", 620, 0.035, 0.035);
  }

  /** A relay somewhere behind the panel. */
  click() {
    this.burst(0.035, 1600, 0.09, "bandpass");
  }

  /** The power rocker. Heavier, with some body under it. */
  clunk() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    this.burst(0.06, 420, 0.13, "lowpass");
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
    osc.connect(gain).connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  }

  /** A 1U sliding on its rails. */
  whirr(length = 0.42) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(58, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(96, ctx.currentTime + length * 0.7);
    osc.frequency.linearRampToValueAtTime(52, ctx.currentTime + length);
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 3;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, ctx.currentTime + length - 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + length);
    osc.connect(filter).connect(gain).connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + length + 0.02);
  }

  /** Two notes when the machine finishes booting. */
  chime() {
    this.tone("triangle", 523.25, 0.16, 0.07, 0);
    this.tone("triangle", 784, 0.3, 0.07, 0.13);
  }

  /** Everything at once. Used by exactly one easter egg. */
  fanfare() {
    [392, 523.25, 659.25, 784, 1046.5].forEach((f, i) => {
      this.tone("square", f, 0.18, 0.055, i * 0.075);
    });
  }

  // ---- the fans -------------------------------------------------------

  /** Level is 0 to 1. The hum follows how awake the rack is. */
  setHum(level: number) {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.brown) return;

    if (!this.hum) {
      const source = ctx.createBufferSource();
      source.buffer = this.brown;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 340;
      filter.Q.value = 0.8;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      source.connect(filter).connect(gain).connect(this.master);
      source.start();
      this.hum = { source, gain };
    }

    const target = 0.1 * level;
    this.hum.gain.gain.setTargetAtTime(target, ctx.currentTime, 0.4);
  }

  // ---- building blocks -------------------------------------------------

  private tone(
    type: OscillatorType,
    freq: number,
    length: number,
    peak: number,
    delay = 0,
  ) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const at = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(peak, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(gain).connect(this.master);
    osc.start(at);
    osc.stop(at + length + 0.02);
  }

  private burst(length: number, cutoff: number, peak: number, filterType: BiquadFilterType) {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.noise) return;
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = cutoff;
    filter.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peak, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + length);
    source.connect(filter).connect(gain).connect(this.master);
    source.start();
    source.stop(ctx.currentTime + length + 0.02);
  }
}

/** White noise, or brown noise when `rolled` — brown is what a fan sounds like. */
function makeNoise(ctx: AudioContext, seconds: number, rolled: boolean): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let previous = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    if (!rolled) {
      data[i] = white;
      continue;
    }
    previous = (previous + 0.02 * white) / 1.02;
    data[i] = previous * 3.2;
  }
  return buffer;
}
