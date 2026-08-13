import type { Fill, ImageFilters, ShapeKind, Shadow, TextLayer } from "./types";

/* ----------------------------------------------------------------- fills */

/** Translate a Fill into the props Konva expects on a shape node. */
export function fillProps(fill: Fill, width: number, height: number) {
  if (fill.kind === "solid") return { fill: fill.color };

  const stops = fill.stops
    .slice()
    .sort((a, b) => a.offset - b.offset)
    .flatMap((s) => [s.offset, s.color]);

  if (fill.type === "radial") {
    const r = Math.max(width, height) / 2;
    return {
      fillRadialGradientStartPoint: { x: width / 2, y: height / 2 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: width / 2, y: height / 2 },
      fillRadialGradientEndRadius: r,
      fillRadialGradientColorStops: stops,
    };
  }

  // Project the angle onto the layer box so the ramp always spans it fully.
  const rad = (fill.angle * Math.PI) / 180;
  const cx = width / 2;
  const cy = height / 2;
  const half = (Math.abs(width * Math.cos(rad)) + Math.abs(height * Math.sin(rad))) / 2;
  return {
    fillLinearGradientStartPoint: { x: cx - Math.cos(rad) * half, y: cy - Math.sin(rad) * half },
    fillLinearGradientEndPoint: { x: cx + Math.cos(rad) * half, y: cy + Math.sin(rad) * half },
    fillLinearGradientColorStops: stops,
  };
}

/** CSS equivalent, for swatches and DOM previews. */
export function fillToCss(fill: Fill): string {
  if (fill.kind === "solid") return fill.color;
  const stops = fill.stops
    .slice()
    .sort((a, b) => a.offset - b.offset)
    .map((s) => `${s.color} ${Math.round(s.offset * 100)}%`)
    .join(", ");
  return fill.type === "radial"
    ? `radial-gradient(circle at 50% 50%, ${stops})`
    : `linear-gradient(${fill.angle + 90}deg, ${stops})`;
}

export function shadowProps(shadow: Shadow) {
  if (!shadow.enabled) return {};
  return {
    shadowColor: shadow.color,
    shadowBlur: shadow.blur,
    shadowOffsetX: shadow.offsetX,
    shadowOffsetY: shadow.offsetY,
    shadowOpacity: shadow.opacity,
  };
}

/* ---------------------------------------------------------------- shapes */

/**
 * Path data for shapes Konva has no primitive for, normalised to a 100×100
 * box so a single scale factor fits them to any layer size.
 */
export const SHAPE_PATHS: Partial<Record<ShapeKind, string>> = {
  heart: "M50 91C22 71 4 55 4 34.5 4 20 15 9 29 9c8 0 16 4 21 11 5-7 13-11 21-11 14 0 25 11 25 25.5C96 55 78 71 50 91z",
  diamond: "M50 2L98 50 50 98 2 50z",
  cross: "M34 2h32v32h32v32H66v32H34V66H2V34h32z",
  chevron: "M6 4h34l38 46-38 46H6l38-46z",
  arrow: "M2 36h56V12l40 38-40 38V64H2z",
  ring: "M50 2a48 48 0 100 96 48 48 0 100-96zm0 24a24 24 0 110 48 24 24 0 010-48z",
  blob: "M78 12c11 9 18 24 16 39-2 15-13 30-27 37-14 7-31 6-42-3S9 60 12 45 27 17 41 11s26-8 37 1z",
  speech: "M8 6h84a6 6 0 016 6v54a6 6 0 01-6 6H44L20 96V72h-12a6 6 0 01-6-6V12a6 6 0 016-6z",
  wave: "M0 56c12.5-20 25-20 37.5 0s25 20 37.5 0 25-20 25 0v44H0z",
};

/** Points for a Konva Line used by the plain line shape. */
export function linePoints(width: number, height: number): number[] {
  return [0, height / 2, width, height / 2];
}

/* ---------------------------------------------------------------- images */

/**
 * Konva's filter values use different scales per filter, so the panel's
 * uniform −100…100 sliders get mapped here rather than in the UI.
 */
export function konvaFilterValues(f: ImageFilters) {
  return {
    brightness: f.brightness / 100,          // -1..1
    contrast: f.contrast,                    // -100..100
    saturation: f.saturation / 50,           // -2..2
    hue: f.hue,                              // degrees
    blurRadius: f.blur,
    noise: f.noise / 100,
    pixelSize: Math.max(1, Math.round(f.pixelate)),
    /** Grayscale, sepia and invert are gated on/off, then blended by opacity. */
    enhance: 0,
  };
}

export function hasActiveFilters(f: ImageFilters): boolean {
  return (
    f.brightness !== 0 || f.contrast !== 0 || f.saturation !== 0 || f.hue !== 0 ||
    f.blur > 0 || f.noise > 0 || f.pixelate > 1 || f.grayscale > 0 ||
    f.sepia > 0 || f.invert > 0
  );
}

/* ----------------------------------------------------------- text effects */

export type TextPass = {
  /** Offset from the main text position. */
  dx: number;
  dy: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOpacity?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
};

/**
 * Build the stack of copies that produce a text effect.
 *
 * Every effect here is drawn the same way the print trade does it: the same
 * glyphs printed several times, shifted and re-inked. The final pass in the
 * returned array is the one carrying the layer's own fill.
 */
export function textEffectPasses(layer: TextLayer, baseColor: string): TextPass[] {
  const e = layer.effect;
  const size = layer.fontSize;
  const dist = (e.offset / 100) * size * 0.35;
  const rad = (e.direction * Math.PI) / 180;
  const ox = Math.cos(rad) * dist;
  const oy = Math.sin(rad) * dist;
  const alpha = 1 - e.transparency / 100;

  switch (e.kind) {
    case "shadow":
      return [
        {
          dx: ox, dy: oy, fill: e.color, opacity: alpha,
          shadowColor: e.color, shadowBlur: e.blur, shadowOpacity: alpha,
        },
        { dx: 0, dy: 0, fill: baseColor, opacity: 1 },
      ];

    case "lift":
      // A wide, soft, low-opacity drop directly beneath — the sheet floating.
      return [
        {
          dx: 0, dy: 0, fill: baseColor, opacity: 1,
          shadowColor: "#000000",
          shadowBlur: 6 + (e.intensity / 100) * size * 0.5,
          shadowOpacity: 0.16 + (e.intensity / 100) * 0.34,
          shadowOffsetY: (e.intensity / 100) * size * 0.09,
        },
      ];

    case "hollow":
      return [
        {
          dx: 0, dy: 0, fill: "transparent",
          stroke: baseColor,
          strokeWidth: Math.max(1, (e.intensity / 100) * size * 0.09),
          opacity: 1,
        },
      ];

    case "splice":
      return [
        {
          dx: ox, dy: oy, fill: e.color, opacity: alpha,
        },
        {
          dx: 0, dy: 0, fill: "transparent",
          stroke: baseColor,
          strokeWidth: Math.max(1, (e.intensity / 100) * size * 0.09),
          opacity: 1,
        },
      ];

    case "echo": {
      const passes: TextPass[] = [];
      for (let i = 3; i >= 1; i--) {
        passes.push({
          dx: ox * i * 0.6,
          dy: oy * i * 0.6,
          fill: e.color,
          opacity: alpha * (0.34 - i * 0.06),
        });
      }
      passes.push({ dx: 0, dy: 0, fill: baseColor, opacity: 1 });
      return passes;
    }

    case "glitch": {
      // Two separated channels, the way a misaligned RGB scan tears.
      const g = Math.max(dist, 2);
      return [
        { dx: -g, dy: 0, fill: "#00e5ff", opacity: alpha * 0.85 },
        { dx: g, dy: 0, fill: e.color, opacity: alpha * 0.85 },
        { dx: 0, dy: 0, fill: baseColor, opacity: 1 },
      ];
    }

    case "neon": {
      const glow = e.color;
      const strength = 0.35 + (e.intensity / 100) * 0.65;
      return [
        { dx: 0, dy: 0, fill: glow, opacity: strength * 0.5, shadowColor: glow, shadowBlur: size * 0.9, shadowOpacity: 1 },
        { dx: 0, dy: 0, fill: glow, opacity: strength * 0.7, shadowColor: glow, shadowBlur: size * 0.45, shadowOpacity: 1 },
        { dx: 0, dy: 0, fill: glow, opacity: strength, shadowColor: glow, shadowBlur: size * 0.18, shadowOpacity: 1 },
        { dx: 0, dy: 0, fill: "#ffffff", opacity: 0.92 },
      ];
    }

    case "outline":
      return [
        {
          dx: 0, dy: 0, fill: e.color,
          stroke: e.color,
          strokeWidth: Math.max(2, (e.intensity / 100) * size * 0.22),
          opacity: 1,
        },
        { dx: 0, dy: 0, fill: baseColor, opacity: 1 },
      ];

    case "extrude": {
      // A stepped run of copies along the light angle builds real depth.
      const steps = Math.max(2, Math.round((e.intensity / 100) * 26));
      const stepX = (Math.cos(rad) * (e.offset / 100) * size * 0.5) / steps;
      const stepY = (Math.sin(rad) * (e.offset / 100) * size * 0.5) / steps;
      const passes: TextPass[] = [];
      for (let i = steps; i >= 1; i--) {
        passes.push({
          dx: stepX * i,
          dy: stepY * i,
          fill: e.color,
          opacity: 1,
        });
      }
      passes.push({ dx: 0, dy: 0, fill: baseColor, opacity: 1 });
      return passes;
    }

    default:
      return [{ dx: 0, dy: 0, fill: baseColor, opacity: 1 }];
  }
}

/** Arc path for curved text, sagitta derived from the curve slider. */
export function curvePath(width: number, curve: number): string {
  if (!curve) return `M 0 0 L ${width} 0`;
  const sag = (curve / 100) * width * 0.5;
  const r = (width * width) / (8 * Math.abs(sag)) + Math.abs(sag) / 2;
  const sweep = curve > 0 ? 1 : 0;
  return `M 0 0 A ${r} ${r} 0 0 ${sweep} ${width} 0`;
}

/** Konva font style string from the layer's toggles. */
export function fontStyle(layer: TextLayer): string {
  const parts: string[] = [];
  if (layer.italic) parts.push("italic");
  parts.push(String(layer.fontWeight));
  return parts.join(" ");
}

export function decoration(layer: TextLayer): string {
  const parts: string[] = [];
  if (layer.underline) parts.push("underline");
  if (layer.strikethrough) parts.push("line-through");
  return parts.join(" ");
}

/** Resolve a CSS variable font token to a real family name for canvas. */
export function resolveFont(family: string): string {
  if (typeof window === "undefined" || !family.startsWith("var(")) return family;
  const name = family.slice(4, -1).trim();
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || "sans-serif";
}
