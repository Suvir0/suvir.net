import * as THREE from "three";

// The rack needs something to stand on or it reads as floating in a void.
// This is a floor that exists only directly underneath it and fades out before
// it reaches anywhere the camera could notice an edge.

export function buildFloor(): THREE.Mesh {
  const size = 256;
  const el = document.createElement("canvas");
  el.width = size;
  el.height = size;
  const ctx = el.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.42, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const fade = new THREE.CanvasTexture(el);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 4.2),
    new THREE.MeshStandardMaterial({
      color: 0x0c1013,
      roughness: 0.52,
      metalness: 0.25,
      alphaMap: fade,
      transparent: true,
      envMapIntensity: 0.35,
      depthWrite: false,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.016;
  return floor;
}

/**
 * A soft dark pool right under the cabinet. There are no shadow maps in this
 * scene -- one blurred quad costs nothing and does the same job here.
 */
export function buildContactShadow(width: number, depth: number): THREE.Mesh {
  const size = 128;
  const el = document.createElement("canvas");
  el.width = size;
  el.height = size;
  const ctx = el.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(0,0,0,0.92)");
  grad.addColorStop(0.55, "rgba(0,0,0,0.45)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 2.1, depth * 2.1),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(el),
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.012;
  shadow.renderOrder = 1;
  return shadow;
}
