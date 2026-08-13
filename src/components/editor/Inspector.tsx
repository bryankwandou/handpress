"use client";

import { clsx } from "clsx";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, FlipHorizontal,
  FlipVertical, Italic, Scissors, Strikethrough, Underline, Wand2,
} from "lucide-react";
import { useState } from "react";
import { removeBackground, removeFlatColour, trimTransparent } from "@/lib/background-removal";
import { fillToCss } from "@/lib/konva-helpers";
import { ANIM_PRESETS, FONTS, GRADIENT_PRESETS, LOOP_PRESETS, SWATCHES } from "@/lib/presets";
import { EASING_NAMES } from "@/lib/animation";
import { useEditor, useSingleSelection } from "@/lib/store";
import {
  BLEND_MODES, NO_FILTERS, solid,
  type EasingName, type Fill, type ImageLayer, type Layer, type PathLayer,
  type ShapeLayer, type TextEffectKind, type TextLayer,
} from "@/lib/types";
import {
  Button, ColorInput, Empty, IconButton, NumberInput, Row, Section,
  SegmentedControl, Select, Slider, Toggle,
} from "@/components/ui/primitives";

const TEXT_EFFECTS: { kind: TextEffectKind; label: string }[] = [
  { kind: "none", label: "None" },
  { kind: "shadow", label: "Shadow" },
  { kind: "lift", label: "Lift" },
  { kind: "hollow", label: "Hollow" },
  { kind: "splice", label: "Splice" },
  { kind: "echo", label: "Echo" },
  { kind: "glitch", label: "Glitch" },
  { kind: "neon", label: "Neon" },
  { kind: "outline", label: "Outline" },
  { kind: "extrude", label: "3D extrude" },
];

export function Inspector() {
  const layer = useSingleSelection();
  const selected = useEditor((s) => s.selected);
  const align = useEditor((s) => s.align);
  const distribute = useEditor((s) => s.distribute);

  if (selected.length > 1) {
    return (
      <div className="scrollbar-thin h-full overflow-y-auto">
        <Section title={`${selected.length} layers picked`}>
          <AlignRow onAlign={align} />
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => distribute("h")}>Spread across</Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => distribute("v")}>Spread down</Button>
          </div>
        </Section>
        <MultiTransform />
      </div>
    );
  }

  if (!layer) {
    return <Empty title="Nothing picked" body="Select something on the board and its controls appear here." />;
  }

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <TransformSection layer={layer} />
      {layer.type === "text" && <TextSection layer={layer} />}
      {layer.type === "text" && <TextEffectSection layer={layer} />}
      {layer.type === "shape" && <ShapeSection layer={layer} />}
      {layer.type === "image" && <ImageSection layer={layer} />}
      {layer.type === "path" && <PathSection layer={layer} />}
      <ShadowSection layer={layer} />
      <AnimationSection layer={layer} />
    </div>
  );
}

/* ------------------------------------------------------------- transform */

function AlignRow({ onAlign }: { onAlign: (e: "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom") => void }) {
  const items = [
    { key: "left" as const, icon: <AlignLeft className="h-3.5 w-3.5" />, label: "Align left" },
    { key: "hcenter" as const, icon: <AlignCenter className="h-3.5 w-3.5" />, label: "Centre across" },
    { key: "right" as const, icon: <AlignRight className="h-3.5 w-3.5" />, label: "Align right" },
    { key: "top" as const, icon: <AlignLeft className="h-3.5 w-3.5 rotate-90" />, label: "Align top" },
    { key: "vcenter" as const, icon: <AlignCenter className="h-3.5 w-3.5 rotate-90" />, label: "Centre down" },
    { key: "bottom" as const, icon: <AlignRight className="h-3.5 w-3.5 rotate-90" />, label: "Align bottom" },
  ];
  return (
    <div className="flex gap-0.5 rounded-lg bg-[var(--surface-2)] p-0.5">
      {items.map((i) => (
        <IconButton key={i.key} label={i.label} className="h-8 flex-1" onClick={() => onAlign(i.key)}>
          {i.icon}
        </IconButton>
      ))}
    </div>
  );
}

function TransformSection({ layer }: { layer: Layer }) {
  const update = useEditor((s) => s.updateLayer);
  const align = useEditor((s) => s.align);
  const commit = useEditor((s) => s.commit);

  return (
    <Section title="Position and size">
      <AlignRow onAlign={align} />
      <div className="grid grid-cols-2 gap-2">
        <Row label="X"><NumberInput value={layer.x} onChange={(x) => update(layer.id, { x })} /></Row>
        <Row label="Y"><NumberInput value={layer.y} onChange={(y) => update(layer.id, { y })} /></Row>
        <Row label="W"><NumberInput value={layer.width} onChange={(width) => update(layer.id, { width })} min={4} /></Row>
        <Row label="H"><NumberInput value={layer.height} onChange={(height) => update(layer.id, { height })} min={4} /></Row>
      </div>
      <Row label="Rotate">
        <Slider value={layer.rotation} min={-180} max={180} onChange={(rotation) => update(layer.id, { rotation }, false)} onCommit={commit} suffix="°" />
      </Row>
      <Row label="Opacity">
        <Slider value={layer.opacity * 100} min={0} max={100} onChange={(v) => update(layer.id, { opacity: v / 100 }, false)} onCommit={commit} suffix="%" />
      </Row>
      <Row label="Blend">
        <Select value={layer.blend} options={BLEND_MODES} onChange={(blend) => update(layer.id, { blend })} className="w-full" />
      </Row>
    </Section>
  );
}

function MultiTransform() {
  const updateSelected = useEditor((s) => s.updateSelected);
  const commit = useEditor((s) => s.commit);
  const [opacity, setOpacity] = useState(100);
  return (
    <Section title="Apply to all picked">
      <Row label="Opacity">
        <Slider
          value={opacity}
          min={0}
          max={100}
          onChange={(v) => { setOpacity(v); updateSelected({ opacity: v / 100 }, false); }}
          onCommit={commit}
          suffix="%"
        />
      </Row>
    </Section>
  );
}

/* ------------------------------------------------------------------ text */

function TextSection({ layer }: { layer: TextLayer }) {
  const update = useEditor((s) => s.updateLayer);
  const commit = useEditor((s) => s.commit);
  const font = FONTS.find((f) => f.family === layer.fontFamily) ?? FONTS[0];

  return (
    <Section title="Type">
      <textarea
        value={layer.text}
        onChange={(e) => update(layer.id, { text: e.target.value } as Partial<Layer>, false)}
        onBlur={commit}
        rows={3}
        className="scrollbar-thin w-full resize-y rounded-md border border-[var(--hairline)] bg-[var(--surface-1)] p-2.5 text-[0.82rem] text-1 outline-none focus:border-[var(--accent)]"
      />

      <Row label="Face">
        <Select
          value={layer.fontFamily}
          options={FONTS.map((f) => ({ value: f.family, label: f.label }))}
          onChange={(fontFamily) => update(layer.id, { fontFamily } as Partial<Layer>)}
          className="w-full"
        />
      </Row>
      <Row label="Weight">
        <Select
          value={layer.fontWeight}
          options={font.weights.map((w) => ({ value: w, label: String(w) }))}
          onChange={(fontWeight) => update(layer.id, { fontWeight } as Partial<Layer>)}
        />
      </Row>
      <Row label="Size">
        <Slider value={layer.fontSize} min={6} max={480} onChange={(fontSize) => update(layer.id, { fontSize } as Partial<Layer>, false)} onCommit={commit} />
      </Row>
      <Row label="Line height">
        <Slider value={layer.lineHeight} min={0.6} max={3} step={0.01} onChange={(lineHeight) => update(layer.id, { lineHeight } as Partial<Layer>, false)} onCommit={commit} />
      </Row>
      <Row label="Tracking">
        <Slider value={layer.letterSpacing} min={-20} max={80} step={0.5} onChange={(letterSpacing) => update(layer.id, { letterSpacing } as Partial<Layer>, false)} onCommit={commit} />
      </Row>
      <Row label="Curve">
        <Slider value={layer.curve} min={-100} max={100} onChange={(curve) => update(layer.id, { curve } as Partial<Layer>, false)} onCommit={commit} />
      </Row>

      <div className="flex gap-0.5 rounded-lg bg-[var(--surface-2)] p-0.5">
        <IconButton label="Bold" active={layer.fontWeight >= 700} className="h-8 flex-1"
          onClick={() => update(layer.id, { fontWeight: layer.fontWeight >= 700 ? 400 : 700 } as Partial<Layer>)}>
          <Bold className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton label="Italic" active={layer.italic} className="h-8 flex-1"
          onClick={() => update(layer.id, { italic: !layer.italic } as Partial<Layer>)}>
          <Italic className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton label="Underline" active={layer.underline} className="h-8 flex-1"
          onClick={() => update(layer.id, { underline: !layer.underline } as Partial<Layer>)}>
          <Underline className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton label="Strike" active={layer.strikethrough} className="h-8 flex-1"
          onClick={() => update(layer.id, { strikethrough: !layer.strikethrough } as Partial<Layer>)}>
          <Strikethrough className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton label="Capitals" active={layer.uppercase} className="h-8 flex-1"
          onClick={() => update(layer.id, { uppercase: !layer.uppercase } as Partial<Layer>)}>
          <span className="text-[0.72rem] font-bold">AA</span>
        </IconButton>
      </div>

      <SegmentedControl
        value={layer.align}
        onChange={(align) => update(layer.id, { align } as Partial<Layer>)}
        options={[
          { value: "left" as const, label: <AlignLeft className="mx-auto h-3.5 w-3.5" />, title: "Left" },
          { value: "center" as const, label: <AlignCenter className="mx-auto h-3.5 w-3.5" />, title: "Centre" },
          { value: "right" as const, label: <AlignRight className="mx-auto h-3.5 w-3.5" />, title: "Right" },
          { value: "justify" as const, label: <AlignJustify className="mx-auto h-3.5 w-3.5" />, title: "Justify" },
        ]}
      />

      <FillPicker fill={layer.fill} onChange={(fill) => update(layer.id, { fill } as Partial<Layer>)} />
    </Section>
  );
}

function TextEffectSection({ layer }: { layer: TextLayer }) {
  const update = useEditor((s) => s.updateLayer);
  const commit = useEditor((s) => s.commit);
  const e = layer.effect;
  const setEffect = (patch: Partial<typeof e>, record = true) =>
    update(layer.id, { effect: { ...e, ...patch } } as Partial<Layer>, record);

  const showOffset = ["shadow", "splice", "echo", "glitch", "extrude"].includes(e.kind);
  const showIntensity = ["lift", "hollow", "splice", "neon", "outline", "extrude"].includes(e.kind);
  const showColour = ["shadow", "splice", "echo", "glitch", "neon", "outline", "extrude"].includes(e.kind);
  const showBlur = e.kind === "shadow";
  const showTransparency = ["shadow", "splice", "echo", "glitch"].includes(e.kind);

  return (
    <Section title="Effects">
      <div className="grid grid-cols-3 gap-1.5">
        {TEXT_EFFECTS.map((t) => (
          <button
            key={t.kind}
            onClick={() => setEffect({ kind: t.kind })}
            className={clsx(
              "rounded-lg border px-2 py-2.5 text-[0.7rem] font-medium transition-all duration-150",
              e.kind === t.kind
                ? "border-[var(--accent)] bg-[var(--accent)]/12 text-1"
                : "border-[var(--hairline)] text-2 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-1",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showIntensity && (
        <Row label="Strength">
          <Slider value={e.intensity} min={0} max={100} onChange={(intensity) => setEffect({ intensity }, false)} onCommit={commit} />
        </Row>
      )}
      {showOffset && (
        <Row label="Distance">
          <Slider value={e.offset} min={0} max={100} onChange={(offset) => setEffect({ offset }, false)} onCommit={commit} />
        </Row>
      )}
      {showOffset && (
        <Row label="Direction">
          <Slider value={e.direction} min={0} max={360} onChange={(direction) => setEffect({ direction }, false)} onCommit={commit} suffix="°" />
        </Row>
      )}
      {showBlur && (
        <Row label="Blur">
          <Slider value={e.blur} min={0} max={80} onChange={(blur) => setEffect({ blur }, false)} onCommit={commit} />
        </Row>
      )}
      {showTransparency && (
        <Row label="Transparency">
          <Slider value={e.transparency} min={0} max={100} onChange={(transparency) => setEffect({ transparency }, false)} onCommit={commit} suffix="%" />
        </Row>
      )}
      {showColour && (
        <Row label="Effect colour">
          <ColorInput value={e.color} onChange={(color) => setEffect({ color })} />
        </Row>
      )}
      {e.kind === "none" && (
        <p className="text-[0.72rem] leading-relaxed text-3">
          Pick an effect above. Each one is drawn as real stacked copies of the type, so it survives export at any size.
        </p>
      )}
    </Section>
  );
}

/* ----------------------------------------------------------------- fills */

function FillPicker({ fill, onChange }: { fill: Fill; onChange: (f: Fill) => void }) {
  return (
    <div className="space-y-2.5">
      <SegmentedControl
        value={fill.kind}
        onChange={(kind) =>
          onChange(kind === "solid" ? solid(fill.kind === "gradient" ? fill.stops[0].color : "#14120e") : GRADIENT_PRESETS[0].gradient)
        }
        options={[
          { value: "solid" as const, label: "Flat" },
          { value: "gradient" as const, label: "Gradient" },
        ]}
      />

      {fill.kind === "solid" ? (
        <>
          <Row label="Colour"><ColorInput value={fill.color} onChange={(color) => onChange(solid(color))} /></Row>
          <div className="flex flex-wrap gap-1.5">
            {SWATCHES[0].colors.concat(SWATCHES[1].colors).map((c) => (
              <button
                key={c}
                onClick={() => onChange(solid(c))}
                className="h-6 w-6 rounded border border-[var(--hairline)] transition-transform hover:scale-110"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            {GRADIENT_PRESETS.map((g) => (
              <button
                key={g.name}
                title={g.name}
                onClick={() => onChange(g.gradient)}
                className="aspect-square rounded-md border border-[var(--hairline)] transition-transform hover:-translate-y-0.5 hover:border-[var(--accent)]"
                style={{ background: fillToCss(g.gradient) }}
              />
            ))}
          </div>
          <Row label="Angle">
            <Slider value={fill.angle} min={0} max={360} onChange={(angle) => onChange({ ...fill, angle })} suffix="°" />
          </Row>
          <Row label="Stops">
            <span className="flex gap-1.5">
              {fill.stops.map((s, i) => (
                <input
                  key={i}
                  type="color"
                  value={s.color}
                  onChange={(ev) =>
                    onChange({ ...fill, stops: fill.stops.map((st, j) => (j === i ? { ...st, color: ev.target.value } : st)) })
                  }
                  className="h-7 w-7 rounded"
                />
              ))}
            </span>
          </Row>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- shapes */

function ShapeSection({ layer }: { layer: ShapeLayer }) {
  const update = useEditor((s) => s.updateLayer);
  const commit = useEditor((s) => s.commit);
  const p = (patch: Partial<ShapeLayer>, record = true) => update(layer.id, patch as Partial<Layer>, record);

  return (
    <Section title="Shape">
      <FillPicker fill={layer.fill} onChange={(fill) => p({ fill })} />
      <Row label="Outline"><ColorInput value={layer.stroke} onChange={(stroke) => p({ stroke })} /></Row>
      <Row label="Thickness">
        <Slider value={layer.strokeWidth} min={0} max={60} onChange={(strokeWidth) => p({ strokeWidth }, false)} onCommit={commit} />
      </Row>
      <Row label="Dashes">
        <SegmentedControl
          value={layer.dash.length ? "dashed" : "solid"}
          onChange={(v) => p({ dash: v === "dashed" ? [18, 12] : [] })}
          options={[{ value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }]}
        />
      </Row>
      {layer.shape === "rect" && (
        <Row label="Corner">
          <Slider value={layer.cornerRadius} min={0} max={Math.min(layer.width, layer.height) / 2} onChange={(cornerRadius) => p({ cornerRadius }, false)} onCommit={commit} />
        </Row>
      )}
      {(layer.shape === "star" || layer.shape === "polygon" || layer.shape === "burst") && (
        <Row label="Points">
          <Slider value={layer.sides} min={3} max={24} onChange={(sides) => p({ sides }, false)} onCommit={commit} />
        </Row>
      )}
      {layer.shape === "star" && (
        <Row label="Waist">
          <Slider value={layer.innerRatio} min={0.1} max={0.9} step={0.01} onChange={(innerRatio) => p({ innerRatio }, false)} onCommit={commit} />
        </Row>
      )}
    </Section>
  );
}

function PathSection({ layer }: { layer: PathLayer }) {
  const update = useEditor((s) => s.updateLayer);
  return (
    <Section title="Graphic">
      <FillPicker fill={layer.fill} onChange={(fill) => update(layer.id, { fill } as Partial<Layer>)} />
    </Section>
  );
}

/* ---------------------------------------------------------------- images */

function ImageSection({ layer }: { layer: ImageLayer }) {
  const update = useEditor((s) => s.updateLayer);
  const commit = useEditor((s) => s.commit);
  const [cutting, setCutting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const f = layer.filters;

  const setFilter = (patch: Partial<typeof f>, record = true) =>
    update(layer.id, { filters: { ...f, ...patch } } as Partial<Layer>, record);

  const runModelCutout = async () => {
    setError(null);
    setCutting("Loading the model");
    try {
      const cut = await removeBackground(layer.originalSrc, (p) =>
        setCutting(p.stage[0].toUpperCase() + p.stage.slice(1) + ` ${Math.round(p.ratio * 100)}%`),
      );
      const trimmed = await trimTransparent(cut);
      const ratio = trimmed.width / trimmed.height;
      update(layer.id, {
        src: trimmed.src,
        backgroundRemoved: true,
        naturalWidth: trimmed.width,
        naturalHeight: trimmed.height,
        height: layer.width / ratio,
      } as Partial<Layer>);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The cutout did not finish.");
    } finally {
      setCutting(null);
    }
  };

  const runFlatCutout = async () => {
    setError(null);
    setCutting("Knocking out the backdrop");
    try {
      const cut = await removeFlatColour(layer.originalSrc);
      update(layer.id, { src: cut, backgroundRemoved: true } as Partial<Layer>);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work on this picture.");
    } finally {
      setCutting(null);
    }
  };

  return (
    <>
      <Section title="Cutout">
        {cutting ? (
          <div className="rounded-lg border border-[var(--accent)] px-3 py-3">
            <p className="text-[0.78rem] text-1">{cutting}</p>
            <p className="mt-1 text-[0.7rem] text-3">Running in this tab. The picture is not uploaded.</p>
          </div>
        ) : (
          <>
            <Button variant="primary" size="sm" className="w-full" onClick={runModelCutout}>
              <Wand2 className="h-3.5 w-3.5" />
              {layer.backgroundRemoved ? "Cut out again" : "Remove the background"}
            </Button>
            <Button variant="outline" size="sm" className="w-full" onClick={runFlatCutout}>
              <Scissors className="h-3.5 w-3.5" /> Knock out a flat colour
            </Button>
            {layer.backgroundRemoved && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => update(layer.id, { src: layer.originalSrc, backgroundRemoved: false } as Partial<Layer>)}
              >
                Put the background back
              </Button>
            )}
          </>
        )}
        {error && <p className="text-[0.72rem] text-[var(--color-press-500)]">{error}</p>}
      </Section>

      <Section title="Adjust">
        <Row label="Brightness"><Slider value={f.brightness} min={-100} max={100} onChange={(brightness) => setFilter({ brightness }, false)} onCommit={commit} /></Row>
        <Row label="Contrast"><Slider value={f.contrast} min={-100} max={100} onChange={(contrast) => setFilter({ contrast }, false)} onCommit={commit} /></Row>
        <Row label="Saturation"><Slider value={f.saturation} min={-100} max={100} onChange={(saturation) => setFilter({ saturation }, false)} onCommit={commit} /></Row>
        <Row label="Hue"><Slider value={f.hue} min={-180} max={180} onChange={(hue) => setFilter({ hue }, false)} onCommit={commit} suffix="°" /></Row>
        <Row label="Blur"><Slider value={f.blur} min={0} max={40} onChange={(blur) => setFilter({ blur }, false)} onCommit={commit} /></Row>
        <Row label="Grain"><Slider value={f.noise} min={0} max={100} onChange={(noise) => setFilter({ noise }, false)} onCommit={commit} /></Row>
        <Row label="Pixelate"><Slider value={f.pixelate} min={1} max={40} onChange={(pixelate) => setFilter({ pixelate }, false)} onCommit={commit} /></Row>
        <Row label="Greyscale"><Toggle checked={f.grayscale > 50} onChange={(v) => setFilter({ grayscale: v ? 100 : 0 })} label="Greyscale" /></Row>
        <Row label="Sepia"><Toggle checked={f.sepia > 50} onChange={(v) => setFilter({ sepia: v ? 100 : 0 })} label="Sepia" /></Row>
        <Row label="Invert"><Toggle checked={f.invert > 50} onChange={(v) => setFilter({ invert: v ? 100 : 0 })} label="Invert" /></Row>
        <Button size="sm" variant="ghost" className="w-full" onClick={() => setFilter({ ...NO_FILTERS })}>
          Reset every adjustment
        </Button>
      </Section>

      <Section title="Frame">
        <Row label="Corner">
          <Slider value={layer.cornerRadius} min={0} max={Math.min(layer.width, layer.height) / 2} onChange={(cornerRadius) => update(layer.id, { cornerRadius } as Partial<Layer>, false)} onCommit={commit} />
        </Row>
        <Row label="Border"><ColorInput value={layer.stroke} onChange={(stroke) => update(layer.id, { stroke } as Partial<Layer>)} /></Row>
        <Row label="Width">
          <Slider value={layer.strokeWidth} min={0} max={40} onChange={(strokeWidth) => update(layer.id, { strokeWidth } as Partial<Layer>, false)} onCommit={commit} />
        </Row>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => update(layer.id, { flipX: !layer.flipX } as Partial<Layer>)}>
            <FlipHorizontal className="h-3.5 w-3.5" /> Flip
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => update(layer.id, { flipY: !layer.flipY } as Partial<Layer>)}>
            <FlipVertical className="h-3.5 w-3.5" /> Flip
          </Button>
        </div>
      </Section>
    </>
  );
}

/* --------------------------------------------------------------- shadows */

function ShadowSection({ layer }: { layer: Layer }) {
  const update = useEditor((s) => s.updateLayer);
  const commit = useEditor((s) => s.commit);
  const sh = layer.shadow;
  const set = (patch: Partial<typeof sh>, record = true) =>
    update(layer.id, { shadow: { ...sh, ...patch } }, record);

  return (
    <Section
      title="Drop shadow"
      action={<Toggle checked={sh.enabled} onChange={(enabled) => set({ enabled })} label="Drop shadow" />}
    >
      {sh.enabled && (
        <>
          <Row label="Colour"><ColorInput value={sh.color} onChange={(color) => set({ color })} /></Row>
          <Row label="Blur"><Slider value={sh.blur} min={0} max={200} onChange={(blur) => set({ blur }, false)} onCommit={commit} /></Row>
          <Row label="Across"><Slider value={sh.offsetX} min={-200} max={200} onChange={(offsetX) => set({ offsetX }, false)} onCommit={commit} /></Row>
          <Row label="Down"><Slider value={sh.offsetY} min={-200} max={200} onChange={(offsetY) => set({ offsetY }, false)} onCommit={commit} /></Row>
          <Row label="Strength"><Slider value={sh.opacity * 100} min={0} max={100} onChange={(v) => set({ opacity: v / 100 }, false)} onCommit={commit} suffix="%" /></Row>
        </>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------- animation */

function AnimationSection({ layer }: { layer: Layer }) {
  const update = useEditor((s) => s.updateLayer);
  const setPlaying = useEditor((s) => s.setPlaying);
  const setPlayhead = useEditor((s) => s.setPlayhead);
  const a = layer.anim;

  const preview = () => { setPlayhead(0); setPlaying(true); };

  return (
    <Section
      title="Motion"
      action={<Button size="sm" variant="ghost" onClick={preview}>Play</Button>}
    >
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-3">Entrance</p>
      <div className="grid grid-cols-3 gap-1.5">
        {ANIM_PRESETS.map((p) => (
          <button
            key={p.value}
            title={p.hint}
            onClick={() => {
              update(layer.id, { anim: { ...a, in: { ...a.in, preset: p.value } } });
              preview();
            }}
            className={clsx(
              "rounded-lg border px-1.5 py-2 text-[0.68rem] font-medium transition-all duration-150",
              a.in.preset === p.value
                ? "border-[var(--accent)] bg-[var(--accent)]/12 text-1"
                : "border-[var(--hairline)] text-2 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-1",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {a.in.preset !== "none" && (
        <>
          <Row label="Length">
            <Slider value={a.in.duration} min={0.1} max={5} step={0.05}
              onChange={(duration) => update(layer.id, { anim: { ...a, in: { ...a.in, duration } } }, false)} suffix="s" />
          </Row>
          <Row label="Wait">
            <Slider value={a.in.delay} min={0} max={8} step={0.05}
              onChange={(delay) => update(layer.id, { anim: { ...a, in: { ...a.in, delay } } }, false)} suffix="s" />
          </Row>
          <Row label="Curve">
            <Select
              value={a.in.easing}
              options={EASING_NAMES.map((e: EasingName) => ({ value: e, label: e }))}
              onChange={(easing) => update(layer.id, { anim: { ...a, in: { ...a.in, easing } } })}
            />
          </Row>
        </>
      )}

      <p className="pt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-3">While it sits</p>
      <div className="grid grid-cols-4 gap-1.5">
        {LOOP_PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => { update(layer.id, { anim: { ...a, loop: { ...a.loop, preset: p.value } } }); preview(); }}
            className={clsx(
              "rounded-lg border px-1 py-2 text-[0.66rem] font-medium transition-all duration-150",
              a.loop.preset === p.value
                ? "border-[var(--accent)] bg-[var(--accent)]/12 text-1"
                : "border-[var(--hairline)] text-2 hover:border-[var(--accent)] hover:text-1",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {a.loop.preset !== "none" && (
        <Row label="Speed">
          <Slider value={a.loop.speed} min={0.1} max={4} step={0.05}
            onChange={(speed) => update(layer.id, { anim: { ...a, loop: { ...a.loop, speed } } }, false)} suffix="×" />
        </Row>
      )}

      <p className="pt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-3">Exit</p>
      <Row label="Preset">
        <Select
          value={a.out.preset}
          options={ANIM_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
          onChange={(preset) => { update(layer.id, { anim: { ...a, out: { ...a.out, preset } } }); preview(); }}
          className="w-full"
        />
      </Row>
      {a.out.preset !== "none" && (
        <Row label="Length">
          <Slider value={a.out.duration} min={0.1} max={5} step={0.05}
            onChange={(duration) => update(layer.id, { anim: { ...a, out: { ...a.out, duration } } }, false)} suffix="s" />
        </Row>
      )}
    </Section>
  );
}
