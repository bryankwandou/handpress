"use client";

import { clsx } from "clsx";
import type Konva from "konva";
import {
  Blocks, Check, Download, Frame, Grid3x3, Hand, Image as ImageIcon, Keyboard,
  LayoutTemplate, Layers as LayersIcon, Magnet, Maximize, Minus, MousePointer2,
  Moon, PanelLeftClose, Plus, Redo2, Save, Sun, Type as TypeIcon, Undo2, Wallpaper,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HandpressMark } from "@/components/brand/logo";
import { Button, IconButton } from "@/components/ui/primitives";
import { thumbnail } from "@/lib/export";
import { KEY_HELP } from "@/lib/presets";
import { useEditor } from "@/lib/store";
import { importProjectFile, readImageFile, saveDoc } from "@/lib/storage";
import { makeImage, makeShape, makeText } from "@/lib/factories";
import { ExportDialog } from "./ExportDialog";
import { Inspector } from "./Inspector";
import {
  BackgroundPanel, ElementsPanel, LayersPanel, ProjectsPanel, ResizePanel,
  TemplatesPanel, TextPanel, UploadsPanel,
} from "./panels";
import { Timeline } from "./Timeline";

const CanvasStage = dynamic(() => import("./CanvasStage").then((m) => m.CanvasStage), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center">
      <span className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-3">Warming the press</span>
    </div>
  ),
});

type PanelKey = "templates" | "text" | "elements" | "uploads" | "background" | "layers" | "resize" | "projects";

const RAIL: { key: PanelKey; label: string; icon: React.ReactNode }[] = [
  { key: "templates", label: "Templates", icon: <LayoutTemplate className="h-[1.15rem] w-[1.15rem]" /> },
  { key: "text", label: "Type", icon: <TypeIcon className="h-[1.15rem] w-[1.15rem]" /> },
  { key: "elements", label: "Elements", icon: <Blocks className="h-[1.15rem] w-[1.15rem]" /> },
  { key: "uploads", label: "Uploads", icon: <ImageIcon className="h-[1.15rem] w-[1.15rem]" /> },
  { key: "background", label: "Background", icon: <Wallpaper className="h-[1.15rem] w-[1.15rem]" /> },
  { key: "resize", label: "Size", icon: <Frame className="h-[1.15rem] w-[1.15rem]" /> },
  { key: "layers", label: "Layers", icon: <LayersIcon className="h-[1.15rem] w-[1.15rem]" /> },
  { key: "projects", label: "Saved work", icon: <Save className="h-[1.15rem] w-[1.15rem]" /> },
];

export function EditorShell() {
  const doc = useEditor((s) => s.doc);
  const zoom = useEditor((s) => s.zoom);
  const tool = useEditor((s) => s.tool);
  const showGrid = useEditor((s) => s.showGrid);
  const snapping = useEditor((s) => s.snapping);
  const darkUI = useEditor((s) => s.darkUI);
  const dirty = useEditor((s) => s.dirty);
  const past = useEditor((s) => s.past.length);
  const future = useEditor((s) => s.future.length);

  const setDoc = useEditor((s) => s.setDoc);
  const setTool = useEditor((s) => s.setTool);
  const setZoom = useEditor((s) => s.setZoom);
  const setPan = useEditor((s) => s.setPan);
  const toggle = useEditor((s) => s.toggle);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const markClean = useEditor((s) => s.markClean);
  const replaceDoc = useEditor((s) => s.replaceDoc);

  const [panel, setPanel] = useState<PanelKey | null>("templates");
  const [stage, setStage] = useState<Konva.Stage | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------ theming */

  useEffect(() => {
    document.documentElement.dataset.theme = darkUI ? "dark" : "light";
  }, [darkUI]);

  /* ------------------------------------------------------------- fit view */

  const fitToView = useCallback(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const pad = 88;
    const next = Math.min(
      (el.clientWidth - pad) / doc.width,
      (el.clientHeight - pad) / doc.height,
    );
    const clamped = Math.max(0.02, Math.min(next, 4));
    setZoom(clamped);
    setPan({
      x: (el.clientWidth - doc.width * clamped) / 2,
      y: (el.clientHeight - doc.height * clamped) / 2,
    });
  }, [doc.width, doc.height, setZoom, setPan]);

  useEffect(() => {
    const id = setTimeout(fitToView, 60);
    return () => clearTimeout(id);
  }, [fitToView]);

  /* --------------------------------------------------------------- saving */

  const save = useCallback(async () => {
    const thumb = stage ? thumbnail(stage, doc) : undefined;
    await saveDoc(doc, thumb);
    markClean();
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }, [doc, stage, markClean]);

  // Quiet autosave so a closed tab never costs an afternoon of work.
  useEffect(() => {
    if (!dirty) return;
    const id = setTimeout(() => void save(), 12000);
    return () => clearTimeout(id);
  }, [dirty, save]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (useEditor.getState().dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  /* ------------------------------------------------------------ shortcuts */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable;
      const s = useEditor.getState();
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); void save(); return; }
      if (mod && e.key.toLowerCase() === "e") { e.preventDefault(); setExporting(true); return; }
      if (typing) return;

      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? s.redo() : s.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); s.redo(); return; }
      if (mod && e.key.toLowerCase() === "d") { e.preventDefault(); s.duplicateSelected(); return; }
      if (mod && e.key.toLowerCase() === "c") { s.copy(); return; }
      if (mod && e.key.toLowerCase() === "v") { s.paste(); return; }
      if (mod && e.key.toLowerCase() === "a") { e.preventDefault(); s.selectAll(); return; }
      if (mod && e.key.toLowerCase() === "g") { e.preventDefault(); s.toggle("showGrid"); return; }
      if (mod && e.key === "0") { e.preventDefault(); fitToView(); return; }
      if (mod && (e.key === "=" || e.key === "+")) { e.preventDefault(); s.setZoom(s.zoom * 1.2); return; }
      if (mod && e.key === "-") { e.preventDefault(); s.setZoom(s.zoom / 1.2); return; }
      if (mod && e.key === "]") { e.preventDefault(); s.selected.forEach((id) => s.nudgeOrder(id, 1)); return; }
      if (mod && e.key === "[") { e.preventDefault(); s.selected.forEach((id) => s.nudgeOrder(id, -1)); return; }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (s.selected.length) { e.preventDefault(); s.removeLayers(s.selected); }
        return;
      }
      if (e.key === "Escape") { s.clearSelection(); return; }

      if (e.key.startsWith("Arrow") && s.selected.length) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0;
        const dy = e.key === "ArrowDown" ? step : e.key === "ArrowUp" ? -step : 0;
        s.commit();
        s.selected.forEach((id) => {
          const l = s.doc.layers.find((x) => x.id === id);
          if (l) s.updateLayer(id, { x: l.x + dx, y: l.y + dy }, false);
        });
        return;
      }

      switch (e.key.toLowerCase()) {
        case "v": s.setTool("select"); break;
        case "h": s.setTool("hand"); break;
        case "t": s.addLayer(makeText()); break;
        case "r": s.addLayer(makeShape("rect")); break;
        case "o": s.addLayer(makeShape("ellipse")); break;
        case "?": setShowKeys((v) => !v); break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fitToView, save]);

  /* ------------------------------------------------------ paste and drop */

  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      if (!item) return;
      const file = item.getAsFile();
      if (!file) return;
      const { src, width, height } = await readImageFile(file);
      const s = useEditor.getState();
      const fit = Math.min((s.doc.width * 0.8) / width, (s.doc.height * 0.8) / height, 1);
      s.addLayer(makeImage(src, width, height, { width: width * fit, height: height * fit }));
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.name.endsWith(".json")) {
      try { replaceDoc(await importProjectFile(file)); } catch { /* ignore a file that is not ours */ }
      return;
    }
    if (!file.type.startsWith("image/")) return;
    const { src, width, height } = await readImageFile(file);
    const s = useEditor.getState();
    const fit = Math.min((s.doc.width * 0.8) / width, (s.doc.height * 0.8) / height, 1);
    s.addLayer(makeImage(src, width, height, { width: width * fit, height: height * fit }));
  };

  /* --------------------------------------------------------------- render */

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden surface-0" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      {/* Top bar */}
      <header className="flex h-13 shrink-0 items-center gap-2 border-b border-[var(--hairline)] surface-1 px-3 py-2">
        <Link href="/" className="mr-1 flex items-center gap-2 rounded-lg px-1.5 py-1 text-1 hover:bg-[var(--surface-2)]">
          <HandpressMark size={24} title="Handpress home" />
          <span className="hidden font-display text-[0.92rem] font-semibold tracking-[-0.04em] sm:inline">Handpress</span>
        </Link>

        <input
          value={doc.name}
          onChange={(e) => setDoc({ name: e.target.value }, false)}
          className="h-8 w-40 rounded-md border border-transparent bg-transparent px-2 text-[0.82rem] text-1 outline-none hover:border-[var(--hairline)] focus:border-[var(--accent)] sm:w-52"
          aria-label="Project name"
        />

        <span className="mx-1 h-5 w-px bg-[var(--hairline)]" />

        <IconButton label="Undo" onClick={undo} disabled={!past}><Undo2 className="h-4 w-4" /></IconButton>
        <IconButton label="Redo" onClick={redo} disabled={!future}><Redo2 className="h-4 w-4" /></IconButton>

        <span className="mx-1 h-5 w-px bg-[var(--hairline)]" />

        <IconButton label="Select" active={tool === "select"} onClick={() => setTool("select")}>
          <MousePointer2 className="h-4 w-4" />
        </IconButton>
        <IconButton label="Pan" active={tool === "hand"} onClick={() => setTool("hand")}>
          <Hand className="h-4 w-4" />
        </IconButton>
        <IconButton label="Grid" active={showGrid} onClick={() => toggle("showGrid")}>
          <Grid3x3 className="h-4 w-4" />
        </IconButton>
        <IconButton label="Snapping" active={snapping} onClick={() => toggle("snapping")}>
          <Magnet className="h-4 w-4" />
        </IconButton>

        <div className="ml-auto flex items-center gap-1">
          <span className="tabular hidden font-mono text-[0.7rem] text-3 md:inline">
            {doc.width}×{doc.height}
          </span>
          <span className="mx-1 hidden h-5 w-px bg-[var(--hairline)] md:block" />
          <IconButton label="Zoom out" onClick={() => setZoom(zoom / 1.2)}><Minus className="h-4 w-4" /></IconButton>
          <button
            onClick={fitToView}
            className="tabular h-8 min-w-[3.4rem] rounded-md px-1 font-mono text-[0.72rem] text-2 hover:bg-[var(--surface-2)] hover:text-1"
            title="Fit to view"
          >
            {Math.round(zoom * 100)}%
          </button>
          <IconButton label="Zoom in" onClick={() => setZoom(zoom * 1.2)}><Plus className="h-4 w-4" /></IconButton>
          <IconButton label="Fit to view" onClick={fitToView}><Maximize className="h-4 w-4" /></IconButton>

          <span className="mx-1 h-5 w-px bg-[var(--hairline)]" />

          <IconButton label="Shortcuts" onClick={() => setShowKeys(true)}><Keyboard className="h-4 w-4" /></IconButton>
          <IconButton label={darkUI ? "Light interface" : "Dark interface"} onClick={() => toggle("darkUI")}>
            {darkUI ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </IconButton>
          <Button size="sm" variant="outline" onClick={save}>
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{saved ? "Saved" : dirty ? "Save" : "Saved"}</span>
          </Button>
          <Button size="sm" variant="primary" onClick={() => setExporting(true)}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Icon rail */}
        <nav className="flex w-[4.4rem] shrink-0 flex-col items-center gap-0.5 border-r border-[var(--hairline)] surface-1 py-2">
          {RAIL.map((item) => (
            <button
              key={item.key}
              onClick={() => setPanel(panel === item.key ? null : item.key)}
              className={clsx(
                "flex w-[3.6rem] flex-col items-center gap-1 rounded-lg px-1 py-2 transition-colors duration-150",
                panel === item.key ? "bg-[var(--accent)]/12 text-[var(--accent)]" : "text-3 hover:bg-[var(--surface-2)] hover:text-1",
              )}
            >
              {item.icon}
              <span className="text-[0.58rem] font-medium leading-tight">{item.label}</span>
            </button>
          ))}
          <div className="mt-auto">
            <IconButton label="Hide the panel" onClick={() => setPanel(null)} disabled={!panel}>
              <PanelLeftClose className="h-4 w-4" />
            </IconButton>
          </div>
        </nav>

        {/* Side panel */}
        {panel && (
          <aside className="flex w-[19.5rem] shrink-0 flex-col border-r border-[var(--hairline)] surface-1">
            <header className="flex items-center justify-between border-b border-[var(--hairline)] px-4 py-3">
              <h2 className="font-display text-[0.92rem] font-semibold tracking-tight text-1">
                {RAIL.find((r) => r.key === panel)?.label}
              </h2>
            </header>
            <div className="min-h-0 flex-1">
              {panel === "templates" && <TemplatesPanel onPicked={() => setPanel(null)} />}
              {panel === "text" && <TextPanel />}
              {panel === "elements" && <ElementsPanel />}
              {panel === "uploads" && <UploadsPanel />}
              {panel === "background" && <BackgroundPanel />}
              {panel === "resize" && <ResizePanel />}
              {panel === "layers" && <LayersPanel />}
              {panel === "projects" && <ProjectsPanel onOpened={() => setPanel(null)} />}
            </div>
          </aside>
        )}

        {/* Board */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div ref={canvasWrapRef} className="press-grid relative min-h-0 flex-1 surface-0">
            <CanvasStage onStageReady={setStage} />
          </div>

          <div className={clsx("shrink-0 transition-[height] duration-200", showTimeline ? "h-52" : "h-9")}>
            {showTimeline ? (
              <Timeline />
            ) : (
              <button
                onClick={() => setShowTimeline(true)}
                className="h-9 w-full border-t border-[var(--hairline)] surface-1 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-3 hover:text-1"
              >
                Show the timeline
              </button>
            )}
          </div>
          {showTimeline && (
            <button
              onClick={() => setShowTimeline(false)}
              className="h-6 shrink-0 border-t border-[var(--hairline)] surface-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-3 hover:text-1"
            >
              Hide the timeline
            </button>
          )}
        </main>

        {/* Inspector */}
        <aside className="hidden w-[19.5rem] shrink-0 flex-col border-l border-[var(--hairline)] surface-1 lg:flex">
          <header className="border-b border-[var(--hairline)] px-4 py-3">
            <h2 className="font-display text-[0.92rem] font-semibold tracking-tight text-1">Properties</h2>
          </header>
          <div className="min-h-0 flex-1"><Inspector /></div>
        </aside>
      </div>

      {exporting && <ExportDialog stage={stage} onClose={() => setExporting(false)} />}
      {showKeys && <ShortcutSheet onClose={() => setShowKeys(false)} />}
    </div>
  );
}

function ShortcutSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--hairline)] surface-1 shadow-2xl"
      >
        <header className="border-b border-[var(--hairline)] px-5 py-4">
          <h2 className="font-display text-[1.05rem] font-semibold tracking-tight text-1">Keys</h2>
        </header>
        <ul className="scrollbar-thin max-h-[60vh] divide-y divide-[var(--hairline)] overflow-y-auto px-5">
          {KEY_HELP.map((k) => (
            <li key={k.keys} className="flex items-center justify-between py-2.5">
              <span className="text-[0.8rem] text-2">{k.action}</span>
              <span className="flex gap-1">
                {k.keys.split(" ").map((key) => (
                  <kbd key={key} className="rounded border border-[var(--hairline)] bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[0.66rem] text-1">
                    {key}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <footer className="border-t border-[var(--hairline)] px-5 py-3 text-right">
          <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
        </footer>
      </div>
    </div>
  );
}
