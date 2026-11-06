import * as THREE from "three";
import { brushedRoughness, fanGuard, plainPanel, ventPanel } from "./textures";

/** LED colours, chosen to sit well under bloom rather than to be accurate. */
export const LED = {
  ok: new THREE.Color(0x4dff9a),
  busy: new THREE.Color(0xffc44d),
  idle: new THREE.Color(0x2d7a52),
  dark: new THREE.Color(0x14181b),
  power: new THREE.Color(0xff5f52),
} as const;

export type Materials = ReturnType<typeof buildMaterials>;

export function buildMaterials() {
  const brushed = brushedRoughness();
  const vent = ventPanel();
  const guard = fanGuard();

  /** Rack posts and frame. Darker and rougher than the units it holds. */
  const frame = new THREE.MeshStandardMaterial({
    color: 0x1a1d20,
    metalness: 0.92,
    roughness: 0.46,
    roughnessMap: brushed,
    envMapIntensity: 0.55,
  });

  /** A unit's chassis face. */
  const chassis = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: plainPanel("#2b2f34"),
    metalness: 0.78,
    roughness: 0.52,
    roughnessMap: brushed,
    envMapIntensity: 0.5,
  });

  /** A blanking plate with punched slots. */
  const vented = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: vent.map,
    roughnessMap: vent.rough,
    metalness: 0.7,
    roughness: 0.6,
    envMapIntensity: 0.42,
  });

  const fan = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: guard,
    metalness: 0.6,
    roughness: 0.7,
    envMapIntensity: 0.35,
  });

  /** Anything the eye should read as a recess rather than a surface. */
  const cavity = new THREE.MeshStandardMaterial({
    color: 0x05070a,
    metalness: 0.2,
    roughness: 0.95,
    envMapIntensity: 0.08,
  });

  /** The KVM bezel: softer and less reflective than the steel around it. */
  const bezel = new THREE.MeshStandardMaterial({
    color: 0x111416,
    metalness: 0.35,
    roughness: 0.68,
    envMapIntensity: 0.3,
  });

  const rubber = new THREE.MeshStandardMaterial({
    color: 0x0a0c0e,
    metalness: 0.0,
    roughness: 0.92,
    envMapIntensity: 0.1,
  });

  const cable = new THREE.MeshStandardMaterial({
    color: 0x14181d,
    metalness: 0.1,
    roughness: 0.78,
    envMapIntensity: 0.25,
  });

  return { frame, chassis, vented, fan, cavity, bezel, rubber, cable, brushed };
}

/**
 * An LED. Emissive so the bloom pass picks it up; its own colour stays dark so
 * it does not read as a lit plastic dome when it is off.
 */
export function ledMaterial(colour: THREE.Color, intensity: number) {
  return new THREE.MeshStandardMaterial({
    color: 0x05070a,
    emissive: colour,
    emissiveIntensity: intensity,
    metalness: 0,
    roughness: 0.3,
    toneMapped: false,
  });
}

/** The silkscreen on a front-panel label strip. */
export function labelMaterial(tex: THREE.Texture) {
  return new THREE.MeshStandardMaterial({
    map: tex,
    metalness: 0.2,
    roughness: 0.8,
    envMapIntensity: 0.2,
  });
}

export function disposeMaterials(m: Materials) {
  for (const value of Object.values(m)) {
    if (value instanceof THREE.Material) value.dispose();
    else if (value instanceof THREE.Texture) value.dispose();
  }
}
