/** Document model for Handpress. Everything the editor can draw is described here. */

export type BlendMode =
  | "source-over" | "multiply" | "screen" | "overlay" | "darken" | "lighten"
  | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference"
  | "exclusion" | "hue" | "saturation" | "color" | "luminosity";

export const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: "source-over", label: "Normal" },
  { value: "multiply", label: "Multiply" },
  { value: "screen", label: "Screen" },
  { value: "overlay", label: "Overlay" },
  { value: "darken", label: "Darken" },
  { value: "lighten", label: "Lighten" },
  { value: "color-dodge", label: "Color dodge" },
  { value: "color-burn", label: "Color burn" },
  { value: "hard-light", label: "Hard light" },
  { value: "soft-light", label: "Soft light" },
  { value: "difference", label: "Difference" },
  { value: "exclusion", label: "Exclusion" },
  { value: "hue", label: "Hue" },
  { value: "saturation", label: "Saturation" },
  { value: "color", label: "Color" },
  { value: "luminosity", label: "Luminosity" },
];

/* ---------------------------------------------------------------- fills */

export type SolidFill = { kind: "solid"; color: string };

export type GradientFill = {
  kind: "gradient";
  type: "linear" | "radial";
  /** Degrees, clockwise from "points right". Ignored for radial fills. */
  angle: number;
  stops: { offset: number; color: string }[];
};

export type Fill = SolidFill | GradientFill;

export const solid = (color: string): SolidFill => ({ kind: "solid", color });

/* -------------------------------------------------------------- effects */

export type Shadow = {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
};

export const NO_SHADOW: Shadow = {
  enabled: false,
  color: "#000000",
  blur: 12,
  offsetX: 0,
  offsetY: 6,
  opacity: 0.3,
};

/** The eight effects Canva ships, plus an outline and a real extruded 3D. */
export type TextEffectKind =
  | "none" | "shadow" | "lift" | "hollow" | "splice"
  | "echo" | "glitch" | "neon" | "outline" | "extrude";

export type TextEffect = {
  kind: TextEffectKind;
  /** Strength of the effect, 0–100. Meaning varies per effect. */
  intensity: number;
  /** Distance the copies travel, 0–100. */
  offset: number;
  /** Direction in degrees for effects that throw a copy. */
  direction: number;
  /** Blur used by shadow and lift. */
  blur: number;
  /** Transparency of the thrown copy, 0–100. */
  transparency: number;
  /** Secondary colour: shadow tint, splice fill, neon glow, extrude side. */
  color: string;
};

export const DEFAULT_TEXT_EFFECT: TextEffect = {
  kind: "none",
  intensity: 50,
  offset: 50,
  direction: 45,
  blur: 0,
  transparency: 40,
  color: "#f04e23",
};

/* ------------------------------------------------------------ animation */

export type AnimPreset =
  | "none" | "fade" | "rise" | "sink" | "panLeft" | "panRight"
  | "pop" | "zoom" | "blurIn" | "wipe" | "spin" | "flip3d"
  | "bounce" | "drift" | "shake" | "swing" | "typewriter"
  | "breathe" | "flicker" | "roll" | "tectonic" | "stomp";

export type AnimPhase = {
  preset: AnimPreset;
  /** Seconds. */
  duration: number;
  /** Seconds after the timeline starts. */
  delay: number;
  easing: EasingName;
};

export type EasingName =
  | "linear" | "easeOut" | "easeIn" | "easeInOut"
  | "backOut" | "elasticOut" | "bounceOut" | "expoOut";

export type AnimSpec = {
  in: AnimPhase;
  out: AnimPhase;
  /** Runs continuously between the entrance and the exit. */
  loop: { preset: AnimPreset; speed: number };
};

export const NO_ANIM: AnimSpec = {
  in: { preset: "none", duration: 0.7, delay: 0, easing: "easeOut" },
  out: { preset: "none", duration: 0.5, delay: 0, easing: "easeIn" },
  loop: { preset: "none", speed: 1 },
};

/* ---------------------------------------------------------------- layers */

export type LayerType = "text" | "image" | "shape" | "path";

export type BaseLayer = {
  id: string;
  type: LayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  blend: BlendMode;
  shadow: Shadow;
  anim: AnimSpec;
  /** 3D tilt applied through a matrix, in degrees. */
  tiltX: number;
  tiltY: number;
};

export type TextLayer = BaseLayer & {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  uppercase: boolean;
  align: "left" | "center" | "right" | "justify";
  lineHeight: number;
  letterSpacing: number;
  fill: Fill;
  effect: TextEffect;
  /** Bend along an arc. Negative curves the other way. 0 keeps it straight. */
  curve: number;
};

export type ImageFilters = {
  brightness: number;  // -100..100
  contrast: number;    // -100..100
  saturation: number;  // -100..100
  hue: number;         // -180..180
  blur: number;        // 0..40
  noise: number;       // 0..100
  pixelate: number;    // 0..40
  grayscale: number;   // 0..100
  sepia: number;       // 0..100
  invert: number;      // 0..100
  vignette: number;    // 0..100
};

export const NO_FILTERS: ImageFilters = {
  brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0,
  noise: 0, pixelate: 0, grayscale: 0, sepia: 0, invert: 0, vignette: 0,
};

export type ImageLayer = BaseLayer & {
  type: "image";
  src: string;
  /** Kept so the cutout can be undone without a re-upload. */
  originalSrc: string;
  naturalWidth: number;
  naturalHeight: number;
  filters: ImageFilters;
  cornerRadius: number;
  flipX: boolean;
  flipY: boolean;
  /** Fraction of the source kept, 0–1 on each axis. */
  crop: { x: number; y: number; width: number; height: number } | null;
  backgroundRemoved: boolean;
  stroke: string;
  strokeWidth: number;
};

export type ShapeKind =
  | "rect" | "ellipse" | "triangle" | "star" | "polygon" | "line"
  | "arrow" | "heart" | "diamond" | "cross" | "chevron" | "blob"
  | "speech" | "burst" | "ring" | "wave";

export type ShapeLayer = BaseLayer & {
  type: "shape";
  shape: ShapeKind;
  fill: Fill;
  stroke: string;
  strokeWidth: number;
  dash: number[];
  cornerRadius: number;
  /** Point count for star, polygon and burst. */
  sides: number;
  /** Star waist, 0–1. */
  innerRatio: number;
};

export type PathLayer = BaseLayer & {
  type: "path";
  /** SVG path data drawn inside the layer box. */
  d: string;
  fill: Fill;
  stroke: string;
  strokeWidth: number;
  viewBox: number;
};

export type Layer = TextLayer | ImageLayer | ShapeLayer | PathLayer;

/* ------------------------------------------------------------- document */

export type Background =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; gradient: GradientFill }
  | { kind: "image"; src: string; fit: "cover" | "contain" | "tile"; blur: number; dim: number };

export type Doc = {
  id: string;
  name: string;
  width: number;
  height: number;
  background: Background;
  layers: Layer[];
  /** Seconds. Drives the animation timeline and video export. */
  duration: number;
  updatedAt: number;
  createdAt: number;
};

export type Tool = "select" | "hand" | "text" | "rect" | "ellipse" | "line" | "draw";

export type Guide = { axis: "x" | "y"; position: number };
