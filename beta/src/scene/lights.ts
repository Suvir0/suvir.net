import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { KVM_Y, FRONT_Z, PANEL_W } from "./rack";

// There is no ambient light in this scene and no light fixture in the room.
// Almost everything you can see is lit either by the rack's own screen or by
// one cold edge light that implies a doorway somewhere off to the left.

export type Lights = {
  rim: THREE.DirectionalLight;
  fill: THREE.DirectionalLight;
  screenGlow: THREE.RectAreaLight;
  unitKey: THREE.PointLight;
  setPower: (t: number) => void;
};

export function buildLights(scene: THREE.Scene, renderer: THREE.WebGLRenderer): Lights {
  RectAreaLightUniformsLib.init();

  // A procedural environment so the steel has something to reflect. Kept very
  // dim -- it is there for specular shape, not for illumination.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.11;
  pmrem.dispose();

  const rim = new THREE.DirectionalLight(0xbcd4ff, 2.75);
  rim.position.set(-2.9, 1.7, 0.75);
  scene.add(rim);

  // Just enough from the other side to keep the right-hand edge from vanishing.
  const fill = new THREE.DirectionalLight(0x6f86a8, 0.1);
  fill.position.set(2.8, 0.3, 1.1);
  scene.add(fill);

  // The display spilling onto the panels below it. One rect light, off until
  // the machine is powered.
  const screenGlow = new THREE.RectAreaLight(0x8fffc0, 0, PANEL_W * 0.46, 0.17);
  screenGlow.position.set(0, KVM_Y, FRONT_Z + 0.04);
  screenGlow.lookAt(0, KVM_Y - 0.35, FRONT_Z + 1);
  scene.add(screenGlow);

  // Follows the unit under the cursor so hovering actually reveals detail.
  const unitKey = new THREE.PointLight(0x9fc4ff, 0, 0.42, 2);
  unitKey.position.set(0, KVM_Y, FRONT_Z + 0.2);
  scene.add(unitKey);

  const setPower = (t: number) => {
    screenGlow.intensity = 7.5 * t;
    // Powered down, the rim light is all there is, so it has to carry the
    // whole silhouette. Once the display is up it steps back and lets the
    // rack light itself.
    rim.intensity = 2.75 - 0.95 * t;
    fill.intensity = 0.1 + 0.05 * t;
  };

  return { rim, fill, screenGlow, unitKey, setPower };
}
