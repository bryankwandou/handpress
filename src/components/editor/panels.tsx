"use client";

import { clsx } from "clsx";
import {
  ArrowDownToLine, ArrowUpToLine, Copy, Eye, EyeOff, Image as ImageIcon,
  Lock, Trash2, Unlock, Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { makeImage, makePath, makeShape, makeText } from "@/lib/factories";
import { fillToCss } from "@/lib/konva-helpers";
import { FONTS, GRADIENT_PRESETS, SHAPE_LIST, SIZE_PRESETS, STICKERS, SWATCHES } from "@/lib/presets";
import { useEditor } from "@/lib/store";
import { deleteDoc, listDocs, loadDoc, readImageFile, type DocSummary } from "@/lib/storage";
import { TEMPLATES } from "@/lib/templates";
import { solid, type Layer } from "@/lib/types";
import { Button, ColorInput, Empty, IconButton, Row, Section, Select, TextInput } from "@/components/ui/primitives";

/* ------------------------------------------------------------ templates */

export function TemplatesPanel({ onPicked }: { onPicked: () => void }) {
  const replaceDoc = useEditor((s) => s.replaceDoc);
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...new Set(TEMPLATES.map((t) => t.category))];
  const shown = filter === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap gap-1.5 border-b border-[var(--hairline)] px-4 py-3">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={clsx(
              "rounded-full px-2.5 py-1 text-[0.72rem] font-medium transition-colors",
              filter === c ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "bg-[var(--surface-2)] text-2 hover:text-1",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="scrollbar-thin grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4">
        {shown.map((t) => {
          const preview = t.build();
          return (
            <button
              key={t.id}
              onClick={() => { replaceDoc(t.build()); onPicked(); }}
              className="group text-left"
            >
              <div
                className="relative overflow-hidden rounded-lg border border-[var(--hairline)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:border-[var(--accent)]"
                style={{ aspectRatio: `${preview.width} / ${preview.height}` }}
              >
                <TemplateThumb docWidth={preview.width} docHeight={preview.height} doc={preview} />
              </div>
              <p className="mt-1.5 text-[0.74rem] font-medium text-2 group-hover:text-1">{t.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A cheap DOM approximation of a template, good enough to choose from. */
function TemplateThumb({ doc, docWidth, docHeight }: { doc: ReturnType<typeof TEMPLATES[0]["build"]>; docWidth: number; docHeight: number }) {
  const bg =
    doc.background.kind === "solid"
      ? doc.background.color
      : doc.background.kind === "gradient"
        ? fillToCss(doc.background.gradient)
        : "#e6dfd0";

  return (
    <div className="absolute inset-0" style={{ background: bg }}>
      {doc.layers.slice(0, 8).map((l) => {
        const style: React.CSSProperties = {
          position: "absolute",
          left: `${(l.x / docWidth) * 100}%`,
          top: `${(l.y / docHeight) * 100}%`,
          width: `${(l.width / docWidth) * 100}%`,
          height: `${(l.height / docHeight) * 100}%`,
          opacity: l.opacity,
        };
        if (l.type === "text") {
          return (
            <span
              key={l.id}
              style={{
                ...style,
                color: l.fill.kind === "solid" ? l.fill.color : "#888",
                fontSize: `${(l.fontSize / docWidth) * 100 * 0.9}cqw`,
                fontWeight: l.fontWeight,
                lineHeight: l.lineHeight,
                textAlign: l.align === "justify" ? "left" : l.align,
                overflow: "hidden",
                whiteSpace: "pre-line",
              }}
            >
              {l.uppercase ? l.text.toUpperCase() : l.text}
            </span>
          );
        }
        if (l.type === "shape") {
          return (
            <span
              key={l.id}
              style={{
                ...style,
                background: fillToCss(l.fill),
                borderRadius: l.shape === "ellipse" ? "50%" : `${(l.cornerRadius / docWidth) * 100}%`,
                border: l.strokeWidth > 0 ? `1px solid ${l.stroke}` : undefined,
              }}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

/* ----------------------------------------------------------------- text */

const TEXT_PRESETS = [
  { label: "Add a heading", fontSize: 96, fontWeight: 800, family: "var(--font-bricolage)" },
  { label: "Add a subheading", fontSize: 56, fontWeight: 600, family: "var(--font-bricolage)" },
  { label: "Add body text", fontSize: 32, fontWeight: 400, family: "var(--font-inter)" },
  { label: "Add a caption", fontSize: 22, fontWeight: 500, family: "var(--font-jetbrains)" },
];

export function TextPanel() {
  const addLayer = useEditor((s) => s.addLayer);

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <Section title="Add type">
        {TEXT_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() =>
              addLayer(
                makeText({
                  text: p.label.replace("Add a ", "").replace("Add ", ""),
                  fontSize: p.fontSize,
                  fontWeight: p.fontWeight,
                  fontFamily: p.family,
                  width: 720,
                  height: p.fontSize * 1.3,
                }),
              )
            }
            className="w-full rounded-lg border border-[var(--hairline)] px-3 py-3 text-left transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-2)]"
            style={{ fontFamily: p.family, fontWeight: p.fontWeight }}
          >
            <span style={{ fontSize: `${Math.min(p.fontSize / 3.4, 22)}px` }}>{p.label}</span>
          </button>
        ))}
      </Section>

      <Section title="Type specimens">
        <div className="grid gap-1.5">
          {FONTS.map((f) => (
            <button
              key={f.label}
              onClick={() =>
                addLayer(makeText({ text: f.label, fontFamily: f.family, fontSize: 72, fontWeight: f.weights.includes(700) ? 700 : f.weights[0], width: 720, height: 100 }))
              }
              className="flex items-baseline justify-between rounded-md px-2.5 py-2 text-left transition-colors hover:bg-[var(--surface-2)]"
            >
              <span className="truncate text-[1.05rem] text-1" style={{ fontFamily: f.family }}>{f.label}</span>
              <span className="ml-2 shrink-0 font-mono text-[0.6rem] uppercase tracking-wider text-3">{f.category}</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* -------------------------------------------------------------- elements */

export function ElementsPanel() {
  const addLayer = useEditor((s) => s.addLayer);

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <Section title="Shapes">
        <div className="grid grid-cols-4 gap-2">
          {SHAPE_LIST.map((s) => (
            <button
              key={s.kind}
              title={s.label}
              onClick={() => addLayer(makeShape(s.kind))}
              className="grid aspect-square place-items-center rounded-lg border border-[var(--hairline)] p-2.5 text-1 transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <ShapeGlyph kind={s.kind} />
            </button>
          ))}
        </div>
      </Section>

      <Section title="Graphics">
        <div className="grid grid-cols-4 gap-2">
          {STICKERS.map((s) => (
            <button
              key={s.id}
              title={s.label}
              onClick={() => addLayer(makePath(s.d, s.viewBox, { name: s.label }))}
              className="grid aspect-square place-items-center rounded-lg border border-[var(--hairline)] p-3 text-1 transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <svg viewBox={`0 0 ${s.viewBox} ${s.viewBox}`} className="h-full w-full" fill="currentColor">
                <path d={s.d} />
              </svg>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Colour blocks">
        {SWATCHES.map((group) => (
          <div key={group.name}>
            <p className="mb-1.5 text-[0.7rem] text-3">{group.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => addLayer(makeShape("rect", { fill: solid(c), width: 400, height: 400 }))}
                  className="h-7 w-7 rounded-md border border-[var(--hairline)] transition-transform hover:scale-110"
                  style={{ background: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}

function ShapeGlyph({ kind }: { kind: string }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6 };
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      {kind === "rect" && <rect x="3" y="5" width="18" height="14" rx="3" {...stroke} />}
      {kind === "ellipse" && <ellipse cx="12" cy="12" rx="9" ry="7" {...stroke} />}
      {kind === "triangle" && <path d="M12 4l8 15H4z" {...stroke} />}
      {kind === "diamond" && <path d="M12 3l9 9-9 9-9-9z" {...stroke} />}
      {kind === "polygon" && <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" {...stroke} />}
      {kind === "star" && <path d="M12 3l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5L12 17.1 6.2 20.6l1.6-6.5-5.1-4.4 6.7-.5z" {...stroke} />}
      {kind === "burst" && <path d="M12 2l1.4 3.6 3.4-1.8-.6 3.8 3.8-.6-1.8 3.4L22 12l-3.8 1.6 1.8 3.4-3.8-.6.6 3.8-3.4-1.8L12 22l-1.4-3.6-3.4 1.8.6-3.8-3.8.6 1.8-3.4L2 12l3.8-1.6L4 7l3.8.6-.6-3.8 3.4 1.8z" {...stroke} />}
      {kind === "heart" && <path d="M12 20C6 16 2 13 2 9a5 5 0 019-3 5 5 0 019 3c0 4-4 7-10 11z" {...stroke} />}
      {kind === "cross" && <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" {...stroke} />}
      {kind === "chevron" && <path d="M6 3h6l6 9-6 9H6l6-9z" {...stroke} />}
      {kind === "arrow" && <path d="M3 10h11V5l7 7-7 7v-5H3z" {...stroke} />}
      {kind === "line" && <path d="M3 12h18" {...stroke} strokeLinecap="round" />}
      {kind === "ring" && <><circle cx="12" cy="12" r="9" {...stroke} /><circle cx="12" cy="12" r="4" {...stroke} /></>}
      {kind === "blob" && <path d="M18 5c2.4 2 3.4 6 2 9s-5 5.6-8.4 5.4S4 16.6 3.4 13 5 5.6 8.4 4.4 15.6 3 18 5z" {...stroke} />}
      {kind === "speech" && <path d="M3 5h18v11h-9l-5 4v-4H3z" {...stroke} />}
      {kind === "wave" && <path d="M2 14c3-5 5-5 8 0s5 5 8 0 4-4 4-1" {...stroke} strokeLinecap="round" />}
    </svg>
  );
}

/* --------------------------------------------------------------- uploads */

export function UploadsPanel() {
  const addLayer = useEditor((s) => s.addLayer);
  const doc = useEditor((s) => s.doc);
  const [uploads, setUploads] = useState<{ src: string; width: number; height: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const next: { src: string; width: number; height: number }[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        next.push(await readImageFile(file));
      } catch {
        // Skip anything the browser refuses to decode rather than stopping.
      }
    }
    setUploads((u) => [...next, ...u]);
    setBusy(false);
  };

  const place = (u: { src: string; width: number; height: number }) => {
    const fit = Math.min((doc.width * 0.8) / u.width, (doc.height * 0.8) / u.height, 1);
    addLayer(makeImage(u.src, u.width, u.height, { width: u.width * fit, height: u.height * fit }));
  };

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <Section title="Your files">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); void handleFiles(e.dataTransfer.files); }}
          className="rounded-lg border border-dashed border-[var(--hairline)] px-4 py-8 text-center transition-colors hover:border-[var(--accent)]"
        >
          <Upload className="mx-auto mb-2 h-5 w-5 text-3" />
          <p className="text-[0.78rem] text-2">Drop pictures here</p>
          <p className="mt-0.5 text-[0.7rem] text-3">They stay on this machine</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? "Reading" : "Browse files"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => void handleFiles(e.target.files)}
          />
        </div>

        {uploads.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {uploads.map((u, i) => (
              <button
                key={i}
                onClick={() => place(u)}
                className="checkerboard aspect-square overflow-hidden rounded-md border border-[var(--hairline)] transition-transform hover:-translate-y-0.5 hover:border-[var(--accent)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section title="Note">
        <p className="text-[0.74rem] leading-relaxed text-3">
          Uploads are held in this tab only. Save the project to keep them, or export when you are done.
        </p>
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------ background */

export function BackgroundPanel() {
  const bg = useEditor((s) => s.doc.background);
  const setBackground = useEditor((s) => s.setBackground);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <Section title="Flat colour">
        <div className="flex flex-wrap gap-1.5">
          {SWATCHES.flatMap((g) => g.colors).map((c) => (
            <button
              key={c}
              onClick={() => setBackground({ kind: "solid", color: c })}
              className={clsx(
                "h-7 w-7 rounded-md border transition-transform hover:scale-110",
                bg.kind === "solid" && bg.color === c ? "border-[var(--accent)] ring-2 ring-[var(--accent)]" : "border-[var(--hairline)]",
              )}
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
        <Row label="Custom">
          <ColorInput
            value={bg.kind === "solid" ? bg.color : "#ffffff"}
            onChange={(color) => setBackground({ kind: "solid", color })}
          />
        </Row>
      </Section>

      <Section title="Gradient">
        <div className="grid grid-cols-4 gap-2">
          {GRADIENT_PRESETS.map((g) => (
            <button
              key={g.name}
              title={g.name}
              onClick={() => setBackground({ kind: "gradient", gradient: g.gradient })}
              className="aspect-square rounded-lg border border-[var(--hairline)] transition-transform hover:-translate-y-0.5 hover:border-[var(--accent)]"
              style={{ background: fillToCss(g.gradient) }}
            />
          ))}
        </div>
        {bg.kind === "gradient" && (
          <>
            <Row label="Angle">
              <input
                type="range"
                min={0}
                max={360}
                value={bg.gradient.angle}
                onChange={(e) =>
                  setBackground({ kind: "gradient", gradient: { ...bg.gradient, angle: Number(e.target.value) } })
                }
                className="flex-1"
              />
            </Row>
            <Row label="Stops">
              <span className="flex gap-2">
                {bg.gradient.stops.map((s, i) => (
                  <input
                    key={i}
                    type="color"
                    value={s.color}
                    onChange={(e) => {
                      const stops = bg.gradient.stops.map((st, j) => (j === i ? { ...st, color: e.target.value } : st));
                      setBackground({ kind: "gradient", gradient: { ...bg.gradient, stops } });
                    }}
                    className="h-7 w-7 rounded"
                  />
                ))}
              </span>
            </Row>
          </>
        )}
      </Section>

      <Section title="Picture">
        <Button variant="outline" size="sm" className="w-full" onClick={() => inputRef.current?.click()}>
          <ImageIcon className="h-3.5 w-3.5" /> Choose an image
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const { src } = await readImageFile(file);
            setBackground({ kind: "image", src, fit: "cover", blur: 0, dim: 0 });
          }}
        />
        {bg.kind === "image" && (
          <>
            <Row label="Fit">
              <Select
                value={bg.fit}
                options={[
                  { value: "cover" as const, label: "Fill" },
                  { value: "contain" as const, label: "Fit" },
                ]}
                onChange={(fit) => setBackground({ ...bg, fit })}
              />
            </Row>
            <Row label="Blur">
              <input type="range" min={0} max={60} value={bg.blur}
                onChange={(e) => setBackground({ ...bg, blur: Number(e.target.value) })} className="flex-1" />
            </Row>
            <Row label="Darken">
              <input type="range" min={0} max={90} value={bg.dim}
                onChange={(e) => setBackground({ ...bg, dim: Number(e.target.value) })} className="flex-1" />
            </Row>
          </>
        )}
      </Section>
    </div>
  );
}

/* ---------------------------------------------------------------- layers */

export function LayersPanel() {
  const layers = useEditor((s) => s.doc.layers);
  const selected = useEditor((s) => s.selected);
  const select = useEditor((s) => s.select);
  const updateLayer = useEditor((s) => s.updateLayer);
  const removeLayers = useEditor((s) => s.removeLayers);
  const reorder = useEditor((s) => s.reorder);
  const duplicateSelected = useEditor((s) => s.duplicateSelected);
  const bringToFront = useEditor((s) => s.bringToFront);
  const sendToBack = useEditor((s) => s.sendToBack);

  if (!layers.length) {
    return <Empty title="Nothing on the board" body="Add type, a shape, or a picture and it will show up here." />;
  }

  // Topmost first, which is how people read a stack.
  const ordered = [...layers].reverse();

  return (
    <div className="scrollbar-thin h-full overflow-y-auto p-3">
      <ul className="space-y-1">
        {ordered.map((layer) => {
          const isSelected = selected.includes(layer.id);
          const trueIndex = layers.findIndex((l) => l.id === layer.id);
          return (
            <li
              key={layer.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", layer.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dragged = e.dataTransfer.getData("text/plain");
                if (dragged && dragged !== layer.id) reorder(dragged, trueIndex);
              }}
              onClick={() => select([layer.id])}
              className={clsx(
                "group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 transition-colors",
                isSelected ? "bg-[var(--accent)]/12 ring-1 ring-[var(--accent)]" : "hover:bg-[var(--surface-2)]",
              )}
            >
              <LayerIcon layer={layer} />
              <span className={clsx("min-w-0 flex-1 truncate text-[0.78rem]", layer.visible ? "text-1" : "text-3 line-through")}>
                {layer.type === "text" ? (layer as { text: string }).text.split("\n")[0].slice(0, 26) || "Text" : layer.name}
              </span>
              <span className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 has-[:focus]:opacity-100">
                <IconButton
                  label={layer.visible ? "Hide" : "Show"}
                  className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
                >
                  {layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </IconButton>
                <IconButton
                  label={layer.locked ? "Unlock" : "Lock"}
                  className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }}
                >
                  {layer.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                </IconButton>
                <IconButton
                  label="Delete"
                  className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); removeLayers([layer.id]); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </span>
            </li>
          );
        })}
      </ul>

      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--hairline)] pt-3">
          <Button size="sm" variant="outline" onClick={duplicateSelected}>
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </Button>
          <Button size="sm" variant="outline" onClick={() => selected.forEach(bringToFront)}>
            <ArrowUpToLine className="h-3.5 w-3.5" /> Front
          </Button>
          <Button size="sm" variant="outline" onClick={() => selected.forEach(sendToBack)}>
            <ArrowDownToLine className="h-3.5 w-3.5" /> Back
          </Button>
        </div>
      )}
    </div>
  );
}

function LayerIcon({ layer }: { layer: Layer }) {
  const cls = "h-4 w-4 shrink-0 text-3";
  if (layer.type === "text") {
    return <span className={clsx(cls, "grid place-items-center font-display text-[0.8rem] font-bold")}>T</span>;
  }
  if (layer.type === "image") return <ImageIcon className={cls} />;
  return (
    <span className={cls}>
      <svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3" /></svg>
    </span>
  );
}

/* -------------------------------------------------------------- projects */

export function ProjectsPanel({ onOpened }: { onOpened: () => void }) {
  const replaceDoc = useEditor((s) => s.replaceDoc);
  const currentId = useEditor((s) => s.doc.id);
  const [docs, setDocs] = useState<DocSummary[]>([]);

  const refresh = () => void listDocs().then(setDocs);
  useEffect(refresh, []);

  if (!docs.length) {
    return <Empty title="No saved work yet" body="Press Ctrl+S and this project will be kept in the browser on this machine." />;
  }

  return (
    <div className="scrollbar-thin h-full overflow-y-auto p-3">
      <ul className="space-y-2">
        {docs.map((d) => (
          <li
            key={d.id}
            className={clsx(
              "group flex items-center gap-3 rounded-lg border p-2 transition-colors",
              d.id === currentId ? "border-[var(--accent)]" : "border-[var(--hairline)] hover:border-[var(--accent)]",
            )}
          >
            <button
              onClick={async () => {
                const doc = await loadDoc(d.id);
                if (doc) { replaceDoc(doc); onOpened(); }
              }}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <span className="checkerboard grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md border border-[var(--hairline)]">
                {d.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.thumb} alt="" className="h-full w-full object-cover" />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[0.8rem] font-medium text-1">{d.name}</span>
                <span className="tabular block font-mono text-[0.64rem] text-3">
                  {d.width}×{d.height} · {new Date(d.updatedAt).toLocaleDateString()}
                </span>
              </span>
            </button>
            <IconButton
              label="Remove"
              className="h-7 w-7 opacity-0 group-hover:opacity-100"
              onClick={async () => { await deleteDoc(d.id); refresh(); }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </IconButton>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------------------------------------------- sizes */

export function ResizePanel() {
  const doc = useEditor((s) => s.doc);
  const resize = useEditor((s) => s.resize);
  const [w, setW] = useState(doc.width);
  const [h, setH] = useState(doc.height);

  useEffect(() => { setW(doc.width); setH(doc.height); }, [doc.width, doc.height]);

  const groups = [...new Set(SIZE_PRESETS.map((p) => p.group))];

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <Section title="Custom size">
        <div className="flex items-center gap-2">
          <TextInput type="number" value={w} onChange={(e) => setW(Number(e.target.value))} />
          <span className="text-3">×</span>
          <TextInput type="number" value={h} onChange={(e) => setH(Number(e.target.value))} />
        </div>
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => resize(Math.max(16, w), Math.max(16, h))}
          disabled={w === doc.width && h === doc.height}
        >
          Apply
        </Button>
        <p className="text-[0.7rem] leading-relaxed text-3">
          Everything on the board is rescaled to match, so a resize never crops your work.
        </p>
      </Section>

      {groups.map((group) => (
        <Section key={group} title={group}>
          <div className="grid gap-1">
            {SIZE_PRESETS.filter((p) => p.group === group).map((p) => (
              <button
                key={p.id}
                onClick={() => resize(p.width, p.height)}
                className={clsx(
                  "flex items-center justify-between rounded-md px-2.5 py-2 text-left transition-colors hover:bg-[var(--surface-2)]",
                  doc.width === p.width && doc.height === p.height && "bg-[var(--surface-2)] ring-1 ring-[var(--accent)]",
                )}
              >
                <span className="text-[0.78rem] text-1">{p.label}</span>
                <span className="tabular font-mono text-[0.64rem] text-3">{p.width}×{p.height}</span>
              </button>
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}
