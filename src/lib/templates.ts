import { makeDoc, makeShape, makeText } from "./factories";
import type { Doc, Layer } from "./types";
import { solid } from "./types";

export type Template = {
  id: string;
  name: string;
  category: string;
  build: () => Doc;
};

function assemble(
  name: string,
  width: number,
  height: number,
  background: Doc["background"],
  layers: Layer[],
  duration = 5,
): Doc {
  const doc = makeDoc(width, height, name);
  doc.background = background;
  doc.layers = layers;
  doc.duration = duration;
  return doc;
}

export const TEMPLATES: Template[] = [
  {
    id: "gig-night",
    name: "Live night",
    category: "Event",
    build: () =>
      assemble(
        "Live night",
        1080,
        1350,
        { kind: "gradient", gradient: { kind: "gradient", type: "linear", angle: 160, stops: [{ offset: 0, color: "#0b0a08" }, { offset: 1, color: "#2d0f4f" }] } },
        [
          makeShape("rect", {
            x: 0, y: 980, width: 1080, height: 370, cornerRadius: 0,
            fill: solid("#f04e23"),
            anim: { in: { preset: "rise", duration: 0.8, delay: 0.1, easing: "expoOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
          }),
          makeText({
            x: 90, y: 220, width: 900, height: 340,
            text: "MIDNIGHT\nSESSION",
            fontFamily: "var(--font-anton)", fontSize: 156, fontWeight: 400,
            align: "left", lineHeight: 0.92, fill: solid("#faf7f0"),
            effect: { kind: "extrude", intensity: 70, offset: 30, direction: 45, blur: 0, transparency: 0, color: "#f04e23" },
            anim: { in: { preset: "tectonic", duration: 0.9, delay: 0.2, easing: "expoOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
          }),
          makeText({
            x: 90, y: 620, width: 640, height: 90,
            text: "Saturday · 21:00 · Warehouse 12",
            fontFamily: "var(--font-jetbrains)", fontSize: 34, fontWeight: 500,
            align: "left", fill: solid("#c8c0b0"), letterSpacing: 1.5,
            anim: { in: { preset: "fade", duration: 0.7, delay: 0.9, easing: "easeOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
          }),
          makeText({
            x: 90, y: 1075, width: 900, height: 100,
            text: "TICKETS AT THE DOOR",
            fontFamily: "var(--font-bricolage)", fontSize: 58, fontWeight: 800,
            align: "left", fill: solid("#14120e"), uppercase: true,
            anim: { in: { preset: "panRight", duration: 0.7, delay: 1.1, easing: "expoOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
          }),
        ],
        4,
      ),
  },
  {
    id: "market-sale",
    name: "Weekend market",
    category: "Retail",
    build: () =>
      assemble(
        "Weekend market",
        1080,
        1080,
        { kind: "solid", color: "#faf7f0" },
        [
          makeShape("ellipse", {
            x: -180, y: -180, width: 700, height: 700, fill: solid("#ffe800"),
            anim: { in: { preset: "zoom", duration: 0.9, delay: 0, easing: "expoOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "drift", speed: 0.4 } },
          }),
          makeShape("ellipse", {
            x: 640, y: 660, width: 560, height: 560, fill: solid("#00a95c"), opacity: 0.9,
            anim: { in: { preset: "zoom", duration: 0.9, delay: 0.15, easing: "expoOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "drift", speed: 0.3 } },
          }),
          makeText({
            x: 100, y: 380, width: 880, height: 260,
            text: "WEEKEND\nMARKET",
            fontFamily: "var(--font-archivo)", fontSize: 132, fontWeight: 400,
            align: "left", lineHeight: 0.94, fill: solid("#14120e"),
            anim: { in: { preset: "rise", duration: 0.8, delay: 0.3, easing: "expoOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
          }),
          makeText({
            x: 100, y: 680, width: 700, height: 70,
            text: "Fresh produce, makers, coffee. Every Sunday from seven.",
            fontFamily: "var(--font-lora)", fontSize: 32, fontWeight: 400,
            align: "left", fill: solid("#554f43"), lineHeight: 1.4,
            anim: { in: { preset: "fade", duration: 0.7, delay: 0.7, easing: "easeOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
          }),
        ],
        4,
      ),
  },
  {
    id: "story-promo",
    name: "Story promo",
    category: "Social",
    build: () =>
      assemble(
        "Story promo",
        1080,
        1920,
        { kind: "gradient", gradient: { kind: "gradient", type: "linear", angle: 120, stops: [{ offset: 0, color: "#7b2cff" }, { offset: 0.55, color: "#c026d3" }, { offset: 1, color: "#ff2d95" }] } },
        [
          makeText({
            x: 90, y: 700, width: 900, height: 400,
            text: "DROP\nDAY",
            fontFamily: "var(--font-bebas)", fontSize: 260, fontWeight: 400,
            align: "center", lineHeight: 0.86, fill: solid("#ffffff"),
            effect: { kind: "neon", intensity: 80, offset: 40, direction: 45, blur: 0, transparency: 30, color: "#00e5ff" },
            anim: { in: { preset: "pop", duration: 0.9, delay: 0.1, easing: "backOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "breathe", speed: 0.6 } },
          }),
          makeText({
            x: 140, y: 1180, width: 800, height: 90,
            text: "Swipe up — limited run",
            fontFamily: "var(--font-outfit)", fontSize: 44, fontWeight: 600,
            align: "center", fill: solid("#ffffff"),
            anim: { in: { preset: "rise", duration: 0.7, delay: 0.8, easing: "expoOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
          }),
          makeShape("rect", {
            x: 340, y: 1360, width: 400, height: 108, cornerRadius: 54, fill: solid("#14120e"),
            anim: { in: { preset: "pop", duration: 0.6, delay: 1.1, easing: "backOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
          }),
          makeText({
            x: 340, y: 1390, width: 400, height: 60,
            text: "SHOP NOW",
            fontFamily: "var(--font-jetbrains)", fontSize: 34, fontWeight: 700,
            align: "center", fill: solid("#ffffff"), letterSpacing: 3,
            anim: { in: { preset: "fade", duration: 0.4, delay: 1.35, easing: "easeOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
          }),
        ],
        5,
      ),
  },
  {
    id: "workshop-a4",
    name: "Workshop notice",
    category: "Print",
    build: () =>
      assemble(
        "Workshop notice",
        1748,
        2480,
        { kind: "solid", color: "#f2ede2" },
        [
          makeShape("rect", { x: 120, y: 120, width: 1508, height: 2240, fill: solid("#00000000"), stroke: "#14120e", strokeWidth: 5, cornerRadius: 0 }),
          makeText({
            x: 220, y: 300, width: 1300, height: 120,
            text: "Notice of an evening class",
            fontFamily: "var(--font-jetbrains)", fontSize: 44, fontWeight: 500,
            align: "left", fill: solid("#7a7263"), letterSpacing: 4, uppercase: true,
          }),
          makeText({
            x: 220, y: 520, width: 1300, height: 700,
            text: "Letterpress\nfor the\nimpatient",
            fontFamily: "var(--font-playfair)", fontSize: 190, fontWeight: 800,
            align: "left", lineHeight: 0.98, fill: solid("#14120e"),
            anim: { in: { preset: "rise", duration: 1, delay: 0.2, easing: "expoOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
          }),
          makeShape("line", { x: 220, y: 1340, width: 1300, height: 8, fill: solid("#f04e23"), strokeWidth: 8 }),
          makeText({
            x: 220, y: 1440, width: 1000, height: 400,
            text: "Six evenings. Real type, real ink, real misalignment. You leave with a hundred sheets and stained hands.",
            fontFamily: "var(--font-lora)", fontSize: 56, fontWeight: 400,
            align: "left", lineHeight: 1.5, fill: solid("#3d382e"),
          }),
          makeText({
            x: 220, y: 2080, width: 1300, height: 120,
            text: "Enrol at the counter",
            fontFamily: "var(--font-bricolage)", fontSize: 76, fontWeight: 700,
            align: "left", fill: solid("#f04e23"),
          }),
        ],
        4,
      ),
  },
  {
    id: "thumb-bold",
    name: "Video thumbnail",
    category: "Social",
    build: () =>
      assemble(
        "Video thumbnail",
        1280,
        720,
        { kind: "gradient", gradient: { kind: "gradient", type: "radial", angle: 0, stops: [{ offset: 0, color: "#34659e" }, { offset: 1, color: "#0b0a08" }] } },
        [
          makeText({
            x: 70, y: 180, width: 1140, height: 340,
            text: "I BUILT IT\nMYSELF",
            fontFamily: "var(--font-archivo)", fontSize: 168, fontWeight: 400,
            align: "left", lineHeight: 0.94, fill: solid("#ffe800"),
            effect: { kind: "outline", intensity: 40, offset: 20, direction: 45, blur: 0, transparency: 0, color: "#14120e" },
            anim: { in: { preset: "stomp", duration: 0.7, delay: 0.1, easing: "expoOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
          }),
          makeShape("rect", { x: 70, y: 560, width: 360, height: 82, cornerRadius: 10, fill: solid("#f04e23") }),
          makeText({
            x: 70, y: 582, width: 360, height: 50,
            text: "NO SUBSCRIPTION",
            fontFamily: "var(--font-jetbrains)", fontSize: 26, fontWeight: 700,
            align: "center", fill: solid("#ffffff"), letterSpacing: 1.5,
          }),
        ],
        3,
      ),
  },
  {
    id: "quote-card",
    name: "Quote card",
    category: "Social",
    build: () =>
      assemble(
        "Quote card",
        1080,
        1080,
        { kind: "solid", color: "#14120e" },
        [
          makeText({
            x: 120, y: 300, width: 840, height: 420,
            text: "The tool should belong to the person holding it.",
            fontFamily: "var(--font-playfair)", fontSize: 88, fontWeight: 500,
            align: "left", lineHeight: 1.24, italic: true, fill: solid("#faf7f0"),
            anim: { in: { preset: "typewriter", duration: 2, delay: 0.2, easing: "linear" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
          }),
          makeShape("line", { x: 120, y: 800, width: 160, height: 6, fill: solid("#f04e23"), strokeWidth: 6 }),
          makeText({
            x: 120, y: 850, width: 600, height: 60,
            text: "Handpress",
            fontFamily: "var(--font-jetbrains)", fontSize: 30, fontWeight: 500,
            align: "left", fill: solid("#a49b89"), letterSpacing: 3, uppercase: true,
            anim: { in: { preset: "fade", duration: 0.6, delay: 2.2, easing: "easeOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
          }),
        ],
        5,
      ),
  },
  {
    id: "blank",
    name: "Blank board",
    category: "Start",
    build: () => makeDoc(1080, 1080, "Untitled design"),
  },
];

export const TEMPLATE_CATEGORIES = Array.from(new Set(TEMPLATES.map((t) => t.category)));
