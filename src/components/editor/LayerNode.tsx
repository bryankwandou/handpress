"use client";

import Konva from "konva";
import { useEffect, useMemo, useRef } from "react";
import {
  Ellipse, Group, Image as KImage, Line, Path, Rect, RegularPolygon,
  Star, Text as KText, TextPath,
} from "react-konva";
import useImage from "use-image";
import type { AnimState } from "@/lib/animation";
import {
  SHAPE_PATHS, curvePath, decoration, fillProps, fontStyle, linePoints,
  resolveFont, shadowProps, textEffectPasses,
} from "@/lib/konva-helpers";
import type { ImageLayer, Layer, PathLayer, ShapeLayer, TextLayer } from "@/lib/types";

/** Konva does not re-export its filter signature, so borrow it from a built-in. */
type KonvaFilter = typeof Konva.Filters.Blur;

type Props = {
  layer: Layer;
  anim: AnimState;
  onSelect?: (id: string, additive: boolean) => void;
  onChange?: (id: string, patch: Partial<Layer>) => void;
  onEditText?: (id: string) => void;
  listening?: boolean;
  /** Suppress live editing behaviour while rendering export frames. */
  exporting?: boolean;
};

export function LayerNode({ layer, anim, onSelect, onChange, onEditText, listening = true, exporting }: Props) {
  const groupRef = useRef<Konva.Group>(null);

  const w = Math.max(layer.width, 1);
  const h = Math.max(layer.height, 1);

  // A skew on the Y axis reads as a card turning away from the viewer, so the
  // horizontal scale tracks the cosine of the angle.
  const flip = Math.cos((anim.skewY * Math.PI) / 180);
  const scaleX = anim.scaleX * (anim.skewY ? Math.max(Math.abs(flip), 0.02) : 1);

  const common = {
    x: layer.x + w / 2 + anim.dx,
    y: layer.y + h / 2 + anim.dy,
    offsetX: w / 2,
    offsetY: h / 2,
    width: w,
    height: h,
    rotation: layer.rotation + anim.rotation,
    scaleX,
    scaleY: anim.scaleY,
    opacity: layer.opacity * anim.opacity,
    visible: layer.visible,
    globalCompositeOperation: layer.blend,
    listening: listening && !layer.locked && layer.visible,
    draggable: listening && !layer.locked && layer.visible && !exporting,
    id: layer.id,
  };

  // Wipe reveals the box left to right by clipping the group.
  const clip =
    anim.reveal < 1 && layer.type !== "text"
      ? { clipX: 0, clipY: 0, clipWidth: w * anim.reveal, clipHeight: h }
      : {};

  const handlers = exporting
    ? {}
    : {
        onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => {
          e.cancelBubble = true;
          onSelect?.(layer.id, e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey);
        },
        onTap: (e: Konva.KonvaEventObject<Event>) => {
          e.cancelBubble = true;
          onSelect?.(layer.id, false);
        },
        onDblClick: () => layer.type === "text" && onEditText?.(layer.id),
        onDblTap: () => layer.type === "text" && onEditText?.(layer.id),
        onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
          onChange?.(layer.id, {
            x: e.target.x() - w / 2 - anim.dx,
            y: e.target.y() - h / 2 - anim.dy,
          });
        },
        onTransformEnd: () => {
          const node = groupRef.current;
          if (!node) return;
          const sx = node.scaleX() / (scaleX || 1);
          const sy = node.scaleY() / (anim.scaleY || 1);
          const nextW = Math.max(4, w * sx);
          const nextH = Math.max(4, h * sy);
          node.scaleX(scaleX);
          node.scaleY(anim.scaleY);
          const patch: Partial<Layer> = {
            x: node.x() - nextW / 2 - anim.dx,
            y: node.y() - nextH / 2 - anim.dy,
            width: nextW,
            height: nextH,
            rotation: node.rotation() - anim.rotation,
          };
          // Type scales with its box; keeping the point size fixed would be a
          // surprise when someone drags a corner handle.
          if (layer.type === "text") {
            (patch as Partial<TextLayer>).fontSize = Math.max(
              4,
              (layer as TextLayer).fontSize * Math.min(sx, sy),
            );
          }
          onChange?.(layer.id, patch);
        },
      };

  return (
    <Group ref={groupRef} {...common} {...clip} {...handlers} name="layer-node">
      {layer.type === "text" && <TextContent layer={layer} anim={anim} />}
      {layer.type === "shape" && <ShapeContent layer={layer} />}
      {layer.type === "image" && <ImageContent layer={layer} animBlur={anim.blur} />}
      {layer.type === "path" && <PathContent layer={layer} />}
    </Group>
  );
}

/* ------------------------------------------------------------------ text */

function TextContent({ layer, anim }: { layer: TextLayer; anim: AnimState }) {
  const family = useMemo(() => resolveFont(layer.fontFamily), [layer.fontFamily]);

  let content = layer.uppercase ? layer.text.toUpperCase() : layer.text;
  if (anim.reveal < 1) {
    // Typewriter and wipe both land here; slicing keeps glyph shaping intact.
    content = content.slice(0, Math.ceil(content.length * anim.reveal));
  }

  const baseColor = layer.fill.kind === "solid" ? layer.fill.color : "#000000";
  const passes = textEffectPasses(layer, baseColor);
  const gradient = layer.fill.kind === "gradient" ? fillProps(layer.fill, layer.width, layer.height) : null;

  const shared = {
    text: content,
    fontFamily: family,
    fontSize: layer.fontSize,
    fontStyle: fontStyle(layer),
    textDecoration: decoration(layer),
    align: layer.align,
    lineHeight: layer.lineHeight,
    letterSpacing: layer.letterSpacing,
    width: layer.width,
    wrap: "word" as const,
    perfectDrawEnabled: false,
    listening: false,
  };

  if (layer.curve !== 0) {
    return (
      <>
        {passes.map((p, i) => (
          <TextPath
            key={i}
            data={curvePath(layer.width, layer.curve)}
            text={content}
            fontFamily={family}
            fontSize={layer.fontSize}
            fontStyle={fontStyle(layer)}
            letterSpacing={layer.letterSpacing}
            align={layer.align === "justify" ? "left" : layer.align}
            x={p.dx}
            y={layer.height / 2 + p.dy}
            fill={p.fill === "transparent" ? undefined : p.fill}
            stroke={p.stroke}
            strokeWidth={p.strokeWidth}
            opacity={p.opacity}
            listening={false}
            {...(i === passes.length - 1 ? shadowProps(layer.shadow) : {})}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {passes.map((p, i) => {
        const isTop = i === passes.length - 1;
        return (
          <KText
            key={i}
            {...shared}
            x={p.dx}
            y={p.dy}
            fill={p.fill === "transparent" ? undefined : p.fill}
            stroke={p.stroke}
            strokeWidth={p.strokeWidth}
            fillAfterStrokeEnabled
            opacity={p.opacity}
            shadowColor={p.shadowColor}
            shadowBlur={p.shadowBlur}
            shadowOpacity={p.shadowOpacity}
            shadowOffsetX={p.shadowOffsetX}
            shadowOffsetY={p.shadowOffsetY}
            {...(isTop && gradient ? gradient : {})}
            {...(isTop && !p.shadowColor ? shadowProps(layer.shadow) : {})}
          />
        );
      })}
    </>
  );
}

/* ----------------------------------------------------------------- shape */

function ShapeContent({ layer }: { layer: ShapeLayer }) {
  const w = layer.width;
  const h = layer.height;
  const paint = {
    ...fillProps(layer.fill, w, h),
    stroke: layer.strokeWidth > 0 ? layer.stroke : undefined,
    strokeWidth: layer.strokeWidth,
    dash: layer.dash.length ? layer.dash : undefined,
    ...shadowProps(layer.shadow),
    listening: true,
    perfectDrawEnabled: false,
  };

  switch (layer.shape) {
    case "rect":
      return <Rect width={w} height={h} cornerRadius={layer.cornerRadius} {...paint} />;

    case "ellipse":
      return <Ellipse x={w / 2} y={h / 2} radiusX={w / 2} radiusY={h / 2} {...paint} />;

    case "triangle":
      return (
        <Line points={[w / 2, 0, w, h, 0, h]} closed lineJoin="round" cornerRadius={layer.cornerRadius} {...paint} />
      );

    case "polygon":
      return (
        <RegularPolygon
          x={w / 2} y={h / 2} sides={Math.max(3, layer.sides)}
          radius={Math.min(w, h) / 2} scaleX={w / Math.min(w, h)} scaleY={h / Math.min(w, h)}
          {...paint}
        />
      );

    case "star":
    case "burst":
      return (
        <Star
          x={w / 2} y={h / 2}
          numPoints={Math.max(3, layer.sides)}
          innerRadius={(Math.min(w, h) / 2) * (layer.shape === "burst" ? 0.78 : layer.innerRatio)}
          outerRadius={Math.min(w, h) / 2}
          scaleX={w / Math.min(w, h)} scaleY={h / Math.min(w, h)}
          {...paint}
        />
      );

    case "line":
      return (
        <Line
          points={linePoints(w, h)}
          stroke={layer.fill.kind === "solid" ? layer.fill.color : "#000"}
          strokeWidth={Math.max(layer.strokeWidth, 4)}
          dash={layer.dash.length ? layer.dash : undefined}
          lineCap="round"
          {...shadowProps(layer.shadow)}
        />
      );

    default: {
      const d = SHAPE_PATHS[layer.shape];
      if (!d) return <Rect width={w} height={h} {...paint} />;
      return <Path data={d} scaleX={w / 100} scaleY={h / 100} {...paint} />;
    }
  }
}

/* ------------------------------------------------------------------ path */

function PathContent({ layer }: { layer: PathLayer }) {
  return (
    <Path
      data={layer.d}
      scaleX={layer.width / layer.viewBox}
      scaleY={layer.height / layer.viewBox}
      {...fillProps(layer.fill, layer.width, layer.height)}
      stroke={layer.strokeWidth > 0 ? layer.stroke : undefined}
      strokeWidth={layer.strokeWidth}
      {...shadowProps(layer.shadow)}
      perfectDrawEnabled={false}
    />
  );
}

/* ----------------------------------------------------------------- image */

function ImageContent({ layer, animBlur }: { layer: ImageLayer; animBlur: number }) {
  const [img] = useImage(layer.src, "anonymous");
  const ref = useRef<Konva.Image>(null);
  const f = layer.filters;

  const filters = useMemo(() => {
    const list: KonvaFilter[] = [];
    if (f.brightness !== 0) list.push(Konva.Filters.Brighten);
    if (f.contrast !== 0) list.push(Konva.Filters.Contrast);
    if (f.saturation !== 0 || f.hue !== 0) list.push(Konva.Filters.HSL);
    if (f.grayscale > 50) list.push(Konva.Filters.Grayscale);
    if (f.sepia > 50) list.push(Konva.Filters.Sepia);
    if (f.invert > 50) list.push(Konva.Filters.Invert);
    if (f.noise > 0) list.push(Konva.Filters.Noise);
    if (f.pixelate > 1) list.push(Konva.Filters.Pixelate);
    if (f.blur > 0 || animBlur > 0.4) list.push(Konva.Filters.Blur);
    return list;
  }, [f, animBlur]);

  // Konva filters only run against a cached bitmap, so the cache has to be
  // rebuilt whenever the source, the box, or any filter value moves.
  useEffect(() => {
    const node = ref.current;
    if (!node || !img) return;
    if (filters.length === 0) {
      node.clearCache();
      node.getLayer()?.batchDraw();
      return;
    }
    node.cache({ pixelRatio: 1 });
    node.getLayer()?.batchDraw();
  }, [img, filters, layer.width, layer.height, layer.cornerRadius, f, animBlur]);

  if (!img) {
    return <Rect width={layer.width} height={layer.height} fill="#00000012" cornerRadius={layer.cornerRadius} />;
  }

  const crop = layer.crop
    ? {
        crop: {
          x: layer.crop.x * layer.naturalWidth,
          y: layer.crop.y * layer.naturalHeight,
          width: layer.crop.width * layer.naturalWidth,
          height: layer.crop.height * layer.naturalHeight,
        },
      }
    : {};

  return (
    <KImage
      ref={ref}
      image={img}
      width={layer.width}
      height={layer.height}
      scaleX={layer.flipX ? -1 : 1}
      scaleY={layer.flipY ? -1 : 1}
      x={layer.flipX ? layer.width : 0}
      y={layer.flipY ? layer.height : 0}
      cornerRadius={layer.cornerRadius}
      stroke={layer.strokeWidth > 0 ? layer.stroke : undefined}
      strokeWidth={layer.strokeWidth}
      filters={filters}
      brightness={f.brightness / 100}
      contrast={f.contrast}
      saturation={f.saturation / 50}
      hue={f.hue}
      luminance={0}
      noise={f.noise / 100}
      pixelSize={Math.max(1, Math.round(f.pixelate))}
      blurRadius={Math.max(f.blur, animBlur)}
      {...crop}
      {...shadowProps(layer.shadow)}
      perfectDrawEnabled={false}
    />
  );
}
