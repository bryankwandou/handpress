import type { AnimPreset, AnimSpec, EasingName, Layer } from "./types";

/** What an animation resolves to at one instant. Applied on top of layer state. */
export type AnimState = {
  opacity: number;
  dx: number;
  dy: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  /** Extra blur in pixels, on top of any filter blur. */
  blur: number;
  /** Fake Y-axis rotation, expressed as a horizontal squash plus a skew. */
  skewY: number;
  /** 0–1 reveal used by wipe and typewriter. 1 means fully shown. */
  reveal: number;
};

export const IDENTITY: AnimState = {
  opacity: 1, dx: 0, dy: 0, scaleX: 1, scaleY: 1,
  rotation: 0, blur: 0, skewY: 0, reveal: 1,
};

/* --------------------------------------------------------------- easing */

const EASINGS: Record<EasingName, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t * t,
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  expoOut: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  backOut: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  elasticOut: (t) => {
    if (t === 0 || t === 1) return t;
    const p = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * p) + 1;
  },
  bounceOut: (t) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

export const EASING_NAMES: EasingName[] = [
  "linear", "easeOut", "easeIn", "easeInOut", "expoOut", "backOut", "elasticOut", "bounceOut",
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ----------------------------------------------------------- entry pose */

/**
 * The pose a preset starts from, expressed as a delta against the resting
 * layer. Progress 0 means fully at that pose; progress 1 means resting.
 */
function poseFor(preset: AnimPreset, layer: Layer): Partial<AnimState> {
  const w = Math.max(layer.width, 1);
  const h = Math.max(layer.height, 1);

  switch (preset) {
    case "fade": return { opacity: 0 };
    case "rise": return { opacity: 0, dy: h * 0.45 + 40 };
    case "sink": return { opacity: 0, dy: -(h * 0.45 + 40) };
    case "panLeft": return { opacity: 0, dx: w * 0.6 + 120 };
    case "panRight": return { opacity: 0, dx: -(w * 0.6 + 120) };
    case "pop": return { opacity: 0, scaleX: 0.4, scaleY: 0.4 };
    case "zoom": return { opacity: 0, scaleX: 0.05, scaleY: 0.05 };
    case "blurIn": return { opacity: 0, blur: 26, scaleX: 1.14, scaleY: 1.14 };
    case "wipe": return { reveal: 0 };
    case "spin": return { opacity: 0, rotation: -270, scaleX: 0.3, scaleY: 0.3 };
    case "flip3d": return { opacity: 0, skewY: 88 };
    case "bounce": return { opacity: 0, dy: -(h + 220) };
    case "drift": return { opacity: 0, dx: -70, dy: 70, scaleX: 1.1, scaleY: 1.1 };
    case "tectonic": return { opacity: 0, dx: -(w * 0.35), scaleX: 1.35, scaleY: 1.35 };
    case "stomp": return { opacity: 0, scaleX: 3.2, scaleY: 3.2 };
    case "roll": return { opacity: 0, dx: -(w + 160), rotation: -360 };
    case "typewriter": return { reveal: 0 };
    default: return {};
  }
}

/** Presets that read better with a spring-flavoured curve than a plain one. */
const IMPLIED_EASING: Partial<Record<AnimPreset, EasingName>> = {
  pop: "backOut",
  bounce: "bounceOut",
  stomp: "expoOut",
  tectonic: "expoOut",
  spin: "backOut",
};

function applyPose(pose: Partial<AnimState>, progress: number): AnimState {
  const p = clamp01(progress);
  return {
    opacity: lerp(pose.opacity ?? 1, 1, p),
    dx: lerp(pose.dx ?? 0, 0, p),
    dy: lerp(pose.dy ?? 0, 0, p),
    scaleX: lerp(pose.scaleX ?? 1, 1, p),
    scaleY: lerp(pose.scaleY ?? 1, 1, p),
    rotation: lerp(pose.rotation ?? 0, 0, p),
    blur: lerp(pose.blur ?? 0, 0, p),
    skewY: lerp(pose.skewY ?? 0, 0, p),
    reveal: lerp(pose.reveal ?? 1, 1, p),
  };
}

/* ------------------------------------------------------------- loop pose */

function loopState(preset: AnimPreset, t: number, speed: number, layer: Layer): Partial<AnimState> {
  const s = Math.max(speed, 0.05);
  const phase = t * s;

  switch (preset) {
    case "breathe": {
      const k = 1 + Math.sin(phase * Math.PI) * 0.035;
      return { scaleX: k, scaleY: k };
    }
    case "shake":
      return { dx: Math.sin(phase * Math.PI * 6) * 5, rotation: Math.sin(phase * Math.PI * 6) * 1.1 };
    case "swing":
      return { rotation: Math.sin(phase * Math.PI) * 5 };
    case "drift":
      return {
        dx: Math.sin(phase * Math.PI * 0.8) * (layer.width * 0.02 + 8),
        dy: Math.cos(phase * Math.PI * 0.6) * (layer.height * 0.02 + 8),
      };
    case "flicker": {
      const n = Math.sin(phase * 21.3) * Math.sin(phase * 7.7) * Math.sin(phase * 3.1);
      return { opacity: 0.72 + Math.abs(n) * 0.28 };
    }
    case "spin":
      return { rotation: (phase * 90) % 360 };
    default:
      return {};
  }
}

function merge(base: AnimState, extra: Partial<AnimState>): AnimState {
  return {
    opacity: base.opacity * (extra.opacity ?? 1),
    dx: base.dx + (extra.dx ?? 0),
    dy: base.dy + (extra.dy ?? 0),
    scaleX: base.scaleX * (extra.scaleX ?? 1),
    scaleY: base.scaleY * (extra.scaleY ?? 1),
    rotation: base.rotation + (extra.rotation ?? 0),
    blur: base.blur + (extra.blur ?? 0),
    skewY: base.skewY + (extra.skewY ?? 0),
    reveal: Math.min(base.reveal, extra.reveal ?? 1),
  };
}

/* -------------------------------------------------------------- sampler */

/**
 * Resolve a layer's animation at time `t` on a timeline of `total` seconds.
 * Pure and deterministic, so the live preview and the exported frames agree.
 */
export function sampleAnim(spec: AnimSpec, layer: Layer, t: number, total: number): AnimState {
  let state: AnimState = { ...IDENTITY };

  // Entrance
  if (spec.in.preset !== "none") {
    const start = spec.in.delay;
    const end = start + Math.max(spec.in.duration, 0.001);
    if (t < start) {
      state = applyPose(poseFor(spec.in.preset, layer), 0);
    } else if (t < end) {
      const raw = (t - start) / (end - start);
      const ease = EASINGS[IMPLIED_EASING[spec.in.preset] ?? spec.in.easing];
      state = applyPose(poseFor(spec.in.preset, layer), ease(raw));
    }
  }

  // Exit, measured backwards from the end of the timeline
  if (spec.out.preset !== "none") {
    const end = total - spec.out.delay;
    const start = end - Math.max(spec.out.duration, 0.001);
    if (t >= end) {
      state = applyPose(poseFor(spec.out.preset, layer), 0);
    } else if (t > start) {
      const raw = 1 - (t - start) / (end - start);
      const ease = EASINGS[spec.out.easing];
      state = applyPose(poseFor(spec.out.preset, layer), ease(raw));
    }
  }

  // Idle motion, only once the entrance has finished
  if (spec.loop.preset !== "none" && t >= spec.in.delay + spec.in.duration) {
    state = merge(state, loopState(spec.loop.preset, t, spec.loop.speed, layer));
  }

  return state;
}

/** True when nothing on the board moves, so export can skip the video path. */
export function docIsStatic(layers: Layer[]): boolean {
  return layers.every(
    (l) => l.anim.in.preset === "none" && l.anim.out.preset === "none" && l.anim.loop.preset === "none",
  );
}

/** Longest point any layer is still busy — used to suggest a timeline length. */
export function suggestedDuration(layers: Layer[]): number {
  let longest = 0;
  for (const l of layers) {
    if (l.anim.in.preset !== "none") longest = Math.max(longest, l.anim.in.delay + l.anim.in.duration);
    if (l.anim.out.preset !== "none") longest = Math.max(longest, l.anim.out.delay + l.anim.out.duration);
  }
  return Math.max(3, Math.ceil(longest + 1));
}
