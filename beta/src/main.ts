import * as THREE from "three";
import { clamp, damp } from "./anim";
import { profile, rebuilds, resume, units as contentUnits, type Rebuild, type Unit } from "./content";
import { CameraRig, type Framing } from "./input/orbit";
import { buildLights } from "./scene/lights";
import { buildMaterials } from "./scene/materials";
import { buildPost } from "./scene/post";
import { DEPTH, FRONT_Z, KVM_Y, RACK_W, buildRack, type RackUnit } from "./scene/rack";
import { buildContactShadow, buildFloor } from "./scene/room";
import { drawDoc, maxScroll, type Doc } from "./screen/doc";
import { makeCrtMaterial } from "./screen/crt";
import {
  POST_SCRIPT,
  aboutDoc,
  bootScript,
  changelogDoc,
  drawCold,
  driveDoc,
  drawGrub,
  drawMenu,
  drawPost,
  helpDoc,
  mistakesDoc,
  resumeDoc,
  serverDoc,
  unitDoc,
  type MenuRow,
  type PostLine,
} from "./screen/screens";
import { TextScreen, pickLayout, type ScreenLayout } from "./screen/textscreen";
import { Sound } from "./audio/synth";
import { Shell, drawShell } from "./screen/shell";
import { visits } from "./visits";

// ---------------------------------------------------------------------------
// Capability gate. The readable page is already in the document; we only take
// it away if we are confident we can put something better in its place.
// ---------------------------------------------------------------------------

const stage = document.getElementById("stage")!;
const bootNote = document.getElementById("boot-note")!;
const hudRight = document.getElementById("hud-right")!;
const hudHint = document.getElementById("hud-hint")!;
const escape = document.getElementById("escape")!;
const pad = document.getElementById("pad")!;
const announce = document.getElementById("announce")!;
const soundButton = document.getElementById("sound") as HTMLButtonElement;
const reason = document.getElementById("fallback-reason");

function webglAvailable(): boolean {
  try {
    const probe = document.createElement("canvas");
    return !!(window.WebGL2RenderingContext && probe.getContext("webgl2"));
  } catch {
    return false;
  }
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Puts a button on the plain page that brings the scene back. */
function offerReturn(onClick: () => void) {
  if (!reason || document.getElementById("back-to-rack")) return;
  const button = document.createElement("button");
  button.id = "back-to-rack";
  button.type = "button";
  button.textContent = "Back to the rack";
  button.style.cssText =
    "margin-top:10px;font:inherit;font-size:13px;color:#7dffb0;background:transparent;border:1px solid #1c2227;border-radius:4px;padding:7px 11px;cursor:pointer";
  button.addEventListener("click", () => {
    button.remove();
    onClick();
  });
  reason.after(button);
}

function stayOnPage(note: string, offerAnyway: boolean) {
  bootNote.remove();
  if (!reason) return;
  reason.textContent = note;
  if (!offerAnyway) return;
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Load the rack anyway";
  button.style.cssText =
    "margin-top:10px;font:inherit;font-size:13px;color:#7dffb0;background:transparent;border:1px solid #1c2227;border-radius:4px;padding:7px 11px;cursor:pointer";
  button.addEventListener("click", () => {
    button.remove();
    reason.textContent = "";
    start();
  });
  reason.after(button);
}

// ---------------------------------------------------------------------------

type Mode = "cold" | "post" | "grub" | "booting" | "menu" | "doc" | "shell";

const FRAMING: Record<Mode, Framing> = {
  cold: { target: new THREE.Vector3(0, 0.6, 0), radius: 2.42, theta: 0.33, phi: 1.5 },
  post: { target: new THREE.Vector3(0, 0.86, 0.02), radius: 1.72, theta: 0.26, phi: 1.47 },
  grub: { target: new THREE.Vector3(0, KVM_Y - 0.03, 0.09), radius: 0.64, theta: 0.16, phi: 1.45 },
  booting: { target: new THREE.Vector3(0, 0.9, 0.04), radius: 1.45, theta: 0.23, phi: 1.47 },
  menu: { target: new THREE.Vector3(0, KVM_Y - 0.052, 0.09), radius: 0.66, theta: 0.17, phi: 1.44 },
  doc: { target: new THREE.Vector3(0, KVM_Y - 0.004, 0.13), radius: 0.4, theta: 0.09, phi: 1.5 },
  shell: { target: new THREE.Vector3(0, KVM_Y - 0.004, 0.13), radius: 0.4, theta: 0.06, phi: 1.52 },
};

const FOV = 32;
const HALF_FOV_TAN = Math.tan((FOV / 2) * (Math.PI / 180));

/** Modes where the display has to be readable, and the panel's half-width. */
const READING: Mode[] = ["grub", "menu", "doc", "shell"];
let screenHalfWidth = 0.11;

/**
 * Solve for the distance at which the display covers a given fraction of the
 * viewport's width, rather than guessing a radius per mode.
 *
 * The vertical field of view is fixed, so the binding constraint is width,
 * and it gets much tighter as the viewport narrows. A laptop can leave the
 * panel at half the frame and still read it; a phone in portrait has to fill
 * almost the whole width, because the same 636 texture pixels have far fewer
 * device pixels to land on.
 */
function fillFraction(aspect: number) {
  return clamp(0.5 + 0.55 * (1.5 - aspect), 0.5, 0.92);
}

function frameFor(mode: Mode): Framing {
  const base = FRAMING[mode];
  if (!READING.includes(mode)) return base;

  const aspect = window.innerWidth / window.innerHeight;
  const fill = fillFraction(aspect);
  const distance = screenHalfWidth / (HALF_FOV_TAN * aspect * fill);

  // The three-quarter angle is what makes this look like a rack rather than a
  // terminal, but it also pushes the panel sideways, and the closer the camera
  // has to get the further off centre it lands. So the view squares up in step
  // with how much of the frame the display has to fill: a laptop keeps the
  // angle, a phone looks at the glass straight on because it cannot spare the
  // width.
  const square = clamp((fill - 0.5) / 0.42, 0, 1);
  const target = base.target.clone();
  target.y += (KVM_Y - target.y) * square;

  return {
    target,
    theta: base.theta * (1 - 0.85 * square),
    phi: base.phi + (Math.PI / 2 - base.phi) * square,
    radius: clamp(distance + (FRONT_Z + 0.0315 - base.target.z), 0.35, 2.6),
  };
}

const SLIDE_OUT = 0.085;
const SLIDE_HOVER = 0.013;
const GRUB_SECONDS = 4;

function start() {
  document.body.classList.add("webgl");

  // ---- renderer -----------------------------------------------------

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  const touch = window.matchMedia("(pointer: coarse)").matches;

  // The display's legibility is a straight function of how many device pixels
  // it lands on, so a phone gets the full ratio to start with and gives it
  // back only if the frame rate says it has to.
  let dpr = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070a);
  scene.fog = new THREE.FogExp2(0x05070a, 0.16);

  const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.05, 40);

  // ---- contents -----------------------------------------------------

  const materials = buildMaterials();
  const rack = buildRack(materials);
  scene.add(rack.group);
  scene.add(buildFloor());
  scene.add(buildContactShadow(RACK_W, DEPTH));

  const lights = buildLights(scene, renderer);

  screenHalfWidth = rack.screenSize.w / 2;

  let layout: ScreenLayout = pickLayout();
  let screen = new TextScreen(layout);
  const crt = makeCrtMaterial(screen.texture, screen.height);
  rack.screen.material = crt;
  drawCold(screen);
  screen.commit();

  const post = buildPost(renderer, scene, camera, {
    w: window.innerWidth,
    h: window.innerHeight,
  });

  const rig = new CameraRig(camera, renderer.domElement, frameFor("cold"));

  // ---- state --------------------------------------------------------

  const visible = contentUnits.filter((u) => !u.secret);
  const menuRows: MenuRow[] = [
    ...visible.map((u) => ({
      label: u.slug.toUpperCase(),
      meta: u.meta,
      group: "units",
      unit: u,
    })),
    { label: "ABOUT", meta: "who is running this", group: "elsewhere", doc: aboutDoc },
    { label: "THE SERVER", meta: "five rebuilds, three operating systems", group: "elsewhere", doc: serverDoc },
    { label: "MISTAKES", meta: "three things I got wrong", group: "elsewhere", doc: mistakesDoc },
    { label: "RÉSUMÉ", meta: "one page, kept current", group: "elsewhere", doc: resumeDoc },
    { label: "CHANGELOG", meta: "what changed here", group: "elsewhere", doc: changelogDoc },
  ];

  let mode: Mode = "cold";
  let selected = 0;
  let doc: Doc | null = null;
  /** Kept so the open document can be rebuilt at a new column width. */
  let docMake: ((cols: number) => Doc) | null = null;
  let scroll = 0;
  let openUnit: Unit | null = null;
  /** The one drive currently pulled out, if any. */
  let pulled: string | null = null;
  let hovered: RackUnit | null = null;
  let hoveringPower = false;

  let script: PostLine[] = POST_SCRIPT;
  let postIndex = 0;
  let postTimer = 0;

  let grubSelected = 0;
  let grubCountdown: number | null = GRUB_SECONDS;
  let booted: Rebuild = rebuilds[0]!;

  const sound = new Sound();
  let shell: Shell | null = null;
  let konami = 0;
  let turbo = 0;
  let poweredAt = 0;
  /** Null until the counter Worker answers, and for good if it never does. */
  let boots: number | null = null;

  let power = 0;
  let caret = 0;
  let clock = 0;
  let fade = 0;

  /** A queued second leg for the camera, so moves can have two beats. */
  let pendingMove: { framing: Framing; duration: number; delay: number } | null = null;

  const bySlug = new Map(rack.units.map((u) => [u.slug, u]));
  const unitBySlug = new Map(contentUnits.map((u) => [u.slug, u]));

  function repaint() {
    switch (mode) {
      case "cold":
        drawCold(screen);
        break;
      case "post":
      case "booting":
        drawPost(screen, script, postIndex, caret < 0.5);
        break;
      case "grub":
        drawGrub(screen, grubSelected, grubCountdown === null ? null : Math.ceil(grubCountdown));
        break;
      case "menu":
        drawMenu(screen, menuRows, selected, booted, boots);
        break;
      case "doc":
        if (doc) drawDoc(screen, doc, scroll);
        break;
      case "shell":
        if (shell) drawShell(screen, shell, caret < 0.5);
        break;
    }
    screen.commit();
  }

  function paintSoundButton() {
    soundButton.setAttribute("aria-pressed", String(!sound.muted));
    soundButton.title = sound.muted ? "Sound is off" : "Sound is on";
    soundButton.innerHTML = `<span aria-hidden="true">\u266a</span> ${sound.muted ? "off" : "on"}`;
  }

  function toggleSound() {
    sound.unlock();
    sound.setMuted(!sound.muted);
    paintSoundButton();
    if (!sound.muted) sound.click();
  }

  soundButton.addEventListener("click", toggleSound);
  paintSoundButton();

  function setMode(next: Mode, duration = 1.0) {
    mode = next;
    rig.goTo(frameFor(next), duration);
    repaint();
    updateHud();
    updatePad();
    say();
  }

  /**
   * Tell a screen reader what the rack is showing. The full content is in the
   * page already (off screen, still in the accessibility tree), so this only
   * has to announce the change.
   */
  function say() {
    const text =
      mode === "shell"
        ? "Shell. Type help for the list of commands."
        : mode === "cold"
        ? "Rack powered down. Press any key to start it."
        : mode === "post"
          ? "Power-on self test running."
          : mode === "grub"
            ? "Boot menu. Five rebuilds to choose between."
            : mode === "booting"
              ? `Booting ${booted.os}.`
              : mode === "menu"
                ? "Main menu."
                : (doc?.title ?? "");
    if (text) announce.textContent = text;
  }

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  function setHint(html: string) {
    hudHint.innerHTML = html;
    hudHint.classList.add("on");
  }

  function updateHud() {
    switch (mode) {
      case "cold":
        hudRight.innerHTML = "Powered down<br /><span style='opacity:.7'>24U · 6 occupied</span>";
        setHint(touch ? "<b>Tap the rack</b> to power it on" : "<b>Click the switch</b> &nbsp;or press any key");
        break;
      case "post":
        hudRight.innerHTML = "Power-on self test<br /><span style='opacity:.7'>rebuild 5 of 5</span>";
        setHint("<b>Esc</b> skip");
        break;
      case "grub":
        hudRight.innerHTML = "Boot menu<br /><span style='opacity:.7'>five rebuilds</span>";
        setHint(
          touch
            ? "Choose a rebuild to boot"
            : "<b>&uarr;&darr;</b> choose a rebuild &nbsp; <b>Enter</b> boot it",
        );
        break;
      case "booting":
        hudRight.innerHTML = `Booting<br /><span style='opacity:.7'>${esc(booted.os)}</span>`;
        setHint("<b>Esc</b> skip");
        break;
      case "menu": {
        const row = menuRows[selected];
        hudRight.innerHTML = `Online &middot; ${esc(booted.os)}<br /><span style='opacity:.7'>${visible.length} units</span>`;
        // On a phone the key names are noise -- there is no keyboard, and
        // the pad is already on screen saying what it does.
        setHint(
          touch
            ? `${row ? esc(row.meta) : ""} &nbsp;&middot;&nbsp; or tap a unit on the rack`
            : `<b>&uarr;&darr;</b> move &nbsp; <b>Enter</b> open &nbsp; <b>?</b> keys${
                row ? ` &nbsp; <b>&bull;</b> ${esc(row.meta)}` : ""
              }`,
        );
        break;
      }
      case "shell":
        hudRight.innerHTML = "Shell<br /><span style='opacity:.7'>type help</span>";
        setHint("<b>exit</b> or <b>Esc</b> to leave &nbsp; <b>Tab</b> completes");
        break;
      case "doc": {
        const scrollable = doc ? maxScroll(doc, screen.rows) > 0 : false;
        hudRight.innerHTML = openUnit
          ? `U${openUnit.u} &middot; ${esc(openUnit.slug)}<br /><span style='opacity:.7'>extended</span>`
          : `${esc(doc?.title ?? "")}<br /><span style='opacity:.7'>&nbsp;</span>`;
        setHint(
          touch
            ? scrollable
              ? "Use the pad to scroll"
              : "&nbsp;"
            : `<b>Esc</b> back${scrollable ? " &nbsp; <b>&uarr;&darr;</b> scroll" : ""}${
                doc?.live ? " &nbsp; <b>O</b> open" : ""
              }${doc?.source ? " &nbsp; <b>S</b> source" : ""}`,
        );
        break;
      }
    }
  }

  // ---- transitions ---------------------------------------------------

  function runScript(next: PostLine[], next_mode: Mode, duration: number) {
    script = next;
    postIndex = 0;
    postTimer = 0;
    setMode(next_mode, duration);
  }

  function powerOn() {
    if (mode !== "cold") return;
    // Counted on power-on rather than page load, so a bounce is not a boot.
    void visits().then((count) => {
      boots = count;
      if (mode === "menu") repaint();
    });
    // The only reliable moment to start an AudioContext is inside the gesture
    // that asked for it, and this is that gesture.
    sound.unlock();
    sound.clunk();
    poweredAt = performance.now();
    runScript(POST_SCRIPT, "post", 1.6);
    window.setTimeout(() => sound.beep(), 420);
  }

  function toGrub() {
    grubSelected = 0;
    grubCountdown = GRUB_SECONDS;
    setMode("grub", 1.1);
  }

  function boot(index: number) {
    booted = rebuilds[index] ?? rebuilds[0]!;

    // Older rebuilds ran on older glass. The display changes to match, and
    // so does what it spills onto the rack below it.
    crt.uniforms.uMono.value = booted.display.mono;
    crt.uniforms.uTint.value.setHex(booted.display.tint);
    lights.screenGlow.color.setHex(booted.display.glow);

    sound.click();
    runScript(bootScript(booted), "booting", 0.9);
  }

  function openDoc(make: (cols: number) => Doc, unit: Unit | null) {
    docMake = make;
    doc = make(screen.cols);
    scroll = 0;
    openUnit = unit;
    rig.resetZoom();

    // Two beats: push in on the unit as it comes out of the rack, then lift
    // to the display. Going straight to the screen hides the one bit of
    // motion that explains what just happened.
    sound.click();
    const rackUnit = unit ? bySlug.get(unit.slug) : null;
    if (rackUnit) {
      sound.whirr();
      mode = "doc";
      rig.goTo(
        {
          target: new THREE.Vector3(0, rackUnit.group.position.y, 0.1),
          radius: 0.62,
          theta: 0.26,
          phi: 1.56,
        },
        0.5,
      );
      pendingMove = { framing: frameFor("doc"), duration: 0.8, delay: 0.42 };
      repaint();
      updateHud();
    } else {
      setMode("doc", 0.85);
    }
  }

  function openRow(index: number) {
    selected = clamp(index, 0, menuRows.length - 1);
    const row = menuRows[selected];
    if (!row) return;
    if (row.unit) openDoc((cols) => unitDoc(row.unit!, cols), row.unit);
    else if (row.doc) openDoc(row.doc, null);
  }

  function openSlug(slug: string) {
    const unit = unitBySlug.get(slug);
    if (!unit) return;
    const index = menuRows.findIndex((r) => r.unit?.slug === slug);
    if (index >= 0) selected = index;
    openDoc((cols) => unitDoc(unit, cols), unit);
  }

  function back() {
    if (mode === "shell") {
      shell = null;
      sound.click();
      setMode("menu", 0.6);
      return;
    }
    if (mode !== "doc") return;
    if (pulled) {
      // One escape reseats the drive; the next closes the unit.
      pulled = null;
      sound.clunk();
      if (openUnit) {
        openDoc((cols) => unitDoc(openUnit!, cols), openUnit);
        return;
      }
    }
    if (openUnit) sound.whirr(0.34);
    else sound.click();
    doc = null;
    docMake = null;
    openUnit = null;
    pendingMove = null;
    setMode("menu", 0.85);
  }

  function pullDrive(slug: string) {
    const unit = unitBySlug.get(slug);
    if (!unit) return;
    pulled = slug;
    sound.clunk();
    sound.whirr(0.3);
    openDoc((cols) => driveDoc(unit, cols), unit);
  }

  function openShell() {
    shell = new Shell(
      {
        booted,
        uptime: () => (performance.now() - poweredAt) / 1000,
        exit: () => back(),
        open: (slug) => window.setTimeout(() => openSlug(slug), 260),
      },
      screen.cols - 6,
    );
    doc = null;
    docMake = null;
    openUnit = null;
    rig.resetZoom();
    sound.click();
    setMode("shell", 0.7);
  }

  function scrollBy(delta: number) {
    if (!doc) return;
    const next = clamp(scroll + delta, 0, maxScroll(doc, screen.rows));
    if (next === scroll) return;
    scroll = next;
    repaint();
  }

  // ---- input ---------------------------------------------------------

  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hitTargets: THREE.Object3D[] = [
    ...rack.units.flatMap((u) => [u.driveHit, u.hit]),
    rack.power.mesh,
  ];

  function pick(ev: PointerEvent) {
    pointer.x = (ev.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(ev.clientY / window.innerHeight) * 2 + 1;
    ray.setFromCamera(pointer, camera);
    return ray.intersectObjects(hitTargets, false)[0]?.object ?? null;
  }

  renderer.domElement.addEventListener("pointermove", (ev) => {
    const hit = pick(ev);
    hoveringPower = !!hit?.userData.power && mode === "cold";
    const slug = hit?.userData.slug as string | undefined;
    hovered = slug ? (bySlug.get(slug) ?? null) : null;
    renderer.domElement.style.cursor = hit ? "pointer" : "grab";
  });

  let downX = 0;
  let downY = 0;
  renderer.domElement.addEventListener("pointerdown", (ev) => {
    downX = ev.clientX;
    downY = ev.clientY;
  });

  renderer.domElement.addEventListener("pointerup", (ev) => {
    if (Math.hypot(ev.clientX - downX, ev.clientY - downY) > 6) return; // a drag, not a click
    const hit = pick(ev);
    if (!hit) return;
    if (hit.userData.power) {
      powerOn();
      return;
    }
    if (mode === "cold") {
      powerOn();
      return;
    }

    // A drive only answers once its unit is out of the rack, so nobody finds
    // this before they have found the unit it belongs to.
    const bay = hit.userData.bay as string | undefined;
    if (bay && openUnit?.slug === bay) {
      pullDrive(bay);
      return;
    }

    const slug = (hit.userData.slug ?? hit.userData.bay) as string | undefined;
    if (slug && (mode === "menu" || mode === "doc")) openSlug(slug);
  });

  const openTab = (url: string) => window.open(url, "_blank", "noopener");

  window.addEventListener("keydown", (ev) => {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;

    if (mode === "cold") {
      powerOn();
      ev.preventDefault();
      return;
    }

    // While text is scrolling past, any key skips to the end of it.
    if (mode === "post" || mode === "booting") {
      postIndex = script.length;
      postTimer = 0;
      repaint();
      return;
    }

    if (mode === "grub") {
      switch (ev.key) {
        case "ArrowDown":
        case "s":
        case "j":
          sound.blip();
          grubCountdown = null;
          grubSelected = (grubSelected + 1) % rebuilds.length;
          repaint();
          ev.preventDefault();
          break;
        case "ArrowUp":
        case "w":
        case "k":
          sound.blip();
          grubCountdown = null;
          grubSelected = (grubSelected - 1 + rebuilds.length) % rebuilds.length;
          repaint();
          ev.preventDefault();
          break;
        case "Enter":
          boot(grubSelected);
          break;
      }
      return;
    }

    // Shell mode eats almost everything, because it is a text field.
    if (mode === "shell" && shell) {
      if (ev.key === "Escape") {
        back();
      } else if (ev.key === "Enter") {
        shell.submit();
        sound.blip();
      } else if (ev.key === "Backspace") {
        shell.input = shell.input.slice(0, -1);
      } else if (ev.key === "Tab") {
        shell.complete();
      } else if (ev.key === "ArrowUp") {
        shell.recall(-1);
      } else if (ev.key === "ArrowDown") {
        shell.recall(1);
      } else if (ev.key.length === 1) {
        shell.input += ev.key;
      } else {
        return;
      }
      repaint();
      ev.preventDefault();
      return;
    }

    // Up up down down left right left right B A.
    const KONAMI = [
      "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
      "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
    ];
    konami = ev.key === KONAMI[konami] ? konami + 1 : ev.key === KONAMI[0] ? 1 : 0;
    if (konami === KONAMI.length) {
      konami = 0;
      turbo = 6;
      sound.fanfare();
      announce.textContent = "Every fan to maximum.";
    }

    if (ev.key === "m") {
      toggleSound();
      return;
    }

    if (ev.key === "~" || ev.key === "`") {
      if (mode === "menu" || mode === "doc") openShell();
      ev.preventDefault();
      return;
    }

    if (ev.key === "?") {
      if (mode === "doc" && doc?.tag === " help") back();
      else openDoc(helpDoc, null);
      ev.preventDefault();
      return;
    }

    if (ev.key === "Escape" || ev.key === "Backspace") {
      back();
      ev.preventDefault();
      return;
    }

    if (mode === "menu") {
      switch (ev.key) {
        case "ArrowDown":
        case "s":
        case "j":
          selected = (selected + 1) % menuRows.length;
          repaint();
          updateHud();
          announce.textContent = menuRows[selected]?.label ?? "";
          sound.blip();
          ev.preventDefault();
          break;
        case "ArrowUp":
        case "w":
        case "k":
          selected = (selected - 1 + menuRows.length) % menuRows.length;
          repaint();
          updateHud();
          announce.textContent = menuRows[selected]?.label ?? "";
          sound.blip();
          ev.preventDefault();
          break;
        case "Home":
          selected = 0;
          repaint();
          updateHud();
          break;
        case "End":
          selected = menuRows.length - 1;
          repaint();
          updateHud();
          break;
        case "Enter":
          openRow(selected);
          break;
      }
      return;
    }

    // Reading a document.
    switch (ev.key) {
      case "ArrowDown":
      case "j":
        scrollBy(1);
        ev.preventDefault();
        break;
      case "ArrowUp":
      case "k":
        scrollBy(-1);
        ev.preventDefault();
        break;
      case "PageDown":
      case " ":
        scrollBy(12);
        ev.preventDefault();
        break;
      case "PageUp":
        scrollBy(-12);
        ev.preventDefault();
        break;
      case "Home":
        scrollBy(-9999);
        break;
      case "End":
        scrollBy(9999);
        break;
      case "o":
        if (doc?.live) openTab(doc.live);
        break;
      case "s":
        if (doc?.source) openTab(doc.source);
        break;
      case "d":
        openTab(resume.href);
        break;
      case "e":
        window.location.href = `mailto:${profile.email}`;
        break;
      case "g":
        openTab(profile.github);
        break;
    }
  });

  // The pad replays its button as the key it stands for, so there is exactly
  // one place that decides what a key does.
  if (touch) {
    pad.addEventListener("click", (ev) => {
      const key = (ev.target as HTMLElement).closest("button")?.dataset.key;
      if (key) window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    });
  }

  function updatePad() {
    pad.hidden = !touch || mode === "cold" || mode === "post" || mode === "booting";
  }

  // Dropping to the plain page should not be a one-way door.
  escape.addEventListener("click", (ev) => {
    ev.preventDefault();
    document.body.classList.remove("webgl");
    running = false;
    offerReturn(() => {
      document.body.classList.add("webgl");
      running = true;
      last = performance.now();
      rig.goTo(frameFor(mode), 0.01);
      requestAnimationFrame(frame);
    });
  });

  window.addEventListener("resize", () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    post.resize(w, h);

    // Crossing between the two grids -- rotating a tablet, or dragging a
    // window narrow -- rebuilds the display at the other size, and the open
    // document is re-wrapped to the new column width.
    const next = pickLayout();
    if (next !== layout) {
      layout = next;
      const old = screen;
      screen = new TextScreen(layout);
      crt.uniforms.map.value = screen.texture;
      crt.uniforms.uLines.value = screen.height;
      old.dispose();
      if (docMake) {
        doc = docMake(screen.cols);
        scroll = clamp(scroll, 0, maxScroll(doc, screen.rows));
      }
    }

    repaint();
    updateHud();
    rig.goTo(frameFor(mode), 0.35);
  });

  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden && document.body.classList.contains("webgl");
    if (running) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });

  // ---- loop -----------------------------------------------------------

  let last = performance.now();
  let warmed = false;
  let perfFrames = 0;
  let perfTime = 0;

  // Development only: /beta/ in dev exposes this so the performance pass has
  // real numbers instead of guesses. It is stripped from the production build.
  const stats = { frames: 0, calls: 0, tris: 0 };
  if (import.meta.env.DEV) {
    // Each post pass resets the counter, so let it accumulate across the
    // whole frame instead and reset it by hand.
    renderer.info.autoReset = false;
    (window as unknown as { __rack: unknown }).__rack = { renderer, scene, stats, rack };
  }

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;

    if (import.meta.env.DEV) renderer.info.reset();

    // If the machine cannot hold a reasonable frame rate, hand back
    // resolution rather than dropping frames. Checked over a two second
    // window so a single slow frame never triggers it.
    perfFrames++;
    perfTime += dt;
    if (perfTime >= 2) {
      const fps = perfFrames / perfTime;
      if (fps < 45 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.25);
        renderer.setPixelRatio(dpr);
        post.resize(window.innerWidth, window.innerHeight);
      }
      perfFrames = 0;
      perfTime = 0;
    }

    if (pendingMove) {
      pendingMove.delay -= dt;
      if (pendingMove.delay <= 0) {
        rig.goTo(pendingMove.framing, pendingMove.duration);
        pendingMove = null;
      }
    }

    // The scripts advance on their own clock so they pause with the tab.
    if (mode === "post" || mode === "booting") {
      postTimer -= dt * 1000;
      while (postTimer <= 0 && postIndex < script.length) {
        // The bay lines are the ones that get a tick, because those are the
        // ones whose LED comes up at the same moment.
        if (mode === "post" && postIndex >= 7 && postIndex <= 11) sound.tick();
        postTimer += script[postIndex]!.delay;
        postIndex++;
        repaint();
      }
      if (postIndex >= script.length && postTimer <= -500) {
        if (mode === "post") toGrub();
        else {
          sound.chime();
          setMode("menu", 1.2);
        }
      }

      const was = caret;
      caret = (clock * 1.8) % 1;
      if ((was < 0.5) !== (caret < 0.5)) repaint();
    }

    if (mode === "shell") {
      const was = caret;
      caret = (clock * 1.6) % 1;
      if ((was < 0.5) !== (caret < 0.5)) repaint();
    }

    if (mode === "grub" && grubCountdown !== null) {
      const before = Math.ceil(grubCountdown);
      grubCountdown -= dt;
      if (grubCountdown <= 0) boot(grubSelected);
      else if (Math.ceil(grubCountdown) !== before) repaint();
    }

    // Power ramp: the display, its spill, and the switch glow.
    const wantPower = mode === "cold" ? 0 : 1;
    power = damp(power, wantPower, 2.6, dt);
    crt.uniforms.uPower.value = power;
    crt.uniforms.uTime.value = clock;
    lights.setPower(power);
    rack.power.material.emissiveIntensity =
      mode === "cold" ? 0.3 + (hoveringPower ? 0.5 : 0) + Math.sin(clock * 2.2) * 0.12 : 1.4;
    rack.power.lever.rotation.x = damp(rack.power.lever.rotation.x, mode === "cold" ? -0.26 : 0.26, 7, dt);

    // Unit LEDs come up as the POST finds each bay.
    rack.units.forEach((unit, i) => {
      const found = mode === "cold" ? false : mode === "post" ? postIndex >= 7 + i : true;
      unit.leds.forEach((mat, j) => {
        const state = unit.ledStates[j]!;
        if (state === "dark") return;
        const base =
          turbo > 0
            ? 3.2
            : state === "busy"
              ? 1.5 + Math.sin(clock * 5.5 + i) * 0.5
              : state === "idle"
                ? 0.5
                : 1.25;
        mat.emissiveIntensity = damp(mat.emissiveIntensity, found ? base : 0, 9, dt);
      });
    });

    // Sliding. The open unit comes all the way out; a hovered one peeks.
    for (const unit of rack.units) {
      const isOpen = mode === "doc" && openUnit?.slug === unit.slug;
      const target = isOpen ? SLIDE_OUT : hovered === unit && mode !== "cold" ? SLIDE_HOVER : 0;
      unit.slide = damp(unit.slide, target, 7, dt);
      unit.group.position.z = unit.slide;

      unit.driveOut = damp(unit.driveOut, pulled === unit.slug ? 1 : 0, 8, dt);
      unit.drive.position.z = unit.driveOut * 0.07;
    }

    // The hover key light tracks whatever is under the cursor.
    if (hovered) {
      lights.unitKey.position.set(0.1, hovered.group.position.y, FRONT_Z + 0.16);
      lights.unitKey.intensity = damp(lights.unitKey.intensity, 0.5 * power, 8, dt);
    } else {
      lights.unitKey.intensity = damp(lights.unitKey.intensity, 0, 8, dt);
    }

    if (turbo > 0) turbo = Math.max(0, turbo - dt);
    const rush = turbo > 0 ? 4.5 : 1;
    for (const rotor of rack.fans) rotor.rotation.z += dt * (6 + 10 * power) * rush;

    sound.setHum(power * (turbo > 0 ? 2.4 : 1));
    post.bloom.strength = damp(post.bloom.strength, turbo > 0 ? 1.5 : 0.62, 4, dt);

    rig.update(dt);

    fade = damp(fade, 1, 1.6, dt);
    post.grade.uniforms.uFade.value = fade;
    post.grade.uniforms.uTime.value = clock;

    post.composer.render();

    if (import.meta.env.DEV) {
      stats.frames++;
      stats.calls = renderer.info.render.calls;
      stats.tris = renderer.info.render.triangles;
    }

    if (!warmed) {
      warmed = true;
      bootNote.classList.add("gone");
      setTimeout(() => bootNote.remove(), 800);
      updateHud();
      updatePad();
      say();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// Called last, so every declaration above it is initialised.
if (!webglAvailable()) {
  stayOnPage("Your browser could not start WebGL, so this is the plain version.", false);
} else if (prefersReducedMotion) {
  stayOnPage(
    "You have reduced motion turned on, so this is the plain version. The rack moves a lot.",
    true,
  );
} else {
  start();
}
