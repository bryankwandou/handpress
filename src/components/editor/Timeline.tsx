"use client";

import { clsx } from "clsx";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useRef } from "react";
import { suggestedDuration } from "@/lib/animation";
import { useEditor } from "@/lib/store";
import { IconButton, NumberInput } from "@/components/ui/primitives";

export function Timeline() {
  const doc = useEditor((s) => s.doc);
  const playing = useEditor((s) => s.playing);
  const playhead = useEditor((s) => s.playhead);
  const selected = useEditor((s) => s.selected);
  const setPlaying = useEditor((s) => s.setPlaying);
  const setPlayhead = useEditor((s) => s.setPlayhead);
  const setDoc = useEditor((s) => s.setDoc);
  const select = useEditor((s) => s.select);
  const trackRef = useRef<HTMLDivElement>(null);

  const total = Math.max(doc.duration, 0.2);
  const suggested = suggestedDuration(doc.layers);

  const scrub = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setPlaying(false);
    setPlayhead(ratio * total);
  };

  const animated = doc.layers.filter(
    (l) => l.anim.in.preset !== "none" || l.anim.out.preset !== "none" || l.anim.loop.preset !== "none",
  );

  return (
    <div className="flex h-full flex-col border-t border-[var(--hairline)] surface-1">
      <div className="flex items-center gap-2 border-b border-[var(--hairline)] px-3 py-2">
        <IconButton label={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </IconButton>
        <IconButton label="Back to the start" onClick={() => { setPlaying(false); setPlayhead(0); }}>
          <RotateCcw className="h-4 w-4" />
        </IconButton>

        <span className="tabular ml-1 font-mono text-[0.72rem] text-2">
          {playhead.toFixed(2)}s
        </span>
        <span className="font-mono text-[0.72rem] text-3">/</span>
        <NumberInput
          value={doc.duration}
          min={0.5}
          max={60}
          step={0.5}
          suffix="s"
          onChange={(duration) => setDoc({ duration })}
        />

        {suggested !== doc.duration && (
          <button
            onClick={() => setDoc({ duration: suggested })}
            className="rounded-md px-2 py-1 text-[0.7rem] text-[var(--accent)] hover:bg-[var(--surface-2)]"
          >
            Fit to {suggested}s
          </button>
        )}

        <span className="ml-auto font-mono text-[0.66rem] text-3">
          {animated.length} of {doc.layers.length} layers move
        </span>
      </div>

      <div className="scrollbar-thin relative flex-1 overflow-y-auto">
        <div
          ref={trackRef}
          className="relative min-h-full px-3 py-2"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            scrub(e.clientX);
          }}
          onPointerMove={(e) => e.buttons === 1 && scrub(e.clientX)}
        >
          {/* Second markers */}
          <div className="pointer-events-none absolute inset-x-3 top-0 h-full">
            {Array.from({ length: Math.ceil(total) + 1 }, (_, i) => (
              <span
                key={i}
                className="absolute top-0 h-full border-l border-[var(--hairline)]"
                style={{ left: `${(i / total) * 100}%` }}
              >
                <span className="absolute -top-0 left-1 font-mono text-[0.58rem] text-3">{i}s</span>
              </span>
            ))}
          </div>

          <ul className="relative space-y-1 pt-4">
            {doc.layers.length === 0 && (
              <li className="py-6 text-center text-[0.76rem] text-3">
                Add something to the board, then give it motion from the panel on the right.
              </li>
            )}
            {[...doc.layers].reverse().map((layer) => {
              const inStart = layer.anim.in.preset === "none" ? 0 : layer.anim.in.delay;
              const inEnd = layer.anim.in.preset === "none" ? 0 : inStart + layer.anim.in.duration;
              const outEnd = layer.anim.out.preset === "none" ? total : total - layer.anim.out.delay;
              const outStart = layer.anim.out.preset === "none" ? total : outEnd - layer.anim.out.duration;

              return (
                <li
                  key={layer.id}
                  onClick={() => select([layer.id])}
                  className={clsx(
                    "relative flex h-7 cursor-pointer items-center rounded-md transition-colors",
                    selected.includes(layer.id) ? "bg-[var(--accent)]/10" : "hover:bg-[var(--surface-2)]",
                  )}
                >
                  <span className="pointer-events-none absolute left-2 z-10 max-w-[36%] truncate text-[0.7rem] text-2">
                    {layer.type === "text" ? (layer as { text: string }).text.split("\n")[0].slice(0, 20) : layer.name}
                  </span>

                  {/* The span where the layer is on screen */}
                  <span
                    className="absolute h-4 rounded-sm bg-[var(--surface-3)]"
                    style={{ left: `${(inStart / total) * 100}%`, width: `${((outEnd - inStart) / total) * 100}%` }}
                  />
                  {/* Entrance */}
                  {layer.anim.in.preset !== "none" && (
                    <span
                      className="absolute h-4 rounded-l-sm bg-[var(--accent)]"
                      style={{ left: `${(inStart / total) * 100}%`, width: `${((inEnd - inStart) / total) * 100}%` }}
                      title={`${layer.anim.in.preset} · ${layer.anim.in.duration}s`}
                    />
                  )}
                  {/* Exit */}
                  {layer.anim.out.preset !== "none" && (
                    <span
                      className="absolute h-4 rounded-r-sm bg-[var(--color-plate-500)]"
                      style={{ left: `${(outStart / total) * 100}%`, width: `${((outEnd - outStart) / total) * 100}%` }}
                      title={`${layer.anim.out.preset} · ${layer.anim.out.duration}s`}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {/* Playhead */}
          <span
            className="pointer-events-none absolute top-0 z-20 h-full w-px bg-[var(--accent)]"
            style={{ left: `calc(0.75rem + (100% - 1.5rem) * ${playhead / total})` }}
          >
            <span className="absolute -left-1 top-0 h-2 w-2 rounded-full bg-[var(--accent)]" />
          </span>
        </div>
      </div>
    </div>
  );
}
