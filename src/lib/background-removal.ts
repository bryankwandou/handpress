"use client";

/**
 * Cutouts run through the same ISNet segmentation model that powers Removix.
 * The inference happens in this tab via WebAssembly — the picture is never
 * uploaded anywhere. The model weights are fetched once, then the service
 * worker keeps them on disk so later cutouts work with the network off.
 */

export type CutoutProgress = {
  stage: "fetching model" | "preparing" | "segmenting" | "compositing" | "done";
  ratio: number;
};

let warmed: Promise<unknown> | null = null;

/** Pull the model down ahead of time so the first cutout is not the slow one. */
export function warmUpCutout(): Promise<unknown> {
  if (!warmed) {
    warmed = import("@imgly/background-removal").catch((e) => {
      warmed = null;
      throw e;
    });
  }
  return warmed;
}

function toBlob(src: string): Promise<Blob> {
  if (src.startsWith("data:")) {
    const [meta, data] = src.split(",");
    const mime = meta.match(/:(.*?);/)?.[1] ?? "image/png";
    const bin = atob(data);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return Promise.resolve(new Blob([bytes], { type: mime }));
  }
  return fetch(src).then((r) => r.blob());
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("The cutout could not be encoded."));
    reader.readAsDataURL(blob);
  });
}

export async function removeBackground(
  src: string,
  onProgress?: (p: CutoutProgress) => void,
): Promise<string> {
  onProgress?.({ stage: "fetching model", ratio: 0.05 });

  const mod = (await warmUpCutout()) as typeof import("@imgly/background-removal");

  onProgress?.({ stage: "preparing", ratio: 0.15 });
  const input = await toBlob(src);

  onProgress?.({ stage: "segmenting", ratio: 0.3 });
  const output = await mod.removeBackground(input, {
    output: { format: "image/png", quality: 0.92 },
    progress: (key: string, current: number, total: number) => {
      const ratio = total > 0 ? current / total : 0;
      if (key.startsWith("fetch")) {
        onProgress?.({ stage: "fetching model", ratio: 0.05 + ratio * 0.25 });
      } else {
        onProgress?.({ stage: "segmenting", ratio: 0.3 + ratio * 0.6 });
      }
    },
  });

  onProgress?.({ stage: "compositing", ratio: 0.95 });
  const dataUrl = await blobToDataUrl(output);
  onProgress?.({ stage: "done", ratio: 1 });
  return dataUrl;
}

/* ------------------------------------------------- canvas-only utilities */

/**
 * A fast chroma-style knockout for flat backgrounds. Useful when the subject
 * sits on a solid colour and the full model would be overkill.
 */
export async function removeFlatColour(src: string, tolerance = 34): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = data.data;

  // Sample the four corners and treat the average as the colour to drop.
  const corners = [
    0,
    (canvas.width - 1) * 4,
    (canvas.height - 1) * canvas.width * 4,
    ((canvas.height - 1) * canvas.width + canvas.width - 1) * 4,
  ];
  let r = 0, g = 0, b = 0;
  for (const c of corners) {
    r += px[c]; g += px[c + 1]; b += px[c + 2];
  }
  r /= 4; g /= 4; b /= 4;

  const limit = tolerance * tolerance * 3;
  for (let i = 0; i < px.length; i += 4) {
    const dr = px[i] - r, dg = px[i + 1] - g, db = px[i + 2] - b;
    const dist = dr * dr + dg * dg + db * db;
    if (dist < limit) {
      px[i + 3] = 0;
    } else if (dist < limit * 2.2) {
      // Feather the rim so the cut does not look like scissors work.
      px[i + 3] = Math.round(px[i + 3] * ((dist - limit) / (limit * 1.2)));
    }
  }

  ctx.putImageData(data, 0, 0);
  return canvas.toDataURL("image/png");
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The image could not be loaded."));
    img.src = src;
  });
}

/** Trim fully transparent margins after a cutout so the box hugs the subject. */
export async function trimTransparent(src: string): Promise<{ src: string; width: number; height: number }> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let top = canvas.height, left = canvas.width, right = 0, bottom = 0;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (data[(y * canvas.width + x) * 4 + 3] > 8) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  if (right <= left || bottom <= top) {
    return { src, width: canvas.width, height: canvas.height };
  }

  const w = right - left + 1;
  const h = bottom - top + 1;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d")!.drawImage(canvas, left, top, w, h, 0, 0, w, h);
  return { src: out.toDataURL("image/png"), width: w, height: h };
}
