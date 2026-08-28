import { makeDoc, makeShape, makeText } from "./factories";
import type {
  AnimPreset, AnimSpec, Doc, EasingName, Layer, ShapeKind, ShapeLayer, TextEffect,
  TextEffectKind, TextLayer,
} from "./types";
import { DEFAULT_TEXT_EFFECT, solid } from "./types";

export type Template = {
  id: string;
  name: string;
  category: string;
  build: () => Doc;
};

/* ---------------------------------------------------------------- helpers
 *
 * Every design below is a plain data structure, so the shorthand here is the
 * difference between forty readable templates and forty walls of punctuation.
 */

/** Entrance, optionally with an idle behaviour running underneath it. */
function a(
  preset: AnimPreset,
  delay = 0,
  duration = 0.8,
  easing: EasingName = "expoOut",
  loop: AnimPreset = "none",
  speed = 1,
): AnimSpec {
  return {
    in: { preset, duration, delay, easing },
    out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" },
    loop: { preset: loop, speed },
  };
}

function fx(kind: TextEffectKind, partial: Partial<TextEffect> = {}): TextEffect {
  return { ...DEFAULT_TEXT_EFFECT, kind, ...partial };
}

function linear(angle: number, ...colors: string[]): Doc["background"] {
  return {
    kind: "gradient",
    gradient: {
      kind: "gradient",
      type: "linear",
      angle,
      stops: colors.map((color, i) => ({ offset: i / (colors.length - 1), color })),
    },
  };
}

const flat = (color: string): Doc["background"] => ({ kind: "solid", color });

const t = (partial: Partial<TextLayer>) => makeText(partial);
const s = (shape: ShapeKind, partial: Partial<ShapeLayer> = {}) => makeShape(shape, partial);

function assemble(
  name: string,
  width: number,
  height: number,
  background: Doc["background"],
  layers: Layer[],
  duration = 4,
): Doc {
  const doc = makeDoc(width, height, name);
  doc.background = background;
  doc.layers = layers;
  doc.duration = duration;
  return doc;
}

/** Cuts the repetition out of the forty entries that follow. */
function template(
  id: string,
  name: string,
  category: string,
  width: number,
  height: number,
  background: Doc["background"],
  layers: () => Layer[],
  duration = 4,
): Template {
  return { id, name, category, build: () => assemble(name, width, height, background, layers(), duration) };
}

/* Canvas sizes used repeatedly below. */
const SQUARE = [1080, 1080] as const;
const PORTRAIT = [1080, 1350] as const;
const STORY = [1080, 1920] as const;
const WIDE = [1280, 720] as const;
const A4 = [2480, 3508] as const;
const CARD = [1050, 600] as const;

/* ---- fonts, by the job they do rather than by name ---- */
const F = {
  slab: "var(--font-anton)",
  black: "var(--font-archivo)",
  condensed: "var(--font-bebas)",
  display: "var(--font-bricolage)",
  geo: "var(--font-syne)",
  round: "var(--font-righteous)",
  sans: "var(--font-inter)",
  soft: "var(--font-outfit)",
  grotesk: "var(--font-spacegrotesk)",
  poppins: "var(--font-poppins)",
  serif: "var(--font-playfair)",
  serifDisplay: "var(--font-dmserif)",
  book: "var(--font-lora)",
  mono: "var(--font-jetbrains)",
  hand: "var(--font-caveat)",
  script: "var(--font-pacifico)",
};

export const TEMPLATES: Template[] = [
  /* ============================================================== start */
  template("blank", "Blank board", "Start", ...SQUARE, flat("#faf7f0"), () => []),

  template("blank-story", "Blank story", "Start", ...STORY, flat("#0b0a08"), () => []),

  template("blank-a4", "Blank A4", "Start", ...A4, flat("#ffffff"), () => []),

  /* ============================================================== event */
  template("gig-night", "Live night", "Event", ...PORTRAIT, linear(160, "#0b0a08", "#2d0f4f"), () => [
    s("rect", { x: 0, y: 980, width: 1080, height: 370, cornerRadius: 0, fill: solid("#f04e23"), anim: a("rise", 0.1) }),
    t({
      x: 90, y: 220, width: 900, height: 340, text: "MIDNIGHT\nSESSION",
      fontFamily: F.slab, fontSize: 156, fontWeight: 400, align: "left", lineHeight: 0.92,
      fill: solid("#faf7f0"), effect: fx("extrude", { intensity: 70, offset: 30, direction: 45, color: "#f04e23" }),
      anim: a("tectonic", 0.2, 0.9),
    }),
    t({
      x: 90, y: 620, width: 640, height: 90, text: "Saturday · 21:00 · Warehouse 12",
      fontFamily: F.mono, fontSize: 34, fontWeight: 500, align: "left",
      fill: solid("#c8c0b0"), letterSpacing: 1.5, anim: a("fade", 0.9, 0.7, "easeOut"),
    }),
    t({
      x: 90, y: 1075, width: 900, height: 100, text: "TICKETS AT THE DOOR",
      fontFamily: F.display, fontSize: 58, fontWeight: 800, align: "left",
      fill: solid("#14120e"), uppercase: true, anim: a("panRight", 1.1, 0.7),
    }),
  ]),

  template("festival", "Festival bill", "Event", ...PORTRAIT, flat("#111d3a"), () => [
    s("burst", { x: 620, y: 60, width: 520, height: 520, fill: solid("#ffd400"), opacity: 0.9, anim: a("zoom", 0, 1, "backOut", "spin", 0.12) }),
    t({
      x: 80, y: 300, width: 920, height: 400, text: "HARBOUR\nFEST", fontFamily: F.condensed,
      fontSize: 210, fontWeight: 400, align: "left", lineHeight: 0.86, fill: solid("#ffffff"),
      effect: fx("splice", { intensity: 60, offset: 16, color: "#ff2d6f" }), anim: a("stomp", 0.25, 0.9),
    }),
    s("line", { x: 80, y: 760, width: 920, height: 5, fill: solid("#ffd400"), strokeWidth: 5, anim: a("wipe", 0.7, 0.6) }),
    t({
      x: 80, y: 810, width: 920, height: 300,
      text: "THE LANTERNS\nCLOSE QUARTERS\nSIGNAL DECAY\nMARGATE UNION",
      fontFamily: F.display, fontSize: 62, fontWeight: 700, align: "left", lineHeight: 1.22,
      fill: solid("#cfd8ee"), anim: a("rise", 0.9, 0.8),
    }),
    t({
      x: 80, y: 1180, width: 920, height: 80, text: "14 SEPT · EAST DOCK · FROM 16:00",
      fontFamily: F.mono, fontSize: 32, fontWeight: 600, align: "left", letterSpacing: 2,
      fill: solid("#ffd400"), anim: a("fade", 1.3, 0.6, "easeOut"),
    }),
  ]),

  template("club-flyer", "Club night", "Event", ...SQUARE, linear(35, "#1a0033", "#ff0066"), () => [
    s("ring", { x: 240, y: 130, width: 600, height: 600, fill: solid("#00ffd0"), opacity: 0.35, anim: a("zoom", 0, 1.1, "expoOut", "breathe", 0.5) }),
    t({
      x: 60, y: 330, width: 960, height: 260, text: "AFTER\nHOURS", fontFamily: F.black,
      fontSize: 168, fontWeight: 400, align: "center", lineHeight: 0.9, fill: solid("#ffffff"),
      effect: fx("neon", { intensity: 80, color: "#00ffd0" }), anim: a("blurIn", 0.3, 1),
    }),
    t({
      x: 140, y: 680, width: 800, height: 70, text: "residents · guests · no cover before midnight",
      fontFamily: F.grotesk, fontSize: 34, fontWeight: 500, align: "center",
      fill: solid("#ffd9ec"), anim: a("fade", 1, 0.7, "easeOut"),
    }),
    s("rect", { x: 340, y: 820, width: 400, height: 96, cornerRadius: 48, fill: solid("#00ffd0"), anim: a("pop", 1.2, 0.6, "backOut") }),
    t({
      x: 340, y: 845, width: 400, height: 60, text: "RSVP",
      fontFamily: F.display, fontSize: 44, fontWeight: 800, align: "center",
      fill: solid("#1a0033"), letterSpacing: 3, anim: a("pop", 1.3, 0.5, "backOut"),
    }),
  ]),

  template("conference", "Conference notice", "Event", ...PORTRAIT, flat("#f2efe6"), () => [
    s("rect", { x: 0, y: 0, width: 1080, height: 22, fill: solid("#1b3a6b"), anim: a("wipe", 0, 0.7) }),
    t({
      x: 100, y: 180, width: 880, height: 100, text: "ANNUAL GATHERING · 2026",
      fontFamily: F.mono, fontSize: 30, fontWeight: 600, align: "left", letterSpacing: 4,
      fill: solid("#1b3a6b"), anim: a("fade", 0.2, 0.6, "easeOut"),
    }),
    t({
      x: 100, y: 300, width: 880, height: 420, text: "Type,\nMotion,\nand the Press",
      fontFamily: F.serif, fontSize: 128, fontWeight: 600, align: "left", lineHeight: 1.04,
      fill: solid("#14120e"), anim: a("rise", 0.4, 0.9),
    }),
    s("line", { x: 100, y: 800, width: 240, height: 4, fill: solid("#f04e23"), strokeWidth: 4, anim: a("wipe", 0.9, 0.5) }),
    t({
      x: 100, y: 860, width: 780, height: 200,
      text: "Three days of talks on letterform, layout, and the machines that put ink on paper.",
      fontFamily: F.book, fontSize: 38, fontWeight: 400, align: "left", lineHeight: 1.45,
      fill: solid("#4a453d"), anim: a("fade", 1.1, 0.7, "easeOut"),
    }),
    t({
      x: 100, y: 1160, width: 880, height: 80, text: "Guildhall · 4 to 6 November",
      fontFamily: F.display, fontSize: 42, fontWeight: 700, align: "left",
      fill: solid("#1b3a6b"), anim: a("panRight", 1.4, 0.7),
    }),
  ]),

  template("open-mic", "Open mic", "Event", ...SQUARE, flat("#14120e"), () => [
    t({
      x: 80, y: 200, width: 920, height: 200, text: "OPEN MIC", fontFamily: F.condensed,
      fontSize: 172, fontWeight: 400, align: "center", fill: solid("#faf7f0"),
      effect: fx("echo", { intensity: 55, offset: 26, color: "#f04e23" }), anim: a("zoom", 0.1, 0.9),
    }),
    t({
      x: 190, y: 430, width: 700, height: 120, text: "every thursday",
      fontFamily: F.script, fontSize: 84, fontWeight: 400, align: "center",
      fill: solid("#f04e23"), anim: a("swing", 0.6, 1, "backOut"),
    }),
    s("wave", { x: 140, y: 620, width: 800, height: 140, fill: solid("#2f6b4f"), anim: a("wipe", 0.9, 0.8, "expoOut", "drift", 0.4) }),
    t({
      x: 140, y: 820, width: 800, height: 160,
      text: "Sign-up from seven. Five minutes each,\nany instrument, no judging panel.",
      fontFamily: F.soft, fontSize: 38, fontWeight: 400, align: "center", lineHeight: 1.45,
      fill: solid("#b3aa9a"), anim: a("fade", 1.2, 0.7, "easeOut"),
    }),
  ]),

  /* ============================================================= retail */
  template("market-sale", "Weekend market", "Retail", ...SQUARE, flat("#faf7f0"), () => [
    s("ellipse", { x: -180, y: -180, width: 700, height: 700, fill: solid("#ffe800"), anim: a("zoom", 0, 0.9, "expoOut", "drift", 0.4) }),
    s("ellipse", { x: 640, y: 660, width: 560, height: 560, fill: solid("#00a95c"), opacity: 0.9, anim: a("zoom", 0.15, 0.9, "expoOut", "drift", 0.3) }),
    t({
      x: 100, y: 380, width: 880, height: 260, text: "WEEKEND\nMARKET", fontFamily: F.black,
      fontSize: 132, fontWeight: 400, align: "left", lineHeight: 0.94, fill: solid("#14120e"),
      anim: a("rise", 0.3),
    }),
    t({
      x: 100, y: 680, width: 700, height: 70, text: "Fresh produce, makers, coffee. Every Sunday from seven.",
      fontFamily: F.book, fontSize: 32, fontWeight: 400, align: "left", lineHeight: 1.4,
      fill: solid("#554f43"), anim: a("fade", 0.7, 0.7, "easeOut"),
    }),
  ]),

  template("flash-sale", "Flash sale", "Retail", ...SQUARE, flat("#ff3b30"), () => [
    s("star", { x: 700, y: 80, width: 320, height: 320, sides: 12, innerRatio: 0.72, fill: solid("#ffe800"), anim: a("pop", 0.1, 0.7, "backOut", "spin", 0.2) }),
    t({
      x: 60, y: 260, width: 960, height: 340, text: "48\nHOURS", fontFamily: F.black,
      fontSize: 220, fontWeight: 400, align: "left", lineHeight: 0.86, fill: solid("#ffffff"),
      effect: fx("shadow", { intensity: 60, offset: 22, color: "#8b0000" }), anim: a("stomp", 0.2, 0.8),
    }),
    t({
      x: 60, y: 660, width: 960, height: 130, text: "EVERYTHING 40% OFF",
      fontFamily: F.display, fontSize: 84, fontWeight: 800, align: "left",
      fill: solid("#ffe800"), anim: a("panRight", 0.7, 0.7),
    }),
    s("rect", { x: 60, y: 850, width: 520, height: 110, cornerRadius: 12, fill: solid("#14120e"), anim: a("rise", 1) }),
    t({
      x: 60, y: 880, width: 520, height: 60, text: "IN STORE + ONLINE",
      fontFamily: F.mono, fontSize: 36, fontWeight: 700, align: "center",
      fill: solid("#ffffff"), letterSpacing: 2, anim: a("rise", 1.05),
    }),
  ]),

  template("new-arrival", "New arrival", "Retail", ...PORTRAIT, flat("#efe9e0"), () => [
    s("rect", { x: 90, y: 90, width: 900, height: 760, cornerRadius: 8, fill: solid("#c9b8a3"), anim: a("zoom", 0, 1) }),
    t({
      x: 140, y: 380, width: 800, height: 200, text: "JUST IN", fontFamily: F.serifDisplay,
      fontSize: 150, fontWeight: 400, align: "center", fill: solid("#faf7f0"),
      effect: fx("hollow", { intensity: 40 }), anim: a("blurIn", 0.3, 1),
    }),
    t({
      x: 140, y: 920, width: 800, height: 150, text: "The autumn range,\nfinally on the rail.",
      fontFamily: F.serif, fontSize: 62, fontWeight: 500, align: "center", lineHeight: 1.2,
      fill: solid("#2b2620"), anim: a("rise", 0.8),
    }),
    t({
      x: 140, y: 1150, width: 800, height: 70, text: "IN STORE FROM FRIDAY",
      fontFamily: F.mono, fontSize: 30, fontWeight: 600, align: "center", letterSpacing: 5,
      fill: solid("#7a6f5f"), anim: a("fade", 1.2, 0.7, "easeOut"),
    }),
  ]),

  template("cafe-menu", "Cafe board", "Retail", ...PORTRAIT, flat("#1e2b23"), () => [
    t({
      x: 90, y: 130, width: 900, height: 140, text: "THE SIDE DOOR", fontFamily: F.condensed,
      fontSize: 108, fontWeight: 400, align: "center", fill: solid("#e8dfc9"), letterSpacing: 6,
      anim: a("fade", 0, 0.8, "easeOut"),
    }),
    s("line", { x: 300, y: 300, width: 480, height: 3, fill: solid("#c19a4b"), strokeWidth: 3, anim: a("wipe", 0.4, 0.6) }),
    t({
      x: 120, y: 400, width: 840, height: 620,
      text: "Filter            3.20\nFlat white        3.80\nCortado           3.40\nCold brew         4.10\nHot chocolate     3.90\nLoose leaf tea    3.00",
      fontFamily: F.mono, fontSize: 46, fontWeight: 500, align: "left", lineHeight: 1.72,
      fill: solid("#e8dfc9"), anim: a("rise", 0.6, 0.9),
    }),
    t({
      x: 120, y: 1120, width: 840, height: 120, text: "beans roasted four streets away",
      fontFamily: F.hand, fontSize: 56, fontWeight: 500, align: "center",
      fill: solid("#c19a4b"), anim: a("fade", 1.3, 0.8, "easeOut"),
    }),
  ]),

  template("grand-opening", "Grand opening", "Retail", ...SQUARE, linear(140, "#fff4d6", "#ffd166"), () => [
    s("blob", { x: 560, y: 540, width: 620, height: 620, fill: solid("#ff6b35"), opacity: 0.85, anim: a("zoom", 0.1, 1, "expoOut", "drift", 0.35) }),
    t({
      x: 80, y: 220, width: 920, height: 120, text: "NOW OPEN", fontFamily: F.round,
      fontSize: 104, fontWeight: 400, align: "left", fill: solid("#7a2e00"), anim: a("panRight", 0.1, 0.8),
    }),
    t({
      x: 80, y: 380, width: 760, height: 300, text: "Corner of\nHill & Vine",
      fontFamily: F.serifDisplay, fontSize: 116, fontWeight: 400, align: "left", lineHeight: 1.06,
      fill: solid("#14120e"), anim: a("rise", 0.4, 0.9),
    }),
    t({
      x: 80, y: 760, width: 620, height: 160, text: "Doors from eight.\nFirst coffee is on us.",
      fontFamily: F.soft, fontSize: 40, fontWeight: 500, align: "left", lineHeight: 1.4,
      fill: solid("#5c3a1e"), anim: a("fade", 0.9, 0.7, "easeOut"),
    }),
  ]),

  /* ============================================================= social */
  template("story-promo", "Story promo", "Social", ...STORY, linear(120, "#7b2cff", "#c026d3", "#ff2d95"), () => [
    t({
      x: 90, y: 700, width: 900, height: 400, text: "DROP\nDAY", fontFamily: F.black,
      fontSize: 236, fontWeight: 400, align: "left", lineHeight: 0.86, fill: solid("#ffffff"),
      effect: fx("glitch", { intensity: 55, offset: 18 }), anim: a("tectonic", 0.2, 1),
    }),
    t({
      x: 90, y: 1180, width: 800, height: 120, text: "Ten pieces. No restock.",
      fontFamily: F.grotesk, fontSize: 46, fontWeight: 500, align: "left",
      fill: solid("#f0e6ff"), anim: a("fade", 0.9, 0.7, "easeOut"),
    }),
    s("rect", { x: 90, y: 1400, width: 480, height: 120, cornerRadius: 60, fill: solid("#ffffff"), anim: a("pop", 1.2, 0.6, "backOut") }),
    t({
      x: 90, y: 1435, width: 480, height: 70, text: "SWIPE UP",
      fontFamily: F.display, fontSize: 46, fontWeight: 800, align: "center",
      fill: solid("#7b2cff"), letterSpacing: 2, anim: a("pop", 1.3, 0.5, "backOut"),
    }),
  ], 5),

  template("countdown", "Countdown story", "Social", ...STORY, flat("#0b0a08"), () => [
    s("ring", { x: 140, y: 480, width: 800, height: 800, fill: solid("#f04e23"), opacity: 0.25, anim: a("zoom", 0, 1.2, "expoOut", "breathe", 0.4) }),
    t({
      x: 140, y: 760, width: 800, height: 300, text: "03", fontFamily: F.black,
      fontSize: 400, fontWeight: 400, align: "center", fill: solid("#faf7f0"),
      effect: fx("extrude", { intensity: 75, offset: 34, direction: 90, color: "#f04e23" }),
      anim: a("zoom", 0.2, 1, "backOut"),
    }),
    t({
      x: 140, y: 1180, width: 800, height: 100, text: "DAYS TO GO",
      fontFamily: F.mono, fontSize: 44, fontWeight: 600, align: "center", letterSpacing: 8,
      fill: solid("#8c857a"), anim: a("fade", 1, 0.8, "easeOut"),
    }),
    t({
      x: 140, y: 1400, width: 800, height: 110, text: "Set a reminder",
      fontFamily: F.soft, fontSize: 42, fontWeight: 500, align: "center",
      fill: solid("#f04e23"), anim: a("rise", 1.3, 0.7),
    }),
  ], 5),

  template("quote-social", "Quote card", "Social", ...SQUARE, flat("#14120e"), () => [
    t({
      x: 120, y: 300, width: 840, height: 420, text: "The tool should belong to the person holding it.",
      fontFamily: F.serif, fontSize: 88, fontWeight: 500, align: "left", lineHeight: 1.24,
      italic: true, fill: solid("#faf7f0"), anim: a("typewriter", 0.2, 2, "linear"),
    }),
    s("line", { x: 120, y: 800, width: 160, height: 6, fill: solid("#f04e23"), strokeWidth: 6 }),
    t({
      x: 120, y: 850, width: 600, height: 60, text: "Handpress", fontFamily: F.mono,
      fontSize: 30, fontWeight: 500, align: "left", fill: solid("#a49b89"), letterSpacing: 3,
      uppercase: true, anim: a("fade", 2.2, 0.6, "easeOut"),
    }),
  ], 5),

  template("carousel-cover", "Carousel cover", "Social", ...SQUARE, flat("#1b3a6b"), () => [
    s("chevron", { x: 820, y: 820, width: 180, height: 180, fill: solid("#ffd400"), anim: a("panLeft", 1.2, 0.7, "expoOut", "drift", 0.5) }),
    t({
      x: 90, y: 180, width: 900, height: 90, text: "A THREAD", fontFamily: F.mono,
      fontSize: 34, fontWeight: 600, align: "left", letterSpacing: 6, fill: solid("#7ba7e8"),
      anim: a("fade", 0.1, 0.6, "easeOut"),
    }),
    t({
      x: 90, y: 300, width: 900, height: 480, text: "Six things\nnobody tells\nyou about\nprinting",
      fontFamily: F.display, fontSize: 116, fontWeight: 800, align: "left", lineHeight: 1.04,
      fill: solid("#ffffff"), anim: a("rise", 0.3, 0.9),
    }),
    t({
      x: 90, y: 880, width: 600, height: 80, text: "Swipe →", fontFamily: F.soft,
      fontSize: 44, fontWeight: 600, align: "left", fill: solid("#ffd400"),
      anim: a("panRight", 1, 0.7, "expoOut", "drift", 0.6),
    }),
  ]),

  template("testimonial", "Testimonial", "Social", ...SQUARE, flat("#f4f1ea"), () => [
    s("speech", { x: 80, y: 120, width: 920, height: 620, fill: solid("#ffffff"), anim: a("pop", 0, 0.8, "backOut") }),
    t({
      x: 150, y: 250, width: 780, height: 340,
      text: "Made the whole run of posters in an afternoon. Nothing asked me for a card.",
      fontFamily: F.book, fontSize: 52, fontWeight: 400, align: "left", lineHeight: 1.36,
      fill: solid("#2b2620"), anim: a("fade", 0.4, 0.9, "easeOut"),
    }),
    s("ellipse", { x: 120, y: 820, width: 120, height: 120, fill: solid("#f04e23"), anim: a("pop", 0.9, 0.6, "backOut") }),
    t({
      x: 280, y: 840, width: 600, height: 120, text: "Dita R.\nPrint room, Bandung",
      fontFamily: F.soft, fontSize: 36, fontWeight: 500, align: "left", lineHeight: 1.35,
      fill: solid("#5c564c"), anim: a("panRight", 1, 0.7),
    }),
  ]),

  template("announcement", "Announcement", "Social", ...SQUARE, linear(200, "#00a95c", "#004d2c"), () => [
    t({
      x: 90, y: 260, width: 900, height: 120, text: "WE ARE HIRING", fontFamily: F.condensed,
      fontSize: 118, fontWeight: 400, align: "center", letterSpacing: 4, fill: solid("#ffffff"),
      effect: fx("outline", { intensity: 35 }), anim: a("zoom", 0.1, 0.9),
    }),
    s("line", { x: 340, y: 430, width: 400, height: 4, fill: solid("#a8f0cd"), strokeWidth: 4, anim: a("wipe", 0.6, 0.6) }),
    t({
      x: 140, y: 500, width: 800, height: 260, text: "Two printers, one binder,\nand somebody who likes\nordering paper.",
      fontFamily: F.soft, fontSize: 48, fontWeight: 500, align: "center", lineHeight: 1.4,
      fill: solid("#d8fdea"), anim: a("rise", 0.7, 0.8),
    }),
    t({
      x: 140, y: 860, width: 800, height: 80, text: "letters to the back door, or the address below",
      fontFamily: F.mono, fontSize: 30, fontWeight: 500, align: "center",
      fill: solid("#7fd4a8"), anim: a("fade", 1.2, 0.7, "easeOut"),
    }),
  ]),

  template("before-after", "Before and after", "Social", ...SQUARE, flat("#faf7f0"), () => [
    s("rect", { x: 0, y: 0, width: 540, height: 1080, fill: solid("#c9c2b6"), anim: a("panRight", 0, 0.8) }),
    s("rect", { x: 540, y: 0, width: 540, height: 1080, fill: solid("#f04e23"), anim: a("panLeft", 0.15, 0.8) }),
    t({
      x: 60, y: 480, width: 420, height: 120, text: "BEFORE", fontFamily: F.black,
      fontSize: 76, fontWeight: 400, align: "center", fill: solid("#5c564c"), anim: a("fade", 0.7, 0.6, "easeOut"),
    }),
    t({
      x: 600, y: 480, width: 420, height: 120, text: "AFTER", fontFamily: F.black,
      fontSize: 76, fontWeight: 400, align: "center", fill: solid("#ffffff"), anim: a("fade", 0.9, 0.6, "easeOut"),
    }),
    s("rect", { x: 520, y: 0, width: 40, height: 1080, fill: solid("#faf7f0"), anim: a("wipe", 0.4, 0.7) }),
  ]),

  template("giveaway", "Giveaway", "Social", ...SQUARE, flat("#ffd400"), () => [
    s("burst", { x: 190, y: 190, width: 700, height: 700, fill: solid("#ff2d6f"), anim: a("zoom", 0, 1, "backOut", "spin", 0.1) }),
    t({
      x: 190, y: 400, width: 700, height: 180, text: "GIVE\nAWAY", fontFamily: F.black,
      fontSize: 130, fontWeight: 400, align: "center", lineHeight: 0.92, fill: solid("#ffffff"),
      anim: a("pop", 0.4, 0.7, "backOut"),
    }),
    t({
      x: 100, y: 830, width: 880, height: 160, text: "Follow, then tag whoever\nwould actually use it.",
      fontFamily: F.soft, fontSize: 44, fontWeight: 600, align: "center", lineHeight: 1.35,
      fill: solid("#14120e"), anim: a("rise", 0.9, 0.8),
    }),
  ]),

  /* ============================================================= story */
  template("reel-cover", "Reel cover", "Story", ...STORY, flat("#0b0a08"), () => [
    s("rect", { x: 0, y: 1240, width: 1080, height: 680, fill: solid("#f04e23"), anim: a("rise", 0.2, 0.9) }),
    t({
      x: 80, y: 520, width: 920, height: 560, text: "HOW\nWE\nPRINT", fontFamily: F.condensed,
      fontSize: 250, fontWeight: 400, align: "left", lineHeight: 0.84, fill: solid("#faf7f0"),
      anim: a("tectonic", 0.1, 1),
    }),
    t({
      x: 80, y: 1360, width: 920, height: 300, text: "Part one:\nthe plate",
      fontFamily: F.display, fontSize: 96, fontWeight: 800, align: "left", lineHeight: 1.1,
      fill: solid("#14120e"), anim: a("panRight", 0.9, 0.8),
    }),
    t({
      x: 80, y: 1720, width: 920, height: 80, text: "FULL SERIES ON THE PROFILE",
      fontFamily: F.mono, fontSize: 32, fontWeight: 600, align: "left", letterSpacing: 3,
      fill: solid("#5c1a08"), anim: a("fade", 1.3, 0.7, "easeOut"),
    }),
  ], 5),

  template("poll-story", "Poll story", "Story", ...STORY, linear(160, "#2b1055", "#7597de"), () => [
    t({
      x: 100, y: 520, width: 880, height: 300, text: "PICK\nONE", fontFamily: F.geo,
      fontSize: 180, fontWeight: 800, align: "center", lineHeight: 0.94, fill: solid("#ffffff"),
      anim: a("zoom", 0.1, 0.9),
    }),
    s("rect", { x: 140, y: 940, width: 800, height: 160, cornerRadius: 24, fill: solid("#ffffff"), opacity: 0.16, anim: a("panRight", 0.5, 0.7) }),
    t({
      x: 140, y: 990, width: 800, height: 80, text: "The blue one",
      fontFamily: F.soft, fontSize: 52, fontWeight: 600, align: "center", fill: solid("#ffffff"),
      anim: a("panRight", 0.6, 0.7),
    }),
    s("rect", { x: 140, y: 1140, width: 800, height: 160, cornerRadius: 24, fill: solid("#ffffff"), opacity: 0.16, anim: a("panLeft", 0.7, 0.7) }),
    t({
      x: 140, y: 1190, width: 800, height: 80, text: "The other blue one",
      fontFamily: F.soft, fontSize: 52, fontWeight: 600, align: "center", fill: solid("#ffffff"),
      anim: a("panLeft", 0.8, 0.7),
    }),
  ], 5),

  template("recipe-story", "Recipe story", "Story", ...STORY, flat("#fff8ee"), () => [
    s("ellipse", { x: 240, y: 180, width: 600, height: 600, fill: solid("#e8a33d"), anim: a("zoom", 0, 1, "expoOut", "breathe", 0.3) }),
    t({
      x: 100, y: 880, width: 880, height: 220, text: "Cold brew,\nno equipment",
      fontFamily: F.serifDisplay, fontSize: 96, fontWeight: 400, align: "center", lineHeight: 1.1,
      fill: solid("#3d2a12"), anim: a("rise", 0.4, 0.9),
    }),
    t({
      x: 140, y: 1200, width: 800, height: 480,
      text: "1.  Coarse grind, eighty grams\n2.  One litre of cold water\n3.  Stir, cover, leave it\n4.  Sixteen hours on the counter\n5.  Strain through a cloth",
      fontFamily: F.mono, fontSize: 42, fontWeight: 500, align: "left", lineHeight: 1.85,
      fill: solid("#6b4f2a"), anim: a("rise", 0.8, 1),
    }),
  ], 5),

  template("motivation-story", "Daily note", "Story", ...STORY, flat("#101820"), () => [
    t({
      x: 110, y: 700, width: 860, height: 520, text: "Do the boring part first.",
      fontFamily: F.serif, fontSize: 118, fontWeight: 600, align: "left", lineHeight: 1.14,
      fill: solid("#f5f0e6"), effect: fx("lift", { intensity: 45 }), anim: a("blurIn", 0.2, 1.1),
    }),
    s("line", { x: 110, y: 1300, width: 200, height: 5, fill: solid("#e0a850"), strokeWidth: 5, anim: a("wipe", 1, 0.6) }),
    t({
      x: 110, y: 1370, width: 700, height: 80, text: "note to self, monday",
      fontFamily: F.hand, fontSize: 54, fontWeight: 500, align: "left",
      fill: solid("#9aa5b1"), anim: a("fade", 1.3, 0.8, "easeOut"),
    }),
  ], 5),

  /* ========================================================== thumbnail */
  template("yt-thumb", "Video thumbnail", "Thumbnail", ...WIDE, linear(45, "#0b0a08", "#3a0d0d"), () => [
    s("triangle", { x: 900, y: 180, width: 320, height: 360, fill: solid("#f04e23"), rotation: 90, anim: a("pop", 0.2, 0.7, "backOut", "breathe", 0.5) }),
    t({
      x: 60, y: 180, width: 800, height: 320, text: "I BUILT\nA PRESS", fontFamily: F.black,
      fontSize: 128, fontWeight: 400, align: "left", lineHeight: 0.94, fill: solid("#ffffff"),
      effect: fx("extrude", { intensity: 65, offset: 22, direction: 45, color: "#f04e23" }),
      anim: a("stomp", 0.1, 0.8),
    }),
    s("rect", { x: 60, y: 560, width: 300, height: 76, cornerRadius: 8, fill: solid("#ffe800"), anim: a("panRight", 0.7, 0.6) }),
    t({
      x: 60, y: 578, width: 300, height: 46, text: "IN ONE WEEK", fontFamily: F.mono,
      fontSize: 28, fontWeight: 700, align: "center", fill: solid("#14120e"), letterSpacing: 2,
      anim: a("panRight", 0.75, 0.6),
    }),
  ]),

  template("tutorial-thumb", "Tutorial card", "Thumbnail", ...WIDE, flat("#f4f1ea"), () => [
    s("rect", { x: 0, y: 0, width: 24, height: 720, fill: solid("#1b3a6b"), anim: a("wipe", 0, 0.6) }),
    t({
      x: 80, y: 140, width: 760, height: 100, text: "STEP BY STEP", fontFamily: F.mono,
      fontSize: 30, fontWeight: 600, align: "left", letterSpacing: 6, fill: solid("#1b3a6b"),
      anim: a("fade", 0.1, 0.6, "easeOut"),
    }),
    t({
      x: 80, y: 240, width: 800, height: 300, text: "Text effects\nthat survive\nan export",
      fontFamily: F.display, fontSize: 82, fontWeight: 800, align: "left", lineHeight: 1.08,
      fill: solid("#14120e"), anim: a("rise", 0.3, 0.8),
    }),
    s("ellipse", { x: 960, y: 220, width: 260, height: 260, fill: solid("#f04e23"), anim: a("zoom", 0.5, 0.8, "backOut") }),
    t({
      x: 960, y: 300, width: 260, height: 110, text: "12", fontFamily: F.black,
      fontSize: 108, fontWeight: 400, align: "center", fill: solid("#ffffff"), anim: a("pop", 0.7, 0.6, "backOut"),
    }),
  ]),

  template("podcast-cover", "Podcast episode", "Thumbnail", ...WIDE, flat("#2b1055"), () => [
    s("wave", { x: 0, y: 480, width: 1280, height: 240, fill: solid("#7597de"), opacity: 0.5, anim: a("wipe", 0.3, 0.9, "expoOut", "drift", 0.4) }),
    t({
      x: 70, y: 120, width: 900, height: 90, text: "EPISODE 41", fontFamily: F.mono,
      fontSize: 32, fontWeight: 600, align: "left", letterSpacing: 5, fill: solid("#9fb6e8"),
      anim: a("fade", 0.1, 0.6, "easeOut"),
    }),
    t({
      x: 70, y: 220, width: 900, height: 260, text: "What ink taught\nus about software",
      fontFamily: F.serif, fontSize: 78, fontWeight: 600, align: "left", lineHeight: 1.14,
      fill: solid("#ffffff"), anim: a("rise", 0.3, 0.9),
    }),
    s("ellipse", { x: 1030, y: 180, width: 180, height: 180, fill: solid("#ffd400"), anim: a("pop", 0.6, 0.7, "backOut", "breathe", 0.4) }),
  ]),

  template("webinar-banner", "Webinar banner", "Thumbnail", ...WIDE, linear(90, "#004d2c", "#00a95c"), () => [
    t({
      x: 70, y: 150, width: 820, height: 90, text: "LIVE SESSION", fontFamily: F.condensed,
      fontSize: 64, fontWeight: 400, align: "left", letterSpacing: 6, fill: solid("#a8f0cd"),
      anim: a("panRight", 0.1, 0.7),
    }),
    t({
      x: 70, y: 260, width: 860, height: 240, text: "Motion for people\nwho hate timelines",
      fontFamily: F.display, fontSize: 76, fontWeight: 800, align: "left", lineHeight: 1.1,
      fill: solid("#ffffff"), anim: a("rise", 0.3, 0.9),
    }),
    s("rect", { x: 70, y: 540, width: 420, height: 88, cornerRadius: 44, fill: solid("#ffffff"), anim: a("pop", 0.9, 0.6, "backOut") }),
    t({
      x: 70, y: 566, width: 420, height: 50, text: "THURSDAY · 19:00", fontFamily: F.mono,
      fontSize: 28, fontWeight: 700, align: "center", fill: solid("#004d2c"), letterSpacing: 2,
      anim: a("pop", 0.95, 0.6, "backOut"),
    }),
  ]),

  /* ============================================================== print */
  template("a4-flyer", "A4 flyer", "Print", ...A4, flat("#faf7f0"), () => [
    s("rect", { x: 0, y: 0, width: 2480, height: 900, fill: solid("#14120e"), anim: a("rise", 0, 0.9) }),
    t({
      x: 200, y: 280, width: 2080, height: 420, text: "PRINT NIGHT", fontFamily: F.condensed,
      fontSize: 340, fontWeight: 400, align: "left", letterSpacing: 8, fill: solid("#faf7f0"),
      effect: fx("splice", { intensity: 55, offset: 30, color: "#f04e23" }), anim: a("panRight", 0.2, 0.9),
    }),
    t({
      x: 200, y: 1100, width: 1600, height: 700,
      text: "An open workshop for anyone who wants to put ink on paper without asking permission first.",
      fontFamily: F.serif, fontSize: 150, fontWeight: 500, align: "left", lineHeight: 1.26,
      fill: solid("#14120e"), anim: a("rise", 0.6, 0.9),
    }),
    s("line", { x: 200, y: 2000, width: 600, height: 12, fill: solid("#f04e23"), strokeWidth: 12, anim: a("wipe", 1, 0.7) }),
    t({
      x: 200, y: 2160, width: 2080, height: 600,
      text: "Every second Tuesday\nSeven until late\nThe old dairy, Mill Lane\nBring paper, we have the rest",
      fontFamily: F.mono, fontSize: 96, fontWeight: 500, align: "left", lineHeight: 1.75,
      fill: solid("#4a453d"), anim: a("fade", 1.2, 0.8, "easeOut"),
    }),
    t({
      x: 200, y: 3180, width: 2080, height: 160, text: "NO CHARGE · NO SIGN-UP",
      fontFamily: F.display, fontSize: 110, fontWeight: 800, align: "left", letterSpacing: 6,
      fill: solid("#f04e23"), anim: a("panRight", 1.5, 0.8),
    }),
  ]),

  template("a4-poster", "A4 poster", "Print", ...A4, linear(170, "#1b3a6b", "#0b1526"), () => [
    t({
      x: 180, y: 500, width: 2120, height: 1400, text: "TYPE\nSPEC\nIMEN", fontFamily: F.black,
      fontSize: 620, fontWeight: 400, align: "left", lineHeight: 0.86, fill: solid("#f2ede3"),
      effect: fx("outline", { intensity: 45, color: "#ff6a3d" }), anim: a("tectonic", 0.2, 1.1),
    }),
    s("line", { x: 180, y: 2100, width: 2120, height: 10, fill: solid("#ff6a3d"), strokeWidth: 10, anim: a("wipe", 0.9, 0.8) }),
    t({
      x: 180, y: 2240, width: 2120, height: 500,
      text: "ABCDEFGHIJKLM\nNOPQRSTUVWXYZ\n0123456789",
      fontFamily: F.mono, fontSize: 130, fontWeight: 500, align: "left", lineHeight: 1.5,
      fill: solid("#7ba7e8"), anim: a("fade", 1.1, 0.9, "easeOut"),
    }),
    t({
      x: 180, y: 3200, width: 2120, height: 160, text: "SET AND PRINTED IN ONE TAB",
      fontFamily: F.display, fontSize: 96, fontWeight: 700, align: "left", letterSpacing: 10,
      fill: solid("#f2ede3"), anim: a("panRight", 1.5, 0.8),
    }),
  ]),

  template("a4-menu", "A4 menu", "Print", ...A4, flat("#fffdf7"), () => [
    t({
      x: 300, y: 320, width: 1880, height: 300, text: "SUPPER", fontFamily: F.serifDisplay,
      fontSize: 300, fontWeight: 400, align: "center", letterSpacing: 20, fill: solid("#2b2620"),
      anim: a("fade", 0, 0.9, "easeOut"),
    }),
    s("line", { x: 800, y: 720, width: 880, height: 6, fill: solid("#a8894f"), strokeWidth: 6, anim: a("wipe", 0.4, 0.7) }),
    t({
      x: 300, y: 900, width: 1880, height: 1900,
      text: "Bread and cultured butter\nRoast squash, sage, hazelnut\nBrown shrimp on toast\n\nHogget, turnip, salsa verde\nHake, mussels, cider\nBarley, wild garlic, curd\n\nBurnt honey custard\nQuince tart\nCheese, three ways",
      fontFamily: F.book, fontSize: 116, fontWeight: 400, align: "center", lineHeight: 1.9,
      fill: solid("#4a453d"), anim: a("rise", 0.6, 1),
    }),
    t({
      x: 300, y: 3060, width: 1880, height: 200, text: "four courses · forty-two",
      fontFamily: F.serif, fontSize: 110, fontWeight: 500, align: "center", italic: true,
      fill: solid("#a8894f"), anim: a("fade", 1.3, 0.8, "easeOut"),
    }),
  ]),

  template("a4-invoice", "A4 letterhead", "Print", ...A4, flat("#ffffff"), () => [
    s("rect", { x: 0, y: 0, width: 2480, height: 40, fill: solid("#f04e23"), anim: a("wipe", 0, 0.7) }),
    t({
      x: 200, y: 300, width: 1200, height: 180, text: "HANDPRESS", fontFamily: F.display,
      fontSize: 130, fontWeight: 800, align: "left", letterSpacing: 4, fill: solid("#14120e"),
      anim: a("panRight", 0.1, 0.7),
    }),
    t({
      x: 200, y: 500, width: 1200, height: 200, text: "Mill Lane · Print room 4\nhello@example.com",
      fontFamily: F.mono, fontSize: 62, fontWeight: 400, align: "left", lineHeight: 1.6,
      fill: solid("#8c857a"), anim: a("fade", 0.4, 0.7, "easeOut"),
    }),
    s("line", { x: 200, y: 900, width: 2080, height: 4, fill: solid("#dcd6ca"), strokeWidth: 4, anim: a("wipe", 0.6, 0.8) }),
    t({
      x: 200, y: 1050, width: 2080, height: 1600,
      text: "Dear —\n\nThis page is a starting point. Replace this block with whatever the letter needs to say, keep the rule and the mark where they are, and the margins will hold at A4 when it goes to print.\n\nYours,",
      fontFamily: F.book, fontSize: 82, fontWeight: 400, align: "left", lineHeight: 1.75,
      fill: solid("#2b2620"), anim: a("fade", 0.8, 0.9, "easeOut"),
    }),
  ]),

  /* =============================================================== card */
  template("business-card", "Business card", "Card", ...CARD, flat("#14120e"), () => [
    t({
      x: 70, y: 150, width: 600, height: 130, text: "BRYAN K.", fontFamily: F.display,
      fontSize: 90, fontWeight: 800, align: "left", letterSpacing: 2, fill: solid("#faf7f0"),
      anim: a("panRight", 0.1, 0.7),
    }),
    s("line", { x: 70, y: 300, width: 120, height: 5, fill: solid("#f04e23"), strokeWidth: 5, anim: a("wipe", 0.4, 0.5) }),
    t({
      x: 70, y: 350, width: 700, height: 160, text: "Print and motion\nhello@example.com",
      fontFamily: F.mono, fontSize: 34, fontWeight: 400, align: "left", lineHeight: 1.6,
      fill: solid("#8c857a"), anim: a("fade", 0.6, 0.7, "easeOut"),
    }),
    s("ring", { x: 800, y: 180, width: 220, height: 220, fill: solid("#f04e23"), opacity: 0.9, anim: a("zoom", 0.3, 0.8, "backOut") }),
  ]),

  template("appointment-card", "Appointment card", "Card", ...CARD, flat("#f4f1ea"), () => [
    s("rect", { x: 0, y: 0, width: 18, height: 600, fill: solid("#1b3a6b"), anim: a("wipe", 0, 0.6) }),
    t({
      x: 80, y: 110, width: 700, height: 90, text: "YOUR NEXT VISIT", fontFamily: F.mono,
      fontSize: 30, fontWeight: 600, align: "left", letterSpacing: 5, fill: solid("#1b3a6b"),
      anim: a("fade", 0.1, 0.6, "easeOut"),
    }),
    t({
      x: 80, y: 210, width: 800, height: 160, text: "Thursday 14 May\nquarter past ten",
      fontFamily: F.serif, fontSize: 68, fontWeight: 600, align: "left", lineHeight: 1.24,
      fill: solid("#14120e"), anim: a("rise", 0.3, 0.8),
    }),
    t({
      x: 80, y: 440, width: 800, height: 80, text: "Please give a day's notice to change it.",
      fontFamily: F.soft, fontSize: 30, fontWeight: 400, align: "left", fill: solid("#6b6459"),
      anim: a("fade", 0.8, 0.7, "easeOut"),
    }),
  ]),

  /* ========================================================== editorial */
  template("workshop", "Workshop notice", "Editorial", ...PORTRAIT, flat("#0f2a24"), () => [
    s("rect", { x: 80, y: 80, width: 920, height: 1190, cornerRadius: 0, fill: solid("#00000000"), stroke: "#3f7a68", strokeWidth: 4, anim: a("zoom", 0, 1) }),
    t({
      x: 150, y: 240, width: 780, height: 340, text: "SET\nAND\nPRINT", fontFamily: F.condensed,
      fontSize: 168, fontWeight: 400, align: "left", lineHeight: 0.9, fill: solid("#e8dfc9"),
      effect: fx("hollow", { intensity: 42 }), anim: a("rise", 0.2, 0.9),
    }),
    t({
      x: 150, y: 700, width: 780, height: 300,
      text: "Six evenings on the hand press. Composition, lock-up, inking, and pulling a sheet you would actually hang.",
      fontFamily: F.book, fontSize: 42, fontWeight: 400, align: "left", lineHeight: 1.5,
      fill: solid("#a8bdb4"), anim: a("fade", 0.7, 0.8, "easeOut"),
    }),
    t({
      x: 150, y: 1090, width: 780, height: 90, text: "TWELVE PLACES · APRIL",
      fontFamily: F.mono, fontSize: 34, fontWeight: 600, align: "left", letterSpacing: 3,
      fill: solid("#c19a4b"), anim: a("panRight", 1.1, 0.7),
    }),
  ]),

  template("magazine-cover", "Magazine cover", "Editorial", ...PORTRAIT, flat("#e8e2d6"), () => [
    t({
      x: 70, y: 90, width: 940, height: 200, text: "IMPRESSION", fontFamily: F.serifDisplay,
      fontSize: 168, fontWeight: 400, align: "center", letterSpacing: 4, fill: solid("#14120e"),
      anim: a("fade", 0, 0.9, "easeOut"),
    }),
    s("line", { x: 70, y: 320, width: 940, height: 3, fill: solid("#14120e"), strokeWidth: 3, anim: a("wipe", 0.3, 0.7) }),
    s("rect", { x: 70, y: 380, width: 940, height: 620, fill: solid("#b8402a"), anim: a("zoom", 0.4, 0.9) }),
    t({
      x: 130, y: 620, width: 820, height: 200, text: "The last\nletterpress",
      fontFamily: F.serif, fontSize: 108, fontWeight: 700, align: "left", lineHeight: 1.08,
      fill: solid("#f7f2e8"), anim: a("rise", 0.7, 0.9),
    }),
    t({
      x: 70, y: 1060, width: 940, height: 200,
      text: "Nine workshops still running · A field guide to paper weight · Why misregistration sells",
      fontFamily: F.mono, fontSize: 34, fontWeight: 500, align: "left", lineHeight: 1.7,
      fill: solid("#5c564c"), anim: a("fade", 1.1, 0.8, "easeOut"),
    }),
  ]),

  template("newsletter-header", "Newsletter header", "Editorial", ...WIDE, flat("#fffdf7"), () => [
    t({
      x: 80, y: 200, width: 1120, height: 200, text: "THE PROOF", fontFamily: F.serifDisplay,
      fontSize: 156, fontWeight: 400, align: "center", letterSpacing: 12, fill: solid("#14120e"),
      anim: a("blurIn", 0.1, 1),
    }),
    s("line", { x: 380, y: 430, width: 520, height: 3, fill: solid("#a8894f"), strokeWidth: 3, anim: a("wipe", 0.6, 0.7) }),
    t({
      x: 80, y: 480, width: 1120, height: 90, text: "letters from the print room · issue nine",
      fontFamily: F.book, fontSize: 40, fontWeight: 400, align: "center", italic: true,
      fill: solid("#6b6459"), anim: a("fade", 0.9, 0.8, "easeOut"),
    }),
  ]),

  template("photo-caption", "Photo caption", "Editorial", ...SQUARE, flat("#1c1c1c"), () => [
    s("rect", { x: 90, y: 90, width: 900, height: 620, fill: solid("#3a3a3a"), anim: a("zoom", 0, 0.9) }),
    t({
      x: 90, y: 780, width: 720, height: 200, text: "Plate 04\nInk, before the wipe",
      fontFamily: F.mono, fontSize: 42, fontWeight: 500, align: "left", lineHeight: 1.6,
      fill: solid("#d6d0c4"), anim: a("panRight", 0.5, 0.8),
    }),
    s("line", { x: 90, y: 740, width: 900, height: 2, fill: solid("#6b6459"), strokeWidth: 2, anim: a("wipe", 0.3, 0.6) }),
  ]),

  /* ============================================================ utility */
  template("price-list", "Price list", "Utility", ...PORTRAIT, flat("#ffffff"), () => [
    t({
      x: 90, y: 140, width: 900, height: 130, text: "WHAT THINGS COST", fontFamily: F.display,
      fontSize: 76, fontWeight: 800, align: "left", letterSpacing: 1, fill: solid("#14120e"),
      anim: a("panRight", 0.1, 0.7),
    }),
    s("line", { x: 90, y: 300, width: 900, height: 4, fill: solid("#f04e23"), strokeWidth: 4, anim: a("wipe", 0.4, 0.6) }),
    t({
      x: 90, y: 380, width: 900, height: 700,
      text: "A5 flyer, 100 off        45\nA4 poster, 50 off        70\nBusiness cards, 250     120\nInvitations, 100        160\nBespoke setup            35",
      fontFamily: F.mono, fontSize: 46, fontWeight: 500, align: "left", lineHeight: 2,
      fill: solid("#2b2620"), anim: a("rise", 0.6, 0.9),
    }),
    t({
      x: 90, y: 1180, width: 900, height: 90, text: "prices hold to the end of the year",
      fontFamily: F.soft, fontSize: 34, fontWeight: 400, align: "left", fill: solid("#8c857a"),
      anim: a("fade", 1.2, 0.7, "easeOut"),
    }),
  ]),

  template("opening-hours", "Opening hours", "Utility", ...SQUARE, flat("#0f2a24"), () => [
    t({
      x: 90, y: 130, width: 900, height: 120, text: "WE ARE HERE", fontFamily: F.condensed,
      fontSize: 92, fontWeight: 400, align: "center", letterSpacing: 8, fill: solid("#e8dfc9"),
      anim: a("fade", 0, 0.8, "easeOut"),
    }),
    t({
      x: 140, y: 330, width: 800, height: 560,
      text: "Mon      closed\nTue–Fri  08 – 17\nSat      09 – 16\nSun      10 – 14",
      fontFamily: F.mono, fontSize: 54, fontWeight: 500, align: "left", lineHeight: 2,
      fill: solid("#a8bdb4"), anim: a("rise", 0.4, 0.9),
    }),
    s("line", { x: 340, y: 940, width: 400, height: 3, fill: solid("#c19a4b"), strokeWidth: 3, anim: a("wipe", 1, 0.6) }),
  ]),

  template("thank-you", "Thank you note", "Utility", ...CARD, flat("#fff6f2"), () => [
    t({
      x: 80, y: 170, width: 890, height: 180, text: "thank you", fontFamily: F.script,
      fontSize: 120, fontWeight: 400, align: "center", fill: solid("#b8402a"),
      anim: a("swing", 0.1, 1, "backOut"),
    }),
    t({
      x: 80, y: 390, width: 890, height: 90, text: "for shopping small",
      fontFamily: F.soft, fontSize: 36, fontWeight: 500, align: "center", letterSpacing: 3,
      fill: solid("#6b6459"), anim: a("fade", 0.7, 0.8, "easeOut"),
    }),
  ]),

  template("wifi-card", "Wifi card", "Utility", ...CARD, flat("#14120e"), () => [
    t({
      x: 70, y: 110, width: 910, height: 100, text: "WIFI", fontFamily: F.black,
      fontSize: 84, fontWeight: 400, align: "left", letterSpacing: 6, fill: solid("#f04e23"),
      anim: a("panRight", 0.1, 0.6),
    }),
    t({
      x: 70, y: 250, width: 910, height: 260,
      text: "network   sidedoor-guest\npassword  brownbutter",
      fontFamily: F.mono, fontSize: 48, fontWeight: 500, align: "left", lineHeight: 1.8,
      fill: solid("#faf7f0"), anim: a("rise", 0.3, 0.8),
    }),
  ]),
];

export const TEMPLATE_CATEGORIES = Array.from(new Set(TEMPLATES.map((t) => t.category)));
