import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// Bloom threshold sits high on purpose: only the LEDs and the display are
// bright enough to pass it, so the steel never turns milky.

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uGrain: { value: 0.019 },
    uVignette: { value: 0.95 },
    uAberration: { value: 0.0014 },
    uFade: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrain;
    uniform float uVignette;
    uniform float uAberration;
    uniform float uFade;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 c = vUv - 0.5;
      float r2 = dot(c, c);

      // Lateral chromatic aberration, strongest at the edges of the frame.
      vec2 off = c * r2 * uAberration * 10.0;
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + off).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - off).b;

      // Vignette.
      col *= 1.0 - clamp(r2 * uVignette, 0.0, 1.0) * 0.7;

      // Film grain. It follows the image rather than the blacks -- grain in
      // an empty dark room is just noise, and this room is mostly empty.
      float luma = dot(col, vec3(0.299, 0.587, 0.114));
      float n = hash(vUv * 900.0 + fract(uTime) * 311.0) - 0.5;
      col += n * uGrain * (0.25 + 1.15 * sqrt(luma));

      // A cool lift in the blacks so the room reads as a room, not as void.
      col += vec3(0.004, 0.008, 0.013) * (1.0 - luma);

      gl_FragColor = vec4(col * uFade, 1.0);
    }
  `,
};

export type GradeUniforms = {
  tDiffuse: { value: THREE.Texture | null };
  uTime: { value: number };
  uGrain: { value: number };
  uVignette: { value: number };
  uAberration: { value: number };
  uFade: { value: number };
};

export type GradePass = ShaderPass & { uniforms: GradeUniforms };

export type Post = {
  composer: EffectComposer;
  bloom: UnrealBloomPass;
  grade: GradePass;
  resize: (w: number, h: number) => void;
};

export function buildPost(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  size: { w: number; h: number },
): Post {
  const composer = new EffectComposer(renderer);
  composer.setSize(size.w, size.h);

  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(new THREE.Vector2(size.w, size.h), 0.62, 0.52, 0.82);
  composer.addPass(bloom);

  const grade = new ShaderPass(GradeShader) as GradePass;
  composer.addPass(grade);

  composer.addPass(new OutputPass());

  return {
    composer,
    bloom,
    grade,
    resize: (w, h) => {
      composer.setSize(w, h);
      bloom.resolution.set(w, h);
    },
  };
}
