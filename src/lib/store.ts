"use client";

import { create } from "zustand";
import { cloneLayer, makeDoc } from "./factories";
import type { Background, Doc, Layer, Tool } from "./types";

const HISTORY_LIMIT = 80;

type Snapshot = { doc: Doc; selected: string[] };

type State = {
  doc: Doc;
  selected: string[];
  tool: Tool;
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  showRulers: boolean;
  snapping: boolean;
  playing: boolean;
  playhead: number;
  darkUI: boolean;
  past: Snapshot[];
  future: Snapshot[];
  clipboard: Layer[];
  dirty: boolean;
};

type Actions = {
  /** Push the current state onto the undo stack. Call before a change. */
  commit: () => void;
  undo: () => void;
  redo: () => void;

  setDoc: (patch: Partial<Doc>, record?: boolean) => void;
  replaceDoc: (doc: Doc) => void;
  resize: (width: number, height: number) => void;
  setBackground: (bg: Background) => void;

  addLayer: (layer: Layer, opts?: { center?: boolean }) => void;
  addLayers: (layers: Layer[]) => void;
  updateLayer: (id: string, patch: Partial<Layer>, record?: boolean) => void;
  updateSelected: (patch: Partial<Layer>, record?: boolean) => void;
  removeLayers: (ids: string[]) => void;
  duplicateSelected: () => void;
  reorder: (id: string, toIndex: number) => void;
  nudgeOrder: (id: string, delta: number) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  select: (ids: string[]) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  copy: () => void;
  paste: () => void;

  align: (edge: "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom") => void;
  distribute: (axis: "h" | "v") => void;

  setTool: (tool: Tool) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  toggle: (key: "showGrid" | "showRulers" | "snapping" | "darkUI") => void;
  setPlaying: (playing: boolean) => void;
  setPlayhead: (t: number) => void;
  markClean: () => void;
};

export type EditorStore = State & Actions;

const snap = (s: State): Snapshot => ({
  doc: structuredClone(s.doc),
  selected: [...s.selected],
});

export const useEditor = create<EditorStore>()((set, get) => ({
  doc: makeDoc(),
  selected: [],
  tool: "select",
  zoom: 1,
  pan: { x: 0, y: 0 },
  showGrid: false,
  showRulers: true,
  snapping: true,
  playing: false,
  playhead: 0,
  darkUI: true,
  past: [],
  future: [],
  clipboard: [],
  dirty: false,

  commit: () =>
    set((s) => ({
      past: [...s.past, snap(s)].slice(-HISTORY_LIMIT),
      future: [],
      dirty: true,
    })),

  undo: () =>
    set((s) => {
      const prev = s.past[s.past.length - 1];
      if (!prev) return s;
      return {
        past: s.past.slice(0, -1),
        future: [snap(s), ...s.future].slice(0, HISTORY_LIMIT),
        doc: prev.doc,
        selected: prev.selected,
        dirty: true,
      };
    }),

  redo: () =>
    set((s) => {
      const next = s.future[0];
      if (!next) return s;
      return {
        future: s.future.slice(1),
        past: [...s.past, snap(s)].slice(-HISTORY_LIMIT),
        doc: next.doc,
        selected: next.selected,
        dirty: true,
      };
    }),

  setDoc: (patch, record = true) => {
    if (record) get().commit();
    set((s) => ({ doc: { ...s.doc, ...patch, updatedAt: Date.now() }, dirty: true }));
  },

  replaceDoc: (doc) =>
    set({ doc, selected: [], past: [], future: [], playhead: 0, playing: false, dirty: false }),

  resize: (width, height) => {
    get().commit();
    set((s) => {
      const sx = width / s.doc.width;
      const sy = height / s.doc.height;
      // Rescale rather than crop, so a resize never quietly loses artwork.
      const layers = s.doc.layers.map((l) => ({
        ...l,
        x: l.x * sx,
        y: l.y * sy,
        width: l.width * sx,
        height: l.height * sy,
        ...(l.type === "text" ? { fontSize: (l as never as { fontSize: number }).fontSize * Math.min(sx, sy) } : {}),
      })) as Layer[];
      return { doc: { ...s.doc, width, height, layers, updatedAt: Date.now() }, dirty: true };
    });
  },

  setBackground: (background) => {
    get().commit();
    set((s) => ({ doc: { ...s.doc, background, updatedAt: Date.now() }, dirty: true }));
  },

  addLayer: (layer, opts) => {
    get().commit();
    set((s) => {
      const placed = opts?.center === false
        ? layer
        : { ...layer, x: (s.doc.width - layer.width) / 2, y: (s.doc.height - layer.height) / 2 };
      return {
        doc: { ...s.doc, layers: [...s.doc.layers, placed], updatedAt: Date.now() },
        selected: [placed.id],
        dirty: true,
      };
    });
  },

  addLayers: (layers) => {
    get().commit();
    set((s) => ({
      doc: { ...s.doc, layers: [...s.doc.layers, ...layers], updatedAt: Date.now() },
      selected: layers.map((l) => l.id),
      dirty: true,
    }));
  },

  updateLayer: (id, patch, record = true) => {
    if (record) get().commit();
    set((s) => ({
      doc: {
        ...s.doc,
        layers: s.doc.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
        updatedAt: Date.now(),
      },
      dirty: true,
    }));
  },

  updateSelected: (patch, record = true) => {
    if (record) get().commit();
    set((s) => ({
      doc: {
        ...s.doc,
        layers: s.doc.layers.map((l) =>
          s.selected.includes(l.id) && !l.locked ? ({ ...l, ...patch } as Layer) : l,
        ),
        updatedAt: Date.now(),
      },
      dirty: true,
    }));
  },

  removeLayers: (ids) => {
    get().commit();
    set((s) => ({
      doc: { ...s.doc, layers: s.doc.layers.filter((l) => !ids.includes(l.id)), updatedAt: Date.now() },
      selected: s.selected.filter((id) => !ids.includes(id)),
      dirty: true,
    }));
  },

  duplicateSelected: () => {
    const { selected, doc } = get();
    if (!selected.length) return;
    get().commit();
    const copies = doc.layers.filter((l) => selected.includes(l.id)).map((l) => cloneLayer(l));
    set((s) => ({
      doc: { ...s.doc, layers: [...s.doc.layers, ...copies], updatedAt: Date.now() },
      selected: copies.map((c) => c.id),
      dirty: true,
    }));
  },

  reorder: (id, toIndex) => {
    get().commit();
    set((s) => {
      const layers = [...s.doc.layers];
      const from = layers.findIndex((l) => l.id === id);
      if (from < 0) return s;
      const [moved] = layers.splice(from, 1);
      layers.splice(Math.max(0, Math.min(toIndex, layers.length)), 0, moved);
      return { doc: { ...s.doc, layers, updatedAt: Date.now() }, dirty: true };
    });
  },

  nudgeOrder: (id, delta) => {
    const { doc } = get();
    const index = doc.layers.findIndex((l) => l.id === id);
    if (index < 0) return;
    get().reorder(id, index + delta);
  },

  bringToFront: (id) => get().reorder(id, get().doc.layers.length),
  sendToBack: (id) => get().reorder(id, 0),

  select: (ids) => set({ selected: ids }),
  toggleSelect: (id) =>
    set((s) => ({
      selected: s.selected.includes(id) ? s.selected.filter((i) => i !== id) : [...s.selected, id],
    })),
  selectAll: () => set((s) => ({ selected: s.doc.layers.filter((l) => !l.locked).map((l) => l.id) })),
  clearSelection: () => set({ selected: [] }),

  copy: () => {
    const { doc, selected } = get();
    set({ clipboard: doc.layers.filter((l) => selected.includes(l.id)).map((l) => structuredClone(l)) });
  },

  paste: () => {
    const { clipboard } = get();
    if (!clipboard.length) return;
    get().commit();
    const copies = clipboard.map((l) => cloneLayer(l, 40));
    set((s) => ({
      doc: { ...s.doc, layers: [...s.doc.layers, ...copies], updatedAt: Date.now() },
      selected: copies.map((c) => c.id),
      clipboard: copies.map((c) => structuredClone(c)),
      dirty: true,
    }));
  },

  align: (edge) => {
    const { doc, selected } = get();
    const picked = doc.layers.filter((l) => selected.includes(l.id));
    if (!picked.length) return;
    get().commit();

    // One layer aligns to the artboard; several align to their shared bounds.
    const bounds = picked.length === 1
      ? { left: 0, top: 0, right: doc.width, bottom: doc.height }
      : {
          left: Math.min(...picked.map((l) => l.x)),
          top: Math.min(...picked.map((l) => l.y)),
          right: Math.max(...picked.map((l) => l.x + l.width)),
          bottom: Math.max(...picked.map((l) => l.y + l.height)),
        };

    set((s) => ({
      doc: {
        ...s.doc,
        layers: s.doc.layers.map((l) => {
          if (!selected.includes(l.id) || l.locked) return l;
          switch (edge) {
            case "left": return { ...l, x: bounds.left };
            case "right": return { ...l, x: bounds.right - l.width };
            case "hcenter": return { ...l, x: (bounds.left + bounds.right - l.width) / 2 };
            case "top": return { ...l, y: bounds.top };
            case "bottom": return { ...l, y: bounds.bottom - l.height };
            case "vcenter": return { ...l, y: (bounds.top + bounds.bottom - l.height) / 2 };
          }
        }),
        updatedAt: Date.now(),
      },
      dirty: true,
    }));
  },

  distribute: (axis) => {
    const { doc, selected } = get();
    const picked = doc.layers.filter((l) => selected.includes(l.id));
    if (picked.length < 3) return;
    get().commit();

    const key = axis === "h" ? "x" : "y";
    const span = axis === "h" ? "width" : "height";
    const sorted = [...picked].sort((a, b) => a[key] - b[key]);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const free = last[key] - first[key] - sorted.slice(1, -1).reduce((sum, l) => sum + l[span], 0)
      + first[span] - first[span];
    const gap = free / (sorted.length - 1);

    let cursor = first[key] + first[span];
    const positions = new Map<string, number>();
    for (const l of sorted.slice(1, -1)) {
      cursor += gap - first[span] / (sorted.length - 1) * 0;
      positions.set(l.id, cursor);
      cursor += l[span];
    }

    set((s) => ({
      doc: {
        ...s.doc,
        layers: s.doc.layers.map((l) =>
          positions.has(l.id) ? ({ ...l, [key]: positions.get(l.id)! } as Layer) : l,
        ),
        updatedAt: Date.now(),
      },
      dirty: true,
    }));
  },

  setTool: (tool) => set({ tool }),
  setZoom: (zoom) => set({ zoom: Math.max(0.02, Math.min(zoom, 16)) }),
  setPan: (pan) => set({ pan }),
  toggle: (key) => set((s) => ({ [key]: !s[key] }) as Partial<State>),
  setPlaying: (playing) => set({ playing }),
  setPlayhead: (playhead) => set({ playhead }),
  markClean: () => set({ dirty: false }),
}));

/** Convenience selector: the single selected layer, or null for 0 or many. */
export function useSingleSelection(): Layer | null {
  return useEditor((s) =>
    s.selected.length === 1 ? s.doc.layers.find((l) => l.id === s.selected[0]) ?? null : null,
  );
}
