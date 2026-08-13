import { nanoid } from "nanoid";
import {
  DEFAULT_TEXT_EFFECT, NO_ANIM, NO_FILTERS, NO_SHADOW, solid,
  type Doc, type ImageLayer, type Layer, type PathLayer, type ShapeKind,
  type ShapeLayer, type TextLayer,
} from "./types";

function base(type: Layer["type"], name: string) {
  return {
    id: nanoid(10),
    type,
    name,
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    blend: "source-over" as const,
    shadow: { ...NO_SHADOW },
    anim: structuredClone(NO_ANIM),
    tiltX: 0,
    tiltY: 0,
  };
}

export function makeText(partial: Partial<TextLayer> = {}): TextLayer {
  return {
    ...base("text", partial.text?.slice(0, 24) || "Text"),
    type: "text",
    text: "Double-click to edit",
    fontFamily: "var(--font-bricolage)",
    fontSize: 64,
    fontWeight: 700,
    italic: false,
    underline: false,
    strikethrough: false,
    uppercase: false,
    align: "center",
    lineHeight: 1.15,
    letterSpacing: 0,
    fill: solid("#14120e"),
    effect: { ...DEFAULT_TEXT_EFFECT },
    curve: 0,
    width: 640,
    height: 90,
    ...partial,
  } as TextLayer;
}

export function makeShape(shape: ShapeKind, partial: Partial<ShapeLayer> = {}): ShapeLayer {
  return {
    ...base("shape", shape[0].toUpperCase() + shape.slice(1)),
    type: "shape",
    shape,
    fill: solid("#f04e23"),
    stroke: "#00000000",
    strokeWidth: 0,
    dash: [],
    cornerRadius: shape === "rect" ? 16 : 0,
    sides: shape === "star" ? 5 : shape === "burst" ? 12 : 6,
    innerRatio: 0.45,
    width: 320,
    height: 320,
    ...partial,
  } as ShapeLayer;
}

export function makeImage(
  src: string,
  naturalWidth: number,
  naturalHeight: number,
  partial: Partial<ImageLayer> = {},
): ImageLayer {
  return {
    ...base("image", "Image"),
    type: "image",
    src,
    originalSrc: src,
    naturalWidth,
    naturalHeight,
    filters: { ...NO_FILTERS },
    cornerRadius: 0,
    flipX: false,
    flipY: false,
    crop: null,
    backgroundRemoved: false,
    stroke: "#00000000",
    strokeWidth: 0,
    width: naturalWidth,
    height: naturalHeight,
    ...partial,
  } as ImageLayer;
}

export function makePath(d: string, viewBox: number, partial: Partial<PathLayer> = {}): PathLayer {
  return {
    ...base("path", "Graphic"),
    type: "path",
    d,
    viewBox,
    fill: solid("#14120e"),
    stroke: "#00000000",
    strokeWidth: 0,
    width: 180,
    height: 180,
    ...partial,
  } as PathLayer;
}

export function makeDoc(width = 1080, height = 1080, name = "Untitled design"): Doc {
  const now = Date.now();
  return {
    id: nanoid(12),
    name,
    width,
    height,
    background: { kind: "solid", color: "#faf7f0" },
    layers: [],
    duration: 5,
    createdAt: now,
    updatedAt: now,
  };
}

/** Fresh identity for a layer being duplicated or pasted. */
export function cloneLayer(layer: Layer, offset = 32): Layer {
  return {
    ...structuredClone(layer),
    id: nanoid(10),
    x: layer.x + offset,
    y: layer.y + offset,
  };
}
