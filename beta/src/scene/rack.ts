import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { units as contentUnits, type LedState } from "../content";
import { LED, labelMaterial, ledMaterial, type Materials } from "./materials";
import { labelStrip } from "./textures";

// All of this is generated. There is no model file anywhere in the project.
// Dimensions are real: 1U is 44.45mm and the panel opening is 19 inches, so
// the proportions come out right without anyone eyeballing them.

export const U = 0.04445;
export const PANEL_W = 0.4826;
const POST_W = 0.026;
const SIDE_T = 0.014;
export const RACK_W = PANEL_W + (POST_W + SIDE_T) * 2;
export const DEPTH = 0.46;
export const SLOTS = 24;
const BASE_H = 0.052;
const TOP_H = 0.03;
export const BODY_H = SLOTS * U;
export const FRONT_Z = DEPTH / 2;

/** Centre height of slot `u`, counting from 1 at the bottom. */
export function slotY(u: number): number {
  return BASE_H + (u - 0.5) * U;
}

/** Centre height of a run of slots. */
function spanY(lo: number, hi: number): number {
  return BASE_H + ((lo + hi) / 2 - 0.5) * U;
}

export const KVM_LO = 20;
export const KVM_HI = 24;
export const KVM_Y = spanY(KVM_LO, KVM_HI);

export type RackUnit = {
  slug: string;
  group: THREE.Group;
  /** The mesh the raycaster tests against. */
  hit: THREE.Mesh;
  /** The drive sled, which pulls out on its own. */
  drive: THREE.Object3D;
  driveHit: THREE.Mesh;
  /** 0 seated, 1 ejected. */
  driveOut: number;
  leds: THREE.MeshStandardMaterial[];
  ledStates: LedState[];
  secret: boolean;
  /** 0 seated, 1 fully extended. */
  slide: number;
};

export type Rack = {
  group: THREE.Group;
  units: RackUnit[];
  power: { mesh: THREE.Mesh; material: THREE.MeshStandardMaterial; lever: THREE.Object3D };
  screen: THREE.Mesh;
  screenSize: { w: number; h: number };
  fans: THREE.Object3D[];
  statusLeds: THREE.MeshStandardMaterial[];
};

const ledGeo = new THREE.SphereGeometry(0.0042, 10, 8);
ledGeo.scale(1, 1, 0.55);

function panelGeo(w: number, h: number, d: number) {
  return new RoundedBoxGeometry(w, h, d, 2, 0.0015);
}

export function buildRack(m: Materials): Rack {
  const group = new THREE.Group();
  const units: RackUnit[] = [];
  const fans: THREE.Object3D[] = [];
  const statusLeds: THREE.MeshStandardMaterial[] = [];
  const ventedPlates: THREE.BufferGeometry[] = [];
  const plainPlates: THREE.BufferGeometry[] = [];

  // ---- cabinet -------------------------------------------------------

  const base = new THREE.Mesh(new THREE.BoxGeometry(RACK_W, BASE_H, DEPTH), m.frame);
  base.position.y = BASE_H / 2;
  group.add(base);

  const top = new THREE.Mesh(new THREE.BoxGeometry(RACK_W, TOP_H, DEPTH), m.frame);
  top.position.y = BASE_H + BODY_H + TOP_H / 2;
  group.add(top);

  for (const sign of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(SIDE_T, BODY_H, DEPTH), m.frame);
    side.position.set(sign * (RACK_W / 2 - SIDE_T / 2), BASE_H + BODY_H / 2, 0);
    group.add(side);

    // The drilled mounting post, just inside the skin.
    const post = new THREE.Mesh(new THREE.BoxGeometry(POST_W, BODY_H, 0.045), m.frame);
    post.position.set(sign * (PANEL_W / 2 + POST_W / 2), BASE_H + BODY_H / 2, FRONT_Z - 0.028);
    group.add(post);
  }

  const back = new THREE.Mesh(new THREE.BoxGeometry(RACK_W, BODY_H, 0.012), m.frame);
  back.position.set(0, BASE_H + BODY_H / 2, -DEPTH / 2 + 0.006);
  group.add(back);

  // Everything behind the front panels is a hole, not a surface.
  const cavity = new THREE.Mesh(
    new THREE.BoxGeometry(PANEL_W + 0.004, BODY_H, DEPTH - 0.03),
    m.cavity,
  );
  cavity.position.set(0, BASE_H + BODY_H / 2, -0.012);
  group.add(cavity);

  const footGeo = new THREE.CylinderGeometry(0.014, 0.017, 0.016, 12);
  for (const fx of [-1, 1]) {
    for (const fz of [-1, 1]) {
      const foot = new THREE.Mesh(footGeo, m.rubber);
      foot.position.set(fx * (RACK_W / 2 - 0.04), -0.008, fz * (DEPTH / 2 - 0.05));
      group.add(foot);
    }
  }

  // ---- the KVM console ------------------------------------------------

  const kvmH = (KVM_HI - KVM_LO + 1) * U * 0.96;
  const kvmBody = new THREE.Mesh(panelGeo(PANEL_W, kvmH, 0.034), m.bezel);
  kvmBody.position.set(0, KVM_Y, FRONT_Z + 0.012);
  group.add(kvmBody);

  const screenH = kvmH * 0.76;
  const screenW = screenH * (4 / 3);
  const recess = new THREE.Mesh(
    new THREE.BoxGeometry(screenW + 0.008, screenH + 0.008, 0.02),
    m.cavity,
  );
  recess.position.set(0, KVM_Y, FRONT_Z + 0.021);
  group.add(recess);

  // The display itself. Its material is assigned by the caller.
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), m.cavity);
  screen.position.set(0, KVM_Y, FRONT_Z + 0.0315);
  group.add(screen);

  // Console power indicator, beside the glass.
  const kvmLedMat = ledMaterial(LED.power, 0);
  const kvmLed = new THREE.Mesh(ledGeo, kvmLedMat);
  kvmLed.position.set(-screenW / 2 - 0.05, KVM_Y - kvmH / 2 + 0.028, FRONT_Z + 0.03);
  group.add(kvmLed);
  statusLeds.push(kvmLedMat);

  // ---- slot plan -------------------------------------------------------

  const byU = new Map(contentUnits.map((u) => [u.u, u]));
  const vented = new Set([19, 13, 9, 7, 5, 2]);
  const fanRows = new Set([10, 6]);
  const patchLo = 11;
  const patchHi = 12;

  for (let u = 1; u <= SLOTS; u++) {
    if (u >= KVM_LO && u <= KVM_HI) continue;
    if (u === patchHi) continue; // drawn with patchLo
    const y = slotY(u);

    if (u === 1) {
      group.add(buildPdu(m, y));
      continue;
    }
    if (u === patchLo) {
      group.add(buildPatchPanel(m, spanY(patchLo, patchHi)));
      continue;
    }
    if (fanRows.has(u)) {
      const { node, rotors } = buildFanRow(m, y);
      group.add(node);
      fans.push(...rotors);
      continue;
    }

    const content = byU.get(u);
    if (content) {
      const unit = buildUnit(m, content.slug, content.leds, content.secret ?? false, y);
      group.add(unit.group);
      units.push(unit);
      continue;
    }

    // Blanking plates never move, so they are collected and merged below
    // into one geometry per material instead of thirteen separate meshes.
    const plate = panelGeo(PANEL_W, U * 0.93, 0.01);
    plate.translate(0, y, FRONT_Z);
    (vented.has(u) ? ventedPlates : plainPlates).push(plate);
  }

  for (const [plates, material] of [
    [ventedPlates, m.vented],
    [plainPlates, m.chassis],
  ] as const) {
    if (!plates.length) continue;
    const merged = mergeGeometries(plates, false);
    for (const plate of plates) plate.dispose();
    group.add(new THREE.Mesh(merged, material));
  }

  const power = buildPowerSwitch(m, slotY(1));
  group.add(power.group);
  statusLeds.push(power.material);

  return {
    group,
    units,
    power: { mesh: power.hit, material: power.material, lever: power.lever },
    screen,
    screenSize: { w: screenW, h: screenH },
    fans,
    statusLeds,
  };
}

// ---- pieces -----------------------------------------------------------

function buildUnit(
  m: Materials,
  slug: string,
  leds: LedState[],
  secret: boolean,
  y: number,
): RackUnit {
  const g = new THREE.Group();
  const h = U * 0.93;

  const face = new THREE.Mesh(panelGeo(PANEL_W, h, 0.012), m.chassis);
  face.position.z = FRONT_Z;
  face.userData.slug = slug;
  g.add(face);

  // The chassis behind the face plus the two rack ears. All three are the
  // same material and none of them move independently, so they are baked
  // into one geometry.
  const shell = [
    new THREE.BoxGeometry(PANEL_W - 0.03, h * 0.94, DEPTH * 0.62).translate(
      0,
      0,
      FRONT_Z - DEPTH * 0.31 - 0.006,
    ),
    ...[-1, 1].map((sign) =>
      new THREE.BoxGeometry(0.014, h * 0.56, 0.018).translate(
        sign * (PANEL_W / 2 - 0.016),
        0,
        FRONT_Z + 0.013,
      ),
    ),
  ];
  const merged = mergeGeometries(shell, false);
  for (const part of shell) part.dispose();
  g.add(new THREE.Mesh(merged, m.frame));

  // Label strip. A secret unit gets no silkscreen at all, which is the tell.
  if (!secret) {
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(0.17, 0.019),
      labelMaterial(labelStrip(slug)),
    );
    strip.position.set(-PANEL_W / 2 + 0.115, 0.0005, FRONT_Z + 0.0065);
    g.add(strip);
  }

  // The drive bay, and the sled in it. The sled is its own object because it
  // comes out.
  const bay = new THREE.Mesh(new THREE.BoxGeometry(0.079, h * 0.64, 0.004), m.cavity);
  bay.position.set(PANEL_W / 2 - 0.155, 0, FRONT_Z + 0.002);
  g.add(bay);

  const drive = new THREE.Group();
  const sled = new THREE.Mesh(new THREE.BoxGeometry(0.073, h * 0.56, 0.05), m.frame);
  sled.position.z = FRONT_Z - 0.024;
  drive.add(sled);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(0.073, h * 0.14, 0.008), m.chassis);
  lip.position.set(0, h * 0.2, FRONT_Z + 0.003);
  drive.add(lip);
  drive.position.x = PANEL_W / 2 - 0.155;
  g.add(drive);

  const driveHit = new THREE.Mesh(
    new THREE.PlaneGeometry(0.085, h * 0.7),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  driveHit.position.set(PANEL_W / 2 - 0.155, 0, FRONT_Z + 0.012);
  driveHit.userData.bay = slug;
  g.add(driveHit);

  const ledMats: THREE.MeshStandardMaterial[] = [];
  leds.forEach((state, i) => {
    const mat = ledMaterial(LED[state], state === "dark" ? 0 : 1);
    const led = new THREE.Mesh(ledGeo, mat);
    led.position.set(PANEL_W / 2 - 0.058 + i * 0.015, 0, FRONT_Z + 0.0065);
    g.add(led);
    ledMats.push(mat);
  });

  g.position.y = y;

  return {
    slug,
    group: g,
    hit: face,
    drive,
    driveHit,
    driveOut: 0,
    leds: ledMats,
    ledStates: [...leds],
    secret,
    slide: 0,
  };
}

function buildPatchPanel(m: Materials, y: number): THREE.Group {
  const g = new THREE.Group();
  const h = 2 * U * 0.93;

  const face = new THREE.Mesh(panelGeo(PANEL_W, h, 0.011), m.chassis);
  face.position.z = FRONT_Z;
  g.add(face);

  // 48 ports and 48 latches. As individual meshes that is 96 draw calls for
  // one 2U panel, which is most of a frame's budget spent on something nobody
  // looks at directly.
  const ports = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.0115, 0.013, 0.008),
    m.cavity,
    48,
  );
  const latches = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.004, 0.005, 0.004),
    m.frame,
    48,
  );
  const at = new THREE.Object3D();
  let n = 0;
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 24; i++) {
      const x = -PANEL_W / 2 + 0.03 + i * 0.0177;
      const py = (row === 0 ? 1 : -1) * h * 0.21;

      at.position.set(x, py, FRONT_Z + 0.0015);
      at.updateMatrix();
      ports.setMatrixAt(n, at.matrix);

      at.position.set(x, py + 0.0085, FRONT_Z + 0.003);
      at.updateMatrix();
      latches.setMatrixAt(n, at.matrix);
      n++;
    }
  }
  ports.instanceMatrix.needsUpdate = true;
  latches.instanceMatrix.needsUpdate = true;
  g.add(ports, latches);

  // A few patched cables, drooping out of the panel.
  const curve = (x: number, drop: number) =>
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, h * 0.21, FRONT_Z + 0.004),
      new THREE.Vector3(x + 0.012, h * 0.21 - drop * 0.55, FRONT_Z + 0.055),
      new THREE.Vector3(x + 0.03, h * 0.21 - drop, FRONT_Z + 0.03),
      new THREE.Vector3(x + 0.05, h * 0.21 - drop * 0.8, FRONT_Z - 0.01),
    ]);
  for (const [x, drop] of [
    [-0.17, 0.05],
    [-0.09, 0.07],
    [0.04, 0.045],
    [0.12, 0.062],
  ] as const) {
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve(x, drop), 18, 0.0022, 6, false), m.cable);
    g.add(tube);
  }

  g.position.y = y;
  return g;
}

function buildFanRow(m: Materials, y: number): { node: THREE.Group; rotors: THREE.Object3D[] } {
  const g = new THREE.Group();
  const h = U * 0.93;
  const rotors: THREE.Object3D[] = [];

  const face = new THREE.Mesh(panelGeo(PANEL_W, h, 0.008), m.fan);
  face.position.z = FRONT_Z;
  g.add(face);

  // Seven blades baked into one geometry, so a spinning fan costs a single
  // draw call rather than seven.
  const blades: THREE.BufferGeometry[] = [];
  const spin = new THREE.Object3D();
  for (let b = 0; b < 7; b++) {
    const a = (b / 7) * Math.PI * 2;
    spin.position.set(Math.cos(a) * 0.009, Math.sin(a) * 0.009, 0);
    spin.rotation.set(0.5, 0, a);
    spin.updateMatrix();
    blades.push(new THREE.BoxGeometry(0.0115, 0.0035, 0.0016).applyMatrix4(spin.matrix));
  }
  const rotorGeo = mergeGeometries(blades, false);
  for (const blade of blades) blade.dispose();

  for (let f = 0; f < 3; f++) {
    const rotor = new THREE.Mesh(rotorGeo, m.rubber);
    rotor.position.set((f - 1) * 0.1, 0, FRONT_Z - 0.012);
    g.add(rotor);
    rotors.push(rotor);
  }

  g.position.y = y;
  return { node: g, rotors };
}

function buildPdu(m: Materials, y: number): THREE.Group {
  const g = new THREE.Group();
  const h = U * 0.93;

  const face = new THREE.Mesh(panelGeo(PANEL_W, h, 0.013), m.chassis);
  face.position.z = FRONT_Z;
  g.add(face);

  const sockets = new THREE.InstancedMesh(new THREE.BoxGeometry(0.019, 0.019, 0.007), m.cavity, 8);
  const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.0016, 0.006, 0.004), m.cavity, 16);
  const at = new THREE.Object3D();
  for (let i = 0; i < 8; i++) {
    const x = -PANEL_W / 2 + 0.105 + i * 0.027;
    at.position.set(x, 0, FRONT_Z + 0.002);
    at.updateMatrix();
    sockets.setMatrixAt(i, at.matrix);
    [-1, 1].forEach((side, k) => {
      at.position.set(x + side * 0.0045, 0.0015, FRONT_Z + 0.005);
      at.updateMatrix();
      pins.setMatrixAt(i * 2 + k, at.matrix);
    });
  }
  sockets.instanceMatrix.needsUpdate = true;
  pins.instanceMatrix.needsUpdate = true;
  g.add(sockets, pins);

  g.position.y = y;
  return g;
}

function buildPowerSwitch(m: Materials, y: number) {
  const g = new THREE.Group();

  const well = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.021, 0.008), m.cavity);
  well.position.set(-PANEL_W / 2 + 0.042, y, FRONT_Z + 0.004);
  g.add(well);

  // The rocker tilts on its own pivot, so flipping it is one rotation.
  const pivot = new THREE.Object3D();
  pivot.position.set(-PANEL_W / 2 + 0.042, y, FRONT_Z + 0.003);
  g.add(pivot);

  const rockerMat = new THREE.MeshStandardMaterial({
    color: 0x1c1f22,
    metalness: 0.1,
    roughness: 0.55,
  });
  const rocker = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.017, 0.009), rockerMat);
  rocker.position.z = 0.004;
  rocker.rotation.x = -0.26;
  pivot.add(rocker);

  const glowMat = ledMaterial(LED.power, 0.22);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.014, 0.0045), glowMat);
  glow.position.set(0, -0.0035, 0.0097);
  glow.rotation.x = -0.26;
  pivot.add(glow);

  // A generous invisible target, because the real switch is 25mm wide.
  const hit = new THREE.Mesh(
    new THREE.PlaneGeometry(0.075, 0.05),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hit.position.set(-PANEL_W / 2 + 0.042, y, FRONT_Z + 0.02);
  hit.userData.power = true;
  g.add(hit);

  return { group: g, hit, material: glowMat, lever: rocker };
}
