import type { AnimPreset, GradientFill, ShapeKind } from "./types";

/* ------------------------------------------------------- canvas presets */

export type SizePreset = {
  id: string;
  label: string;
  width: number;
  height: number;
  group: string;
  note?: string;
};

export const SIZE_PRESETS: SizePreset[] = [
  { id: "ig-post", label: "Instagram post", width: 1080, height: 1080, group: "Social" },
  { id: "ig-story", label: "Instagram story", width: 1080, height: 1920, group: "Social" },
  { id: "ig-portrait", label: "Instagram portrait", width: 1080, height: 1350, group: "Social" },
  { id: "tiktok", label: "TikTok / Reels", width: 1080, height: 1920, group: "Social" },
  { id: "fb-post", label: "Facebook post", width: 1200, height: 630, group: "Social" },
  { id: "fb-cover", label: "Facebook cover", width: 1640, height: 924, group: "Social" },
  { id: "x-post", label: "X post", width: 1600, height: 900, group: "Social" },
  { id: "li-post", label: "LinkedIn post", width: 1200, height: 1200, group: "Social" },
  { id: "yt-thumb", label: "YouTube thumbnail", width: 1280, height: 720, group: "Social" },
  { id: "pin", label: "Pinterest pin", width: 1000, height: 1500, group: "Social" },
  { id: "wa-status", label: "WhatsApp status", width: 1080, height: 1920, group: "Social" },

  { id: "a4-p", label: "A4 portrait", width: 2480, height: 3508, group: "Print", note: "300 dpi" },
  { id: "a4-l", label: "A4 landscape", width: 3508, height: 2480, group: "Print", note: "300 dpi" },
  { id: "a5-p", label: "A5 flyer", width: 1748, height: 2480, group: "Print", note: "300 dpi" },
  { id: "a3-p", label: "A3 poster", width: 3508, height: 4961, group: "Print", note: "300 dpi" },
  { id: "letter", label: "US Letter", width: 2550, height: 3300, group: "Print", note: "300 dpi" },
  { id: "dl", label: "DL flyer", width: 1299, height: 2598, group: "Print", note: "300 dpi" },
  { id: "card", label: "Business card", width: 1050, height: 600, group: "Print", note: "300 dpi" },
  { id: "banner-x", label: "Roll-up banner", width: 2362, height: 5906, group: "Print", note: "150 dpi" },

  { id: "slide-16-9", label: "Presentation 16:9", width: 1920, height: 1080, group: "Screen" },
  { id: "slide-4-3", label: "Presentation 4:3", width: 1600, height: 1200, group: "Screen" },
  { id: "desktop", label: "Desktop wallpaper", width: 2560, height: 1440, group: "Screen" },
  { id: "phone", label: "Phone wallpaper", width: 1170, height: 2532, group: "Screen" },
  { id: "email", label: "Email header", width: 1200, height: 400, group: "Screen" },
  { id: "square-sm", label: "Logo canvas", width: 800, height: 800, group: "Screen" },
];

/* ---------------------------------------------------------------- fonts */

/** Loaded through next/font so they work with no network once cached. */
export type FontDef = { family: string; label: string; weights: number[]; category: string };

export const FONTS: FontDef[] = [
  { family: "var(--font-inter)", label: "Inter", weights: [300, 400, 500, 600, 700, 800, 900], category: "Sans" },
  { family: "var(--font-bricolage)", label: "Bricolage Grotesque", weights: [300, 400, 500, 600, 700, 800], category: "Display" },
  { family: "var(--font-jetbrains)", label: "JetBrains Mono", weights: [400, 500, 600, 700, 800], category: "Mono" },
  { family: "var(--font-playfair)", label: "Playfair Display", weights: [400, 500, 600, 700, 800, 900], category: "Serif" },
  { family: "var(--font-archivo)", label: "Archivo Black", weights: [400], category: "Display" },
  { family: "var(--font-anton)", label: "Anton", weights: [400], category: "Display" },
  { family: "var(--font-bebas)", label: "Bebas Neue", weights: [400], category: "Display" },
  { family: "var(--font-dmserif)", label: "DM Serif Display", weights: [400], category: "Serif" },
  { family: "var(--font-lora)", label: "Lora", weights: [400, 500, 600, 700], category: "Serif" },
  { family: "var(--font-poppins)", label: "Poppins", weights: [300, 400, 500, 600, 700, 800, 900], category: "Sans" },
  { family: "var(--font-outfit)", label: "Outfit", weights: [300, 400, 500, 600, 700, 800, 900], category: "Sans" },
  { family: "var(--font-caveat)", label: "Caveat", weights: [400, 500, 600, 700], category: "Handwriting" },
  { family: "var(--font-pacifico)", label: "Pacifico", weights: [400], category: "Handwriting" },
  { family: "var(--font-righteous)", label: "Righteous", weights: [400], category: "Display" },
  { family: "var(--font-spacegrotesk)", label: "Space Grotesk", weights: [300, 400, 500, 600, 700], category: "Sans" },
  { family: "var(--font-syne)", label: "Syne", weights: [400, 500, 600, 700, 800], category: "Display" },
];

/* -------------------------------------------------------------- palette */

export const SWATCHES: { name: string; colors: string[] }[] = [
  {
    name: "Press",
    colors: ["#0b0a08", "#14120e", "#3d382e", "#7a7263", "#c8c0b0", "#faf7f0", "#ffffff", "#f04e23", "#ff7a55", "#34659e"],
  },
  {
    name: "Risograph",
    colors: ["#ff48b0", "#ffe800", "#00a95c", "#3d5588", "#ff6c2f", "#765ba7", "#f65058", "#00838a", "#e45d50", "#0f1626"],
  },
  {
    name: "Muted earth",
    colors: ["#3c3129", "#6f5b4a", "#a3866a", "#c9a227", "#7c8c54", "#4a6455", "#2f4858", "#d9c9b0", "#e8dfd0", "#8c4a3f"],
  },
  {
    name: "Neon night",
    colors: ["#05010f", "#150c2e", "#7b2cff", "#c026d3", "#ff2d95", "#00e5ff", "#00ffa3", "#fff200", "#ff5c00", "#f5f3ff"],
  },
  {
    name: "Coastal",
    colors: ["#04283c", "#0a4f6e", "#1287a8", "#4fc0c9", "#a8e6cf", "#f8f4e3", "#ffd3b6", "#ffaaa5", "#ff8b94", "#2d3142"],
  },
];

export const GRADIENT_PRESETS: { name: string; gradient: GradientFill }[] = [
  { name: "Sunset press", gradient: { kind: "gradient", type: "linear", angle: 135, stops: [{ offset: 0, color: "#f04e23" }, { offset: 1, color: "#ffd166" }] } },
  { name: "Deep ink", gradient: { kind: "gradient", type: "linear", angle: 160, stops: [{ offset: 0, color: "#14120e" }, { offset: 1, color: "#34659e" }] } },
  { name: "Ultraviolet", gradient: { kind: "gradient", type: "linear", angle: 120, stops: [{ offset: 0, color: "#7b2cff" }, { offset: 0.55, color: "#c026d3" }, { offset: 1, color: "#ff2d95" }] } },
  { name: "Mint wash", gradient: { kind: "gradient", type: "linear", angle: 90, stops: [{ offset: 0, color: "#a8e6cf" }, { offset: 1, color: "#1287a8" }] } },
  { name: "Paper glow", gradient: { kind: "gradient", type: "radial", angle: 0, stops: [{ offset: 0, color: "#ffffff" }, { offset: 1, color: "#e6dfd0" }] } },
  { name: "Ember", gradient: { kind: "gradient", type: "radial", angle: 0, stops: [{ offset: 0, color: "#ff7a55" }, { offset: 1, color: "#ad2f0f" }] } },
  { name: "Cold steel", gradient: { kind: "gradient", type: "linear", angle: 45, stops: [{ offset: 0, color: "#c8c0b0" }, { offset: 0.5, color: "#7a7263" }, { offset: 1, color: "#2a261f" }] } },
  { name: "Citrus", gradient: { kind: "gradient", type: "linear", angle: 200, stops: [{ offset: 0, color: "#ffe800" }, { offset: 1, color: "#00a95c" }] } },
];

/* --------------------------------------------------------------- shapes */

export const SHAPE_LIST: { kind: ShapeKind; label: string }[] = [
  { kind: "rect", label: "Rectangle" },
  { kind: "ellipse", label: "Ellipse" },
  { kind: "triangle", label: "Triangle" },
  { kind: "diamond", label: "Diamond" },
  { kind: "polygon", label: "Polygon" },
  { kind: "star", label: "Star" },
  { kind: "burst", label: "Burst" },
  { kind: "heart", label: "Heart" },
  { kind: "cross", label: "Cross" },
  { kind: "chevron", label: "Chevron" },
  { kind: "arrow", label: "Arrow" },
  { kind: "line", label: "Line" },
  { kind: "ring", label: "Ring" },
  { kind: "blob", label: "Blob" },
  { kind: "speech", label: "Speech bubble" },
  { kind: "wave", label: "Wave" },
];

/* ------------------------------------------------------------ animation */

export const ANIM_PRESETS: { value: AnimPreset; label: string; hint: string }[] = [
  { value: "none", label: "None", hint: "Sits still" },
  { value: "fade", label: "Fade", hint: "Opacity only" },
  { value: "rise", label: "Rise", hint: "Lifts from below" },
  { value: "sink", label: "Sink", hint: "Drops from above" },
  { value: "panLeft", label: "Pan left", hint: "Slides in from the right" },
  { value: "panRight", label: "Pan right", hint: "Slides in from the left" },
  { value: "pop", label: "Pop", hint: "Overshoots then settles" },
  { value: "zoom", label: "Zoom", hint: "Scales up from the centre" },
  { value: "blurIn", label: "Blur in", hint: "Focus pull" },
  { value: "wipe", label: "Wipe", hint: "Reveals left to right" },
  { value: "spin", label: "Spin", hint: "Full turn on entry" },
  { value: "flip3d", label: "Flip 3D", hint: "Rotates on the Y axis" },
  { value: "bounce", label: "Bounce", hint: "Lands with weight" },
  { value: "drift", label: "Drift", hint: "Slow diagonal float" },
  { value: "tectonic", label: "Tectonic", hint: "Heavy slab shift" },
  { value: "stomp", label: "Stomp", hint: "Slams down to scale" },
  { value: "roll", label: "Roll", hint: "Rotates while travelling" },
  { value: "typewriter", label: "Typewriter", hint: "Reveals letter by letter" },
];

export const LOOP_PRESETS: { value: AnimPreset; label: string }[] = [
  { value: "none", label: "None" },
  { value: "breathe", label: "Breathe" },
  { value: "shake", label: "Shake" },
  { value: "swing", label: "Swing" },
  { value: "drift", label: "Drift" },
  { value: "flicker", label: "Flicker" },
  { value: "spin", label: "Spin" },
];

/* ------------------------------------------------------------- stickers */

/** Inline SVG path data so the sticker set works with the network off. */
export const STICKERS: { id: string; label: string; d: string; viewBox: number }[] = [
  { id: "spark", label: "Spark", viewBox: 24, d: "M12 0l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" },
  { id: "bolt", label: "Bolt", viewBox: 24, d: "M13.5 0L3 13.2h6.2L8.6 24 21 10.2h-6.6z" },
  { id: "check", label: "Check", viewBox: 24, d: "M9.2 18.6L2.4 11.8l2.3-2.3 4.5 4.5L19.3 4l2.3 2.3z" },
  { id: "arrowup", label: "Arrow", viewBox: 24, d: "M12 1l8 9h-5v13H9V10H4z" },
  { id: "badge", label: "Badge", viewBox: 24, d: "M12 1l2.9 2.2 3.6-.4 1.1 3.5 3 2.1-1.6 3.3 1.6 3.3-3 2.1-1.1 3.5-3.6-.4L12 23l-2.9-2.2-3.6.4-1.1-3.5-3-2.1L3 12 1.4 8.7l3-2.1 1.1-3.5 3.6.4z" },
  { id: "quote", label: "Quote", viewBox: 24, d: "M0 14.4C0 8.7 3.4 4 8.6 2.4l1 2.6C6.4 6.3 4.6 8.6 4.4 11h3.5v10.6H0zm13.4 0C13.4 8.7 16.8 4 22 2.4l1 2.6c-3.2 1.3-5 3.6-5.2 6h3.5v10.6h-7.9z" },
  { id: "pin", label: "Pin", viewBox: 24, d: "M12 0C7.6 0 4 3.6 4 8c0 5.8 8 16 8 16s8-10.2 8-16c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" },
  { id: "tag", label: "Tag", viewBox: 24, d: "M11.6 1H23v11.4L12.4 23 1 11.6zm6.4 6a2 2 0 100-4 2 2 0 000 4z" },
  { id: "play", label: "Play", viewBox: 24, d: "M4 1l17 11L4 23z" },
  { id: "fire", label: "Fire", viewBox: 24, d: "M13.5 0c.9 4.2-1.4 5.7-3 7.6-2 2.4-2.6 5-1 7.4.5.8.2-2.8 2.8-5.2-.6 3.6 3.6 5.5 2.3 9.1 2.3-1 4-3.9 4-6.6 0-3.6-2.4-4.9-1.6-8.3-2.4 1-3.3 2.9-3.3 2.9C14 4.6 14.4 2 13.5 0z" },
];

export const KEY_HELP: { keys: string; action: string }[] = [
  { keys: "V", action: "Select tool" },
  { keys: "H", action: "Hand / pan" },
  { keys: "T", action: "Add text" },
  { keys: "R", action: "Add rectangle" },
  { keys: "O", action: "Add ellipse" },
  { keys: "Ctrl Z", action: "Undo" },
  { keys: "Ctrl Shift Z", action: "Redo" },
  { keys: "Ctrl D", action: "Duplicate" },
  { keys: "Ctrl C / Ctrl V", action: "Copy and paste" },
  { keys: "Ctrl A", action: "Select every layer" },
  { keys: "Ctrl G", action: "Toggle the grid" },
  { keys: "Delete", action: "Remove selection" },
  { keys: "Arrows", action: "Nudge one pixel" },
  { keys: "Shift Arrows", action: "Nudge ten pixels" },
  { keys: "Ctrl ] / Ctrl [", action: "Raise or lower" },
  { keys: "Ctrl 0", action: "Fit to view" },
  { keys: "Ctrl +/-", action: "Zoom" },
  { keys: "Space drag", action: "Pan the board" },
  { keys: "Ctrl S", action: "Save locally" },
  { keys: "Ctrl E", action: "Open export" },
];
