"use client";

import { clsx } from "clsx";
import type Konva from "konva";
import { Check, Download, X } from "lucide-react";
import { useState } from "react";
import { docIsStatic } from "@/lib/animation";
import {
  downloadSvg, exportPdf, renderRaster, renderVideo, supportedVideoTypes,
  type RasterFormat,
} from "@/lib/export";
import { useEditor } from "@/lib/store";
import { downloadBlob, exportProjectFile, slug } from "@/lib/storage";
import { Button, Row, SegmentedControl, Select, Slider } from "@/components/ui/primitives";

type Kind = "image" | "vector" | "print" | "video" | "project";

export function ExportDialog({ stage, onClose }: { stage: Konva.Stage | null; onClose: () => void }) {
  const doc = useEditor((s) => s.doc);
  const setPlayhead = useEditor((s) => s.setPlayhead);
  const setPlaying = useEditor((s) => s.setPlaying);
  const clearSelection = useEditor((s) => s.clearSelection);

  const [kind, setKind] = useState<Kind>("image");
  const [format, setFormat] = useState<RasterFormat>("png");
  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(92);
  const [dpi, setDpi] = useState(300);
  const [fps, setFps] = useState(30);
  const [videoScale, setVideoScale] = useState(1);
  const videoTypes = supportedVideoTypes();
  const [mime, setMime] = useState(videoTypes[0]?.mime ?? "");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isStatic = docIsStatic(doc.layers);
  const outW = Math.round(doc.width * scale);
  const outH = Math.round(doc.height * scale);

  const run = async () => {
    if (!stage) return;
    setBusy(true);
    setError(null);
    setDone(null);
    setProgress(0);

    // Selection handles and guides must not end up in the file.
    clearSelection();
    setPlaying(false);
    await new Promise((r) => setTimeout(r, 60));

    try {
      if (kind === "image") {
        setPlayhead(0);
        await new Promise((r) => setTimeout(r, 40));
        const blob = await renderRaster(stage, doc, format, scale, quality / 100);
        downloadBlob(blob, `${slug(doc.name)}@${scale}x.${format === "jpeg" ? "jpg" : format}`);
        setDone(`${outW}×${outH} ${format.toUpperCase()} saved`);
      } else if (kind === "vector") {
        downloadSvg(doc);
        setDone("SVG saved — type stays editable");
      } else if (kind === "print") {
        await exportPdf(stage, doc, dpi);
        setDone(`PDF saved at ${dpi} dpi`);
      } else if (kind === "video") {
        const seekTo = (t: number) =>
          new Promise<void>((resolve) => {
            setPlayhead(t);
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          });
        const blob = await renderVideo(stage, doc, seekTo, {
          fps,
          scale: videoScale,
          mime,
          bitrate: Math.round(doc.width * doc.height * videoScale * fps * 0.11),
          onProgress: setProgress,
        });
        const ext = mime.startsWith("video/mp4") ? "mp4" : "webm";
        downloadBlob(blob, `${slug(doc.name)}.${ext}`);
        setPlayhead(0);
        setDone(`${Math.round(doc.duration * fps)} frames written`);
      } else {
        exportProjectFile(doc);
        setDone("Project file saved — reopen it any time");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The export did not finish.");
    } finally {
      setBusy(false);
    }
  };

  const tabs: { key: Kind; label: string; note: string }[] = [
    { key: "image", label: "Picture", note: "PNG, JPG, WebP" },
    { key: "vector", label: "Vector", note: "SVG, editable type" },
    { key: "print", label: "Print", note: "PDF at print size" },
    { key: "video", label: "Motion", note: isStatic ? "Nothing moves yet" : "MP4 or WebM" },
    { key: "project", label: "Project", note: "Reopen later" },
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--hairline)] surface-1 shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-[var(--hairline)] px-5 py-4">
          <div>
            <h2 className="font-display text-[1.05rem] font-semibold tracking-tight text-1">Export</h2>
            <p className="text-[0.74rem] text-3">No watermark, no cap on size, no account.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-3 hover:bg-[var(--surface-2)] hover:text-1">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid grid-cols-5 gap-1 border-b border-[var(--hairline)] p-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setKind(t.key)}
              disabled={t.key === "video" && (isStatic || videoTypes.length === 0)}
              className={clsx(
                "rounded-lg px-2 py-2.5 text-center transition-colors disabled:opacity-35",
                kind === t.key ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "text-2 hover:bg-[var(--surface-2)]",
              )}
            >
              <span className="block text-[0.76rem] font-medium">{t.label}</span>
              <span className="mt-0.5 block text-[0.58rem] opacity-75">{t.note}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3.5 px-5 py-4">
          {kind === "image" && (
            <>
              <Row label="Format">
                <SegmentedControl
                  value={format}
                  onChange={setFormat}
                  options={[
                    { value: "png" as const, label: "PNG" },
                    { value: "jpeg" as const, label: "JPG" },
                    { value: "webp" as const, label: "WebP" },
                  ]}
                />
              </Row>
              <Row label="Scale">
                <Slider value={scale} min={0.25} max={6} step={0.25} onChange={setScale} suffix="×" />
              </Row>
              {format !== "png" && (
                <Row label="Quality"><Slider value={quality} min={40} max={100} onChange={setQuality} suffix="%" /></Row>
              )}
              <p className="tabular font-mono text-[0.7rem] text-3">
                Output: {outW} × {outH} px
                {format === "png" && " · transparency kept"}
              </p>
            </>
          )}

          {kind === "vector" && (
            <p className="text-[0.8rem] leading-relaxed text-2">
              Text is written as real text and shapes as real paths, so the file can be reopened in Illustrator,
              Inkscape, or Figma and edited. Pictures are embedded.
            </p>
          )}

          {kind === "print" && (
            <>
              <Row label="Resolution">
                <Select
                  value={dpi}
                  options={[{ value: 150, label: "150 dpi" }, { value: 300, label: "300 dpi" }, { value: 400, label: "400 dpi" }]}
                  onChange={setDpi}
                />
              </Row>
              <p className="text-[0.78rem] leading-relaxed text-3">
                The page is set to the artboard size. For a printer, keep anything important away from the outer
                three millimetres.
              </p>
            </>
          )}

          {kind === "video" && (
            <>
              <Row label="Container">
                <Select
                  value={mime}
                  options={videoTypes.map((v) => ({ value: v.mime, label: v.label }))}
                  onChange={setMime}
                  className="w-full"
                />
              </Row>
              <Row label="Frame rate">
                <Select
                  value={fps}
                  options={[{ value: 24, label: "24 fps" }, { value: 30, label: "30 fps" }, { value: 60, label: "60 fps" }]}
                  onChange={setFps}
                />
              </Row>
              <Row label="Scale"><Slider value={videoScale} min={0.25} max={2} step={0.25} onChange={setVideoScale} suffix="×" /></Row>
              <p className="tabular font-mono text-[0.7rem] text-3">
                {Math.round(doc.width * videoScale)} × {Math.round(doc.height * videoScale)} ·{" "}
                {doc.duration}s · {Math.round(doc.duration * fps)} frames
              </p>
              <p className="text-[0.74rem] leading-relaxed text-3">
                Frames are drawn one at a time rather than screen-recorded, so a busy machine still produces a
                clean file.
              </p>
            </>
          )}

          {kind === "project" && (
            <p className="text-[0.8rem] leading-relaxed text-2">
              Saves a single JSON file holding every layer, effect, and timing. Drop it back onto the editor on any
              machine to carry on.
            </p>
          )}

          {busy && kind === "video" && (
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
              <div className="h-full bg-[var(--accent)] transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
            </div>
          )}

          {done && (
            <p className="flex items-center gap-1.5 text-[0.78rem] text-[var(--color-press-500)]">
              <Check className="h-3.5 w-3.5" /> {done}
            </p>
          )}
          {error && <p className="text-[0.78rem] text-[var(--color-press-500)]">{error}</p>}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-[var(--hairline)] px-5 py-4">
          <span className="text-[0.72rem] text-3">Everything is rendered in this tab.</span>
          <Button variant="primary" onClick={run} disabled={busy || !stage}>
            <Download className="h-4 w-4" />
            {busy ? (kind === "video" ? `Writing ${Math.round(progress * 100)}%` : "Working") : "Download"}
          </Button>
        </footer>
      </div>
    </div>
  );
}
