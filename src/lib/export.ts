"use client";

import type Konva from "konva";
import { SHAPE_PATHS, curvePath, resolveFont, textEffectPasses } from "./konva-helpers";
import { downloadBlob, slug } from "./storage";
import type { Doc, Fill, ImageLayer, PathLayer, ShapeLayer, TextLayer } from "./types";

export type RasterFormat = "png" | "jpeg" | "webp";
export type VideoFormat = "webm" | "mp4";

/* ---------------------------------------------------------------- raster */

/**
 * Render the artboard at a multiple of its own pixel size. Nothing is stamped
 * onto the output — the file that lands in the downloads folder is the design
 * and nothing else.
 */
export async function renderRaster(
  stage: Konva.Stage,
  doc: Doc,
  format: RasterFormat,
  scale: number,
  quality = 0.92,
): Promise<Blob> {
  const canvas = stage.toCanvas({
    x: 0,
    y: 0,
    width: doc.width,
    height: doc.height,
    pixelRatio: scale,
  });

  // JPEG has no alpha, so a transparent board would come out black.
  if (format === "jpeg") {
    const flat = document.createElement("canvas");
    flat.width = canvas.width;
    flat.height = canvas.height;
    const ctx = flat.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, flat.width, flat.height);
    ctx.drawImage(canvas, 0, 0);
    return canvasToBlob(flat, "image/jpeg", quality);
  }

  return canvasToBlob(canvas, `image/${format}`, quality);
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The canvas could not be encoded."))),
      type,
      quality,
    );
  });
}

/** Small preview bitmap for the project list. */
export function thumbnail(stage: Konva.Stage, doc: Doc, maxEdge = 320): string {
  const ratio = maxEdge / Math.max(doc.width, doc.height);
  return stage.toDataURL({ x: 0, y: 0, width: doc.width, height: doc.height, pixelRatio: ratio });
}

/* ------------------------------------------------------------------- pdf */

export async function exportPdf(stage: Konva.Stage, doc: Doc, dpi = 300): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const scale = Math.min(4, Math.max(1, dpi / 96));
  const blob = await renderRaster(stage, doc, "jpeg", scale, 0.96);
  const dataUrl = await blobToDataUrl(blob);

  // Points, so the page measures the same as the artboard at 72 dpi.
  const wPt = (doc.width / 96) * 72;
  const hPt = (doc.height / 96) * 72;

  const pdf = new jsPDF({
    orientation: wPt > hPt ? "landscape" : "portrait",
    unit: "pt",
    format: [wPt, hPt],
    compress: true,
  });
  pdf.addImage(dataUrl, "JPEG", 0, 0, wPt, hPt, undefined, "FAST");
  pdf.save(`${slug(doc.name)}.pdf`);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Encoding failed."));
    r.readAsDataURL(blob);
  });
}

/* ------------------------------------------------------------------- svg */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function fillDef(fill: Fill, id: string): { def: string; ref: string } {
  if (fill.kind === "solid") return { def: "", ref: fill.color };
  const stops = fill.stops
    .slice()
    .sort((a, b) => a.offset - b.offset)
    .map((s) => `<stop offset="${(s.offset * 100).toFixed(2)}%" stop-color="${s.color}"/>`)
    .join("");

  if (fill.type === "radial") {
    return {
      def: `<radialGradient id="${id}" cx="50%" cy="50%" r="70%">${stops}</radialGradient>`,
      ref: `url(#${id})`,
    };
  }
  const rad = (fill.angle * Math.PI) / 180;
  const x1 = (50 - Math.cos(rad) * 50).toFixed(2);
  const y1 = (50 - Math.sin(rad) * 50).toFixed(2);
  const x2 = (50 + Math.cos(rad) * 50).toFixed(2);
  const y2 = (50 + Math.sin(rad) * 50).toFixed(2);
  return {
    def: `<linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`,
    ref: `url(#${id})`,
  };
}

/**
 * A true vector file rather than a bitmap in an SVG wrapper. Text stays text,
 * shapes stay paths, so the result can be reopened and edited elsewhere.
 */
export function renderSvg(doc: Doc): string {
  const defs: string[] = [];
  const body: string[] = [];

  // Background
  if (doc.background.kind === "solid") {
    body.push(`<rect width="${doc.width}" height="${doc.height}" fill="${doc.background.color}"/>`);
  } else if (doc.background.kind === "gradient") {
    const { def, ref } = fillDef(doc.background.gradient, "bg");
    defs.push(def);
    body.push(`<rect width="${doc.width}" height="${doc.height}" fill="${ref}"/>`);
  } else {
    body.push(
      `<image href="${doc.background.src}" width="${doc.width}" height="${doc.height}" preserveAspectRatio="${
        doc.background.fit === "contain" ? "xMidYMid meet" : "xMidYMid slice"
      }"/>`,
    );
  }

  doc.layers.forEach((layer, index) => {
    if (!layer.visible) return;
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;
    const transform = `translate(${layer.x} ${layer.y}) rotate(${layer.rotation} ${layer.width / 2} ${layer.height / 2})`;
    const open = `<g transform="${transform}" opacity="${layer.opacity}" style="mix-blend-mode:${layer.blend === "source-over" ? "normal" : layer.blend}">`;

    if (layer.type === "text") {
      body.push(open + textSvg(layer, index, defs) + "</g>");
    } else if (layer.type === "shape") {
      body.push(open + shapeSvg(layer, index, defs) + "</g>");
    } else if (layer.type === "image") {
      body.push(open + imageSvg(layer, index, defs) + "</g>");
    } else if (layer.type === "path") {
      body.push(open + pathSvg(layer, index, defs) + "</g>");
    }
    void cx; void cy;
  });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${doc.width}" height="${doc.height}" viewBox="0 0 ${doc.width} ${doc.height}">`,
    `<title>${esc(doc.name)}</title>`,
    defs.length ? `<defs>${defs.join("")}</defs>` : "",
    body.join("\n"),
    `</svg>`,
  ].join("\n");
}

function textSvg(layer: TextLayer, index: number, defs: string[]): string {
  const family = resolveFont(layer.fontFamily);
  const content = layer.uppercase ? layer.text.toUpperCase() : layer.text;
  const baseColor = layer.fill.kind === "solid" ? layer.fill.color : "#000000";
  const { def, ref } = fillDef(layer.fill, `txt${index}`);
  if (def) defs.push(def);

  const anchor = layer.align === "center" ? "middle" : layer.align === "right" ? "end" : "start";
  const ax = layer.align === "center" ? layer.width / 2 : layer.align === "right" ? layer.width : 0;

  const attrs = [
    `font-family="${esc(family)}"`,
    `font-size="${layer.fontSize}"`,
    `font-weight="${layer.fontWeight}"`,
    layer.italic ? `font-style="italic"` : "",
    `letter-spacing="${layer.letterSpacing}"`,
    `text-anchor="${anchor}"`,
    layer.underline ? `text-decoration="underline"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (layer.curve !== 0) {
    const pathId = `curve${index}`;
    defs.push(`<path id="${pathId}" d="${curvePath(layer.width, layer.curve)}" fill="none"/>`);
    return `<text ${attrs} fill="${ref}"><textPath href="#${pathId}" startOffset="${anchor === "middle" ? "50%" : "0%"}">${esc(content)}</textPath></text>`;
  }

  const lines = content.split("\n");
  const lineHeight = layer.fontSize * layer.lineHeight;

  const drawPass = (dx: number, dy: number, fill: string, stroke?: string, strokeWidth?: number, opacity = 1) =>
    `<text ${attrs} x="${ax + dx}" y="${dy + layer.fontSize * 0.86}" ` +
    `fill="${fill === "transparent" ? "none" : fill}" ` +
    (stroke ? `stroke="${stroke}" stroke-width="${strokeWidth ?? 1}" paint-order="stroke" ` : "") +
    `opacity="${opacity}">` +
    lines
      .map((line, i) => `<tspan x="${ax + dx}" dy="${i === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`)
      .join("") +
    `</text>`;

  const passes = textEffectPasses(layer, baseColor);
  return passes
    .map((p, i) =>
      i === passes.length - 1 && layer.fill.kind === "gradient"
        ? drawPass(p.dx, p.dy, ref, p.stroke, p.strokeWidth, p.opacity)
        : drawPass(p.dx, p.dy, p.fill, p.stroke, p.strokeWidth, p.opacity),
    )
    .join("");
}

function shapeSvg(layer: ShapeLayer, index: number, defs: string[]): string {
  const { def, ref } = fillDef(layer.fill, `shp${index}`);
  if (def) defs.push(def);
  const w = layer.width;
  const h = layer.height;
  const stroke = layer.strokeWidth > 0 ? ` stroke="${layer.stroke}" stroke-width="${layer.strokeWidth}"` : "";
  const paint = ` fill="${ref}"${stroke}`;

  switch (layer.shape) {
    case "rect":
      return `<rect width="${w}" height="${h}" rx="${layer.cornerRadius}"${paint}/>`;
    case "ellipse":
      return `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}"${paint}/>`;
    case "triangle":
      return `<polygon points="${w / 2},0 ${w},${h} 0,${h}"${paint}/>`;
    case "line":
      return `<line x1="0" y1="${h / 2}" x2="${w}" y2="${h / 2}" stroke="${layer.fill.kind === "solid" ? layer.fill.color : "#000"}" stroke-width="${Math.max(layer.strokeWidth, 4)}" stroke-linecap="round"/>`;
    case "polygon":
    case "star":
    case "burst": {
      const points = polygonPoints(layer);
      return `<polygon points="${points}"${paint}/>`;
    }
    default: {
      const d = SHAPE_PATHS[layer.shape];
      if (!d) return `<rect width="${w}" height="${h}"${paint}/>`;
      return `<path d="${d}" transform="scale(${w / 100} ${h / 100})"${paint}/>`;
    }
  }
}

function polygonPoints(layer: ShapeLayer): string {
  const cx = layer.width / 2;
  const cy = layer.height / 2;
  const rx = layer.width / 2;
  const ry = layer.height / 2;
  const n = Math.max(3, layer.sides);
  const starLike = layer.shape === "star" || layer.shape === "burst";
  const inner = layer.shape === "burst" ? 0.78 : layer.innerRatio;
  const count = starLike ? n * 2 : n;
  const pts: string[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const k = starLike && i % 2 === 1 ? inner : 1;
    pts.push(`${(cx + Math.cos(angle) * rx * k).toFixed(2)},${(cy + Math.sin(angle) * ry * k).toFixed(2)}`);
  }
  return pts.join(" ");
}

function imageSvg(layer: ImageLayer, index: number, defs: string[]): string {
  const clip = layer.cornerRadius > 0 ? ` clip-path="url(#clip${index})"` : "";
  if (layer.cornerRadius > 0) {
    defs.push(
      `<clipPath id="clip${index}"><rect width="${layer.width}" height="${layer.height}" rx="${layer.cornerRadius}"/></clipPath>`,
    );
  }
  const f = layer.filters;
  const filterParts: string[] = [];
  if (f.grayscale > 0) filterParts.push(`grayscale(${f.grayscale}%)`);
  if (f.sepia > 0) filterParts.push(`sepia(${f.sepia}%)`);
  if (f.invert > 0) filterParts.push(`invert(${f.invert}%)`);
  if (f.brightness !== 0) filterParts.push(`brightness(${100 + f.brightness}%)`);
  if (f.contrast !== 0) filterParts.push(`contrast(${100 + f.contrast}%)`);
  if (f.saturation !== 0) filterParts.push(`saturate(${100 + f.saturation}%)`);
  if (f.hue !== 0) filterParts.push(`hue-rotate(${f.hue}deg)`);
  if (f.blur > 0) filterParts.push(`blur(${f.blur}px)`);
  const style = filterParts.length ? ` style="filter:${filterParts.join(" ")}"` : "";

  return `<image href="${layer.src}" width="${layer.width}" height="${layer.height}" preserveAspectRatio="none"${clip}${style}/>`;
}

function pathSvg(layer: PathLayer, index: number, defs: string[]): string {
  const { def, ref } = fillDef(layer.fill, `pth${index}`);
  if (def) defs.push(def);
  const stroke = layer.strokeWidth > 0 ? ` stroke="${layer.stroke}" stroke-width="${layer.strokeWidth}"` : "";
  return `<path d="${layer.d}" transform="scale(${layer.width / layer.viewBox} ${layer.height / layer.viewBox})" fill="${ref}"${stroke}/>`;
}

export function downloadSvg(doc: Doc): void {
  const blob = new Blob([renderSvg(doc)], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, `${slug(doc.name)}.svg`);
}

/* ----------------------------------------------------------------- video */

export function supportedVideoTypes(): { format: VideoFormat; mime: string; label: string }[] {
  const candidates: { format: VideoFormat; mime: string; label: string }[] = [
    { format: "mp4", mime: "video/mp4;codecs=avc1.42E01E", label: "MP4 (H.264)" },
    { format: "webm", mime: "video/webm;codecs=vp9", label: "WebM (VP9)" },
    { format: "webm", mime: "video/webm;codecs=vp8", label: "WebM (VP8)" },
  ];
  if (typeof MediaRecorder === "undefined") return [];
  return candidates.filter((c) => MediaRecorder.isTypeSupported(c.mime));
}

export type VideoOptions = {
  fps: number;
  scale: number;
  mime: string;
  bitrate: number;
  onProgress?: (ratio: number) => void;
};

/**
 * Frame-accurate capture. The recorder is driven one frame at a time rather
 * than in wall-clock time, so a slow machine produces the same file as a fast
 * one instead of a stuttering recording of the preview.
 */
export async function renderVideo(
  stage: Konva.Stage,
  doc: Doc,
  seekTo: (t: number) => Promise<void>,
  opts: VideoOptions,
): Promise<Blob> {
  const width = Math.round(doc.width * opts.scale);
  const height = Math.round(doc.height * opts.scale);

  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d")!;

  const stream = out.captureStream(0);
  const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack;

  const recorder = new MediaRecorder(stream, {
    mimeType: opts.mime,
    videoBitsPerSecond: opts.bitrate,
  });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

  const finished = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: opts.mime.split(";")[0] }));
  });

  recorder.start();

  const total = Math.max(1, Math.round(doc.duration * opts.fps));
  for (let i = 0; i < total; i++) {
    const t = i / opts.fps;
    await seekTo(t);
    const frame = stage.toCanvas({
      x: 0,
      y: 0,
      width: doc.width,
      height: doc.height,
      pixelRatio: opts.scale,
    });
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(frame, 0, 0, width, height);
    track.requestFrame();
    opts.onProgress?.(i / total);
    // Yield so the recorder can drain and the tab stays responsive.
    await new Promise((r) => setTimeout(r, 0));
  }

  opts.onProgress?.(1);
  await new Promise((r) => setTimeout(r, 120));
  recorder.stop();
  return finished;
}

type CanvasCaptureMediaStreamTrack = MediaStreamTrack & { requestFrame: () => void };
