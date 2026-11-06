import * as THREE from "three";

// The KVM is not a texture on a plane, it is a display. The curve, the
// scanlines and the phosphor bleed are what sell it; without them a 640x480
// canvas on a quad just looks like a low-resolution image.

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform sampler2D map;
  uniform float uTime;
  uniform float uPower;
  uniform float uLines;
  uniform float uMono;
  uniform vec3 uTint;
  varying vec2 vUv;

  // Pull the corners back so the glass reads as convex.
  vec2 curve(vec2 uv) {
    vec2 c = uv * 2.0 - 1.0;
    vec2 off = abs(c.yx) / vec2(7.0, 5.0);
    c += c * off * off;
    return c * 0.5 + 0.5;
  }

  void main() {
    vec2 uv = curve(vUv);

    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // Aperture-grille style separation, a fraction of a pixel wide.
    float sep = 0.00042;
    vec3 col;
    col.r = texture2D(map, uv + vec2(sep, 0.0)).r;
    col.g = texture2D(map, uv).g;
    col.b = texture2D(map, uv - vec2(sep, 0.0)).b;

    // Phosphor bleed: a cheap four-tap blur added back on top of the sharp
    // sample, so bright glyphs halo the way they do on real glass.
    vec3 bleed = vec3(0.0);
    bleed += texture2D(map, uv + vec2( 0.0018,  0.0)).rgb;
    bleed += texture2D(map, uv + vec2(-0.0018,  0.0)).rgb;
    bleed += texture2D(map, uv + vec2( 0.0,  0.0024)).rgb;
    bleed += texture2D(map, uv + vec2( 0.0, -0.0024)).rgb;
    col += bleed * 0.085;

    // Older rebuilds ran on older glass. Collapsing to luminance and tinting
    // turns this into an amber or a white monochrome monitor, which is a
    // truer way to say "this was three years ago" than a caption would be.
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(lum) * uTint, uMono);

    // Scanlines, locked to the source resolution rather than to screen pixels.
    float line = sin(uv.y * uLines * 3.14159265);
    col *= 0.86 + 0.14 * line * line;

    // A very slow horizontal shimmer, so the thing never looks frozen.
    col *= 1.0 + 0.012 * sin(uv.y * 90.0 + uTime * 1.7);

    // Glass vignette.
    vec2 v = uv * (1.0 - uv.yx);
    col *= pow(clamp(v.x * v.y * 26.0, 0.0, 1.0), 0.22);

    // Power-on: the raster opens vertically out of a bright line.
    float open = smoothstep(0.0, 0.55, uPower);
    float band = 1.0 - smoothstep(0.0, 0.5 * open + 0.001, abs(uv.y - 0.5));
    float flash = (1.0 - open) * band * 2.2;
    col = col * open + vec3(0.65, 1.0, 0.8) * flash;

    gl_FragColor = vec4(col * (0.35 + 0.65 * uPower), 1.0);
  }
`;

export type CrtMaterial = THREE.ShaderMaterial & {
  uniforms: {
    map: { value: THREE.Texture };
    uTime: { value: number };
    uPower: { value: number };
    uLines: { value: number };
    uMono: { value: number };
    uTint: { value: THREE.Color };
  };
};

export function makeCrtMaterial(texture: THREE.Texture, lines: number): CrtMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      uTime: { value: 0 },
      uPower: { value: 0 },
      uLines: { value: lines },
      uMono: { value: 0 },
      uTint: { value: new THREE.Color(1, 1, 1) },
    },
    vertexShader: vert,
    fragmentShader: frag,
    toneMapped: false,
  }) as CrtMaterial;
}
