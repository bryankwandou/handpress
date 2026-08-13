"use client";

import Konva from "konva";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group, Image as KonvaImageTag, Layer, Line, Rect, Stage, Transformer } from "react-konva";
import useImage from "use-image";
import { IDENTITY, sampleAnim } from "@/lib/animation";
import { fillProps, resolveFont } from "@/lib/konva-helpers";
import { useEditor } from "@/lib/store";
import type { Layer as HpLayer, TextLayer } from "@/lib/types";
import { LayerNode } from "./LayerNode";

const SNAP_TOLERANCE = 6;

export type StageHandle = { stage: Konva.Stage | null };

export function CanvasStage({ onStageReady }: { onStageReady?: (stage: Konva.Stage) => void }) {
  const doc = useEditor((s) => s.doc);
  const selected = useEditor((s) => s.selected);
  const tool = useEditor((s) => s.tool);
  const zoom = useEditor((s) => s.zoom);
  const pan = useEditor((s) => s.pan);
  const showGrid = useEditor((s) => s.showGrid);
  const snapping = useEditor((s) => s.snapping);
  const playhead = useEditor((s) => s.playhead);
  const playing = useEditor((s) => s.playing);

  const select = useEditor((s) => s.select);
  const toggleSelect = useEditor((s) => s.toggleSelect);
  const clearSelection = useEditor((s) => s.clearSelection);
  const updateLayer = useEditor((s) => s.updateLayer);
  const setZoom = useEditor((s) => s.setZoom);
  const setPan = useEditor((s) => s.setPan);

  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [viewport, setViewport] = useState({ width: 800, height: 600 });
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);

  /* --------------------------------------------------------- responsive */

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setViewport({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (stageRef.current) onStageReady?.(stageRef.current);
  }, [onStageReady]);

  /* ------------------------------------------------------ animation tick */

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const started = performance.now() - useEditor.getState().playhead * 1000;
    const tick = () => {
      const elapsed = (performance.now() - started) / 1000;
      const t = elapsed % Math.max(doc.duration, 0.2);
      useEditor.getState().setPlayhead(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, doc.duration]);

  /* ------------------------------------------------------------ keyboard */

  useEffect(() => {
    const down = (e: KeyboardEvent) => e.code === "Space" && setSpaceDown(true);
    const up = (e: KeyboardEvent) => e.code === "Space" && setSpaceDown(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  /* ----------------------------------------------------------- transformer */

  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const nodes = selected
      .map((id) => stage.findOne(`#${id}`))
      .filter((n): n is Konva.Node => Boolean(n));
    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selected, doc.layers, playhead]);

  /* -------------------------------------------------------------- snapping */

  const snapTargets = useMemo(() => {
    const xs = [0, doc.width / 2, doc.width];
    const ys = [0, doc.height / 2, doc.height];
    for (const l of doc.layers) {
      if (selected.includes(l.id) || !l.visible) continue;
      xs.push(l.x, l.x + l.width / 2, l.x + l.width);
      ys.push(l.y, l.y + l.height / 2, l.y + l.height);
    }
    return { xs, ys };
  }, [doc.layers, doc.width, doc.height, selected]);

  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (!snapping) return;
      const node = e.target;
      if (node.name() !== "layer-node") return;

      const box = node.getClientRect({ relativeTo: node.getStage()! });
      const stagePos = { x: (box.x - pan.x) / zoom, y: (box.y - pan.y) / zoom };
      const w = box.width / zoom;
      const h = box.height / zoom;

      const hitX: number[] = [];
      const hitY: number[] = [];
      const tol = SNAP_TOLERANCE / zoom;

      const edgesX = [stagePos.x, stagePos.x + w / 2, stagePos.x + w];
      const edgesY = [stagePos.y, stagePos.y + h / 2, stagePos.y + h];

      let dx = 0;
      let dy = 0;
      for (const target of snapTargets.xs) {
        for (const edge of edgesX) {
          if (Math.abs(edge - target) < tol) {
            dx = target - edge;
            hitX.push(target);
          }
        }
      }
      for (const target of snapTargets.ys) {
        for (const edge of edgesY) {
          if (Math.abs(edge - target) < tol) {
            dy = target - edge;
            hitY.push(target);
          }
        }
      }

      if (dx || dy) node.position({ x: node.x() + dx * zoom * (1 / zoom), y: node.y() + dy });
      setGuides({ x: [...new Set(hitX)], y: [...new Set(hitY)] });
    },
    [snapping, snapTargets, pan, zoom],
  );

  /* ------------------------------------------------------- pointer on stage */

  const onStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== e.target.getStage() && e.target.name() !== "artboard") return;
    if (tool === "hand" || spaceDown) return;

    clearSelection();
    const stage = stageRef.current!;
    const p = stage.getPointerPosition();
    if (!p) return;
    setMarquee({ x: (p.x - pan.x) / zoom, y: (p.y - pan.y) / zoom, w: 0, h: 0 });
  };

  const onStageMouseMove = () => {
    if (!marquee) return;
    const stage = stageRef.current!;
    const p = stage.getPointerPosition();
    if (!p) return;
    setMarquee({ ...marquee, w: (p.x - pan.x) / zoom - marquee.x, h: (p.y - pan.y) / zoom - marquee.y });
  };

  const onStageMouseUp = () => {
    if (!marquee) return;
    const box = {
      x: Math.min(marquee.x, marquee.x + marquee.w),
      y: Math.min(marquee.y, marquee.y + marquee.h),
      w: Math.abs(marquee.w),
      h: Math.abs(marquee.h),
    };
    if (box.w > 4 && box.h > 4) {
      const inside = doc.layers.filter(
        (l) =>
          !l.locked && l.visible &&
          l.x + l.width > box.x && l.x < box.x + box.w &&
          l.y + l.height > box.y && l.y < box.y + box.h,
      );
      select(inside.map((l) => l.id));
    }
    setMarquee(null);
  };

  const onWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current!;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (e.evt.ctrlKey || e.evt.metaKey) {
      const next = zoom * (e.evt.deltaY > 0 ? 0.92 : 1.08);
      const clamped = Math.max(0.02, Math.min(next, 16));
      // Keep the point under the cursor fixed while the scale changes.
      setPan({
        x: pointer.x - ((pointer.x - pan.x) / zoom) * clamped,
        y: pointer.y - ((pointer.y - pan.y) / zoom) * clamped,
      });
      setZoom(clamped);
    } else {
      setPan({ x: pan.x - e.evt.deltaX, y: pan.y - e.evt.deltaY });
    }
  };

  /* ---------------------------------------------------------- text editing */

  const editingLayer = editing ? (doc.layers.find((l) => l.id === editing) as TextLayer | undefined) : undefined;

  const commitText = (value: string) => {
    if (editing) updateLayer(editing, { text: value } as Partial<HpLayer>);
    setEditing(null);
  };

  /* -------------------------------------------------------------- render */

  const handSelected = tool === "hand" || spaceDown;

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden"
      style={{ cursor: handSelected ? "grab" : "default" }}
    >
      <Stage
        ref={stageRef}
        width={viewport.width}
        height={viewport.height}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
        draggable={handSelected}
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) setPan({ x: e.target.x(), y: e.target.y() });
        }}
        onMouseDown={onStageMouseDown}
        onMouseMove={onStageMouseMove}
        onMouseUp={onStageMouseUp}
        onWheel={onWheel}
        onDragMove={handleDragMove}
      >
        {/* Artboard, its background, and every layer */}
        <Layer>
          <Rect
            name="artboard"
            x={0}
            y={0}
            width={doc.width}
            height={doc.height}
            fill="#ffffff"
            shadowColor="#000000"
            shadowBlur={40 / zoom}
            shadowOpacity={0.22}
            shadowOffsetY={12 / zoom}
          />
          <BackgroundNode />
          <Group
            clipX={0}
            clipY={0}
            clipWidth={doc.width}
            clipHeight={doc.height}
          >
            {doc.layers.map((layer) => (
              <LayerNode
                key={layer.id}
                layer={layer}
                anim={playhead > 0 || playing ? sampleAnim(layer.anim, layer, playhead, doc.duration) : IDENTITY}
                onSelect={(id, additive) => (additive ? toggleSelect(id) : select([id]))}
                onChange={(id, patch) => {
                  setGuides({ x: [], y: [] });
                  updateLayer(id, patch);
                }}
                onEditText={setEditing}
                listening={!playing}
              />
            ))}
          </Group>
        </Layer>

        {/* Overlays that never appear in an export */}
        <Layer listening={false}>
          {showGrid && <GridOverlay width={doc.width} height={doc.height} zoom={zoom} />}
          {guides.x.map((x, i) => (
            <Line key={`gx${i}`} points={[x, -4000, x, doc.height + 4000]} stroke="#f04e23" strokeWidth={1 / zoom} dash={[4 / zoom, 4 / zoom]} />
          ))}
          {guides.y.map((y, i) => (
            <Line key={`gy${i}`} points={[-4000, y, doc.width + 4000, y]} stroke="#f04e23" strokeWidth={1 / zoom} dash={[4 / zoom, 4 / zoom]} />
          ))}
          {marquee && (
            <Rect
              x={marquee.x}
              y={marquee.y}
              width={marquee.w}
              height={marquee.h}
              fill="#f04e2318"
              stroke="#f04e23"
              strokeWidth={1 / zoom}
            />
          )}
        </Layer>

        <Layer>
          <Transformer
            ref={trRef}
            rotateEnabled
            keepRatio={false}
            ignoreStroke
            padding={2 / zoom}
            anchorSize={9 / zoom}
            anchorStroke="#f04e23"
            anchorFill="#ffffff"
            anchorCornerRadius={2 / zoom}
            borderStroke="#f04e23"
            borderStrokeWidth={1.4 / zoom}
            rotateAnchorOffset={26 / zoom}
            boundBoxFunc={(oldBox, newBox) =>
              newBox.width < 8 || newBox.height < 8 ? oldBox : newBox
            }
          />
        </Layer>
      </Stage>

      {/* Inline text editing, positioned over the node it belongs to */}
      {editingLayer && (
        <TextOverlay
          layer={editingLayer}
          zoom={zoom}
          pan={pan}
          onCommit={commitText}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------ background */

function BackgroundNode() {
  const bg = useEditor((s) => s.doc.background);
  const width = useEditor((s) => s.doc.width);
  const height = useEditor((s) => s.doc.height);
  const [img] = useImage(bg.kind === "image" ? bg.src : "", "anonymous");

  if (bg.kind === "solid") {
    return <Rect x={0} y={0} width={width} height={height} fill={bg.color} listening={false} />;
  }

  if (bg.kind === "gradient") {
    return (
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        {...fillProps(bg.gradient, width, height)}
        listening={false}
      />
    );
  }

  if (!img) return null;

  // Cover: scale up to fill and centre the overflow.
  const scale =
    bg.fit === "contain"
      ? Math.min(width / img.naturalWidth, height / img.naturalHeight)
      : Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;

  return (
    <Group listening={false} clipX={0} clipY={0} clipWidth={width} clipHeight={height}>
      <KonvaBackgroundImage img={img} x={(width - w) / 2} y={(height - h) / 2} width={w} height={h} blur={bg.blur} />
      {bg.dim > 0 && <Rect x={0} y={0} width={width} height={height} fill="#000000" opacity={bg.dim / 100} />}
    </Group>
  );
}

function KonvaBackgroundImage({
  img, x, y, width, height, blur,
}: { img: HTMLImageElement; x: number; y: number; width: number; height: number; blur: number }) {
  const ref = useRef<Konva.Image>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (blur > 0) node.cache({ pixelRatio: 1 });
    else node.clearCache();
    node.getLayer()?.batchDraw();
  }, [blur, width, height, img]);

  return (
    <KonvaImageTag
      ref={ref}
      image={img}
      x={x}
      y={y}
      width={width}
      height={height}
      filters={blur > 0 ? [Konva.Filters.Blur] : []}
      blurRadius={blur}
      listening={false}
    />
  );
}

/* ------------------------------------------------------------------ grid */

function GridOverlay({ width, height, zoom }: { width: number; height: number; zoom: number }) {
  const step = width > 2000 ? 100 : 50;
  const lines = [];
  for (let x = step; x < width; x += step) {
    lines.push(<Line key={`v${x}`} points={[x, 0, x, height]} stroke="#00000018" strokeWidth={1 / zoom} />);
  }
  for (let y = step; y < height; y += step) {
    lines.push(<Line key={`h${y}`} points={[0, y, width, y]} stroke="#00000018" strokeWidth={1 / zoom} />);
  }
  return <>{lines}</>;
}

/* --------------------------------------------------------- text overlay */

function TextOverlay({
  layer, zoom, pan, onCommit, onCancel,
}: {
  layer: TextLayer;
  zoom: number;
  pan: { x: number; y: number };
  onCommit: (v: string) => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(layer.text);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onCommit(value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onCommit(value); }
        e.stopPropagation();
      }}
      spellCheck={false}
      className="absolute z-20 resize-none border-2 bg-transparent p-0 outline-none"
      style={{
        left: pan.x + layer.x * zoom,
        top: pan.y + layer.y * zoom,
        width: layer.width * zoom,
        height: Math.max(layer.height, layer.fontSize * layer.lineHeight) * zoom,
        fontFamily: resolveFont(layer.fontFamily),
        fontSize: layer.fontSize * zoom,
        fontWeight: layer.fontWeight,
        fontStyle: layer.italic ? "italic" : "normal",
        lineHeight: layer.lineHeight,
        letterSpacing: layer.letterSpacing * zoom,
        textAlign: layer.align === "justify" ? "left" : layer.align,
        color: layer.fill.kind === "solid" ? layer.fill.color : "#000",
        borderColor: "#f04e23",
        transform: `rotate(${layer.rotation}deg)`,
        transformOrigin: "center",
      }}
    />
  );
}
