"use client";

import { del, get, keys, set } from "idb-keyval";
import type { Doc } from "./types";

/**
 * Projects live in IndexedDB on the machine that made them. There is no
 * server, no account, and nothing leaves the browser unless the person
 * exporting it says so.
 */

const KEY = (id: string) => `hp:doc:${id}`;
const INDEX = "hp:index";
const LAST = "hp:last";

export type DocSummary = {
  id: string;
  name: string;
  width: number;
  height: number;
  updatedAt: number;
  thumb?: string;
};

export async function saveDoc(doc: Doc, thumb?: string): Promise<void> {
  await set(KEY(doc.id), doc);
  const index = ((await get<DocSummary[]>(INDEX)) ?? []).filter((d) => d.id !== doc.id);
  index.unshift({
    id: doc.id,
    name: doc.name,
    width: doc.width,
    height: doc.height,
    updatedAt: Date.now(),
    thumb,
  });
  await set(INDEX, index.slice(0, 200));
  await set(LAST, doc.id);
}

export async function loadDoc(id: string): Promise<Doc | undefined> {
  return get<Doc>(KEY(id));
}

export async function listDocs(): Promise<DocSummary[]> {
  const index = (await get<DocSummary[]>(INDEX)) ?? [];
  return index.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteDoc(id: string): Promise<void> {
  await del(KEY(id));
  const index = ((await get<DocSummary[]>(INDEX)) ?? []).filter((d) => d.id !== id);
  await set(INDEX, index);
}

export async function lastDocId(): Promise<string | undefined> {
  return get<string>(LAST);
}

export async function storageUsage(): Promise<{ count: number; bytes: number }> {
  const all = await keys();
  const docKeys = all.filter((k) => String(k).startsWith("hp:doc:"));
  let bytes = 0;
  if (navigator.storage?.estimate) {
    const est = await navigator.storage.estimate();
    bytes = est.usage ?? 0;
  }
  return { count: docKeys.length, bytes };
}

/* -------------------------------------------------- file import / export */

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function exportProjectFile(doc: Doc): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${slug(doc.name)}.handpress.json`);
}

export async function importProjectFile(file: File): Promise<Doc> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Doc;
  if (!parsed.layers || typeof parsed.width !== "number") {
    throw new Error("That file is not a Handpress project.");
  }
  return parsed;
}

export function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "handpress-design"
  );
}

/** Read an uploaded image as a data URL plus its intrinsic size. */
export function readImageFile(file: File): Promise<{ src: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => resolve({ src, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("That image could not be decoded."));
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
