import * as THREE from "three";
import { clamp, damp, easeInOutCubic } from "../anim";

// A hand-rolled rig rather than OrbitControls, because the camera has two
// drivers: the state machine moves it between framings, and the viewer looks
// around on top of that. Keeping those as separate terms means they never
// fight each other.

export type Framing = {
  target: THREE.Vector3;
  radius: number;
  /** Azimuth from +Z, radians. Positive swings right. */
  theta: number;
  /** Polar from +Y, radians. */
  phi: number;
};

const LOOK = { theta: 0.62, phi: 0.3, radius: 0.55 };

/**
 * Pulling back should show the whole cabinet, not a distant view of the one
 * panel the state machine was looking at. Past WIDE.from the camera's aim
 * slides down towards the middle of the rack, so zooming out is how you get
 * to the parts of it nothing has pointed you at.
 */
const WIDE = { target: new THREE.Vector3(0, 0.58, 0) };

export class CameraRig {
  /** Where the state machine wants the camera. */
  private from: Framing;
  private to: Framing;
  private tween = 1;
  private duration = 1;

  /** What the viewer has done on top of that. */
  private userTheta = 0;
  private userPhi = 0;
  private userRadius = 0;
  /** Wheel and pinch move this; userRadius eases towards it. */
  private userRadiusTarget = 0;
  private velTheta = 0;
  private velPhi = 0;

  private readonly current: Framing;
  /** Slow idle motion, so a still frame never looks like a frozen one. */
  private drift = 0;
  private sinceInput = 99;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private pointers = new Map<number, { x: number; y: number }>();
  private pinch = 0;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly dom: HTMLElement,
    start: Framing,
  ) {
    this.from = cloneFraming(start);
    this.to = cloneFraming(start);
    this.current = cloneFraming(start);
    this.bind();
    this.apply();
  }

  goTo(framing: Framing, duration = 1.1) {
    this.from = cloneFraming(this.current);
    this.to = cloneFraming(framing);
    this.tween = 0;
    this.duration = duration;
  }

  /**
   * Give back the viewer's own zoom. Opening something to read should put it
   * at reading distance, however far out they had pulled to find it.
   */
  resetZoom() {
    this.userRadiusTarget = 0;
  }

  /** True while the camera is still moving between framings. */
  get moving() {
    return this.tween < 1;
  }

  update(dt: number) {
    if (this.tween < 1) {
      this.tween = Math.min(1, this.tween + dt / this.duration);
      const t = easeInOutCubic(this.tween);
      this.current.target.lerpVectors(this.from.target, this.to.target, t);
      this.current.radius = this.from.radius + (this.to.radius - this.from.radius) * t;
      this.current.theta = this.from.theta + (this.to.theta - this.from.theta) * t;
      this.current.phi = this.from.phi + (this.to.phi - this.from.phi) * t;
    }

    this.userRadius = damp(this.userRadius, this.userRadiusTarget, 9, dt);
    this.drift += dt;
    if (this.dragging) this.sinceInput = 0;
    else this.sinceInput += dt;

    // Inertia on the look-around, so letting go of a drag coasts.
    if (!this.dragging) {
      this.userTheta = clamp(this.userTheta + this.velTheta * dt, -LOOK.theta, LOOK.theta);
      this.userPhi = clamp(this.userPhi + this.velPhi * dt, -LOOK.phi, LOOK.phi);
      this.velTheta = damp(this.velTheta, 0, 6, dt);
      this.velPhi = damp(this.velPhi, 0, 6, dt);
    }

    this.apply();
  }

  private readonly aim = new THREE.Vector3();

  private apply() {
    // The drift fades in once the viewer stops touching it, and is small
    // enough to read as a handheld camera rather than as movement.
    const idle = clamp((this.sinceInput - 0.6) / 1.8, 0, 1);
    const driftTheta = Math.sin(this.drift * 0.21) * 0.013 * idle;
    const driftPhi = Math.sin(this.drift * 0.147 + 1.1) * 0.008 * idle;

    const theta = this.current.theta + this.userTheta + driftTheta;
    const phi = clamp(this.current.phi + this.userPhi + driftPhi, 0.42, 2.0);
    const radius = Math.max(0.3, this.current.radius + this.userRadius);

    // Measured against how far the viewer has pulled back from the framing
    // they were given, not against an absolute distance -- a phone reads the
    // display from twice as far away as a laptop does, and that is not a
    // decision to look at the whole rack.
    const wide = clamp(this.userRadius / Math.max(0.5, this.current.radius * 1.1), 0, 1);
    this.aim.lerpVectors(this.current.target, WIDE.target, wide);

    const sinPhi = Math.sin(phi);
    this.camera.position.set(
      this.aim.x + radius * sinPhi * Math.sin(theta),
      this.aim.y + radius * Math.cos(phi),
      this.aim.z + radius * sinPhi * Math.cos(theta),
    );
    this.camera.lookAt(this.aim);
  }

  private bind() {
    const el = this.dom;
    el.style.touchAction = "none";

    el.addEventListener("pointerdown", (e) => {
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.pointers.size === 1) {
        this.dragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.velTheta = 0;
        this.velPhi = 0;
      }
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener("pointermove", (e) => {
      if (!this.pointers.has(e.pointerId)) return;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (this.pointers.size >= 2) {
        const [a, b] = [...this.pointers.values()];
        if (!a || !b) return;
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (this.pinch > 0) {
          this.userRadiusTarget = clamp(
            this.userRadiusTarget + (this.pinch - dist) * 0.0022,
            -LOOK.radius,
            LOOK.radius * 4.2,
          );
        }
        this.pinch = dist;
        return;
      }

      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;

      const scale = 0.0042;
      this.userTheta = clamp(this.userTheta + dx * scale, -LOOK.theta, LOOK.theta);
      this.userPhi = clamp(this.userPhi + dy * scale * 0.8, -LOOK.phi, LOOK.phi);
      this.velTheta = dx * scale * 7;
      this.velPhi = dy * scale * 5.6;
    });

    const release = (e: PointerEvent) => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.pinch = 0;
      if (this.pointers.size === 0) this.dragging = false;
    };
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    el.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.userRadiusTarget = clamp(
          this.userRadiusTarget + e.deltaY * 0.0011,
          -LOOK.radius,
          LOOK.radius * 4.2,
        );
      },
      { passive: false },
    );
  }

  /** Did the pointer move far enough that this was a drag, not a click? */
  movedSince(x: number, y: number) {
    return Math.hypot(this.lastX - x, this.lastY - y) > 6;
  }
}

function cloneFraming(f: Framing): Framing {
  return { target: f.target.clone(), radius: f.radius, theta: f.theta, phi: f.phi };
}
