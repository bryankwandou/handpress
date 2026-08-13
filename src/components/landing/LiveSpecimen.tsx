"use client";

import { clsx } from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { sampleAnim } from "@/lib/animation";
import { textEffectPasses } from "@/lib/konva-helpers";
import { makeText } from "@/lib/factories";
import { DEFAULT_TEXT_EFFECT, type AnimPreset, type TextEffectKind } from "@/lib/types";

const EFFECTS: { kind: TextEffectKind; label: string }[] = [
  { kind: "none", label: "Plain" },
  { kind: "shadow", label: "Shadow" },
  { kind: "lift", label: "Lift" },
  { kind: "hollow", label: "Hollow" },
  { kind: "splice", label: "Splice" },
  { kind: "echo", label: "Echo" },
  { kind: "glitch", label: "Glitch" },
  { kind: "neon", label: "Neon" },
  { kind: "outline", label: "Outline" },
  { kind: "extrude", label: "3D" },
];

const MOVES: { preset: AnimPreset; label: string }[] = [
  { preset: "rise", label: "Rise" },
  { preset: "pop", label: "Pop" },
  { preset: "tectonic", label: "Tectonic" },
  { preset: "stomp", label: "Stomp" },
  { preset: "flip3d", label: "Flip" },
  { preset: "roll", label: "Roll" },
  { preset: "blurIn", label: "Blur in" },
  { preset: "typewriter", label: "Typewriter" },
  { preset: "spin", label: "Spin" },
  { preset: "bounce", label: "Bounce" },
];

/**
 * The same effect and motion code the editor runs, wired to plain DOM. What
 * shows up on this page is the product working, not a picture of it.
 */
export function LiveSpecimen({ word = "HANDPRESS" }: { word?: string }) {
  const [effect, setEffect] = useState<TextEffectKind>("extrude");
  const [move, setMove] = useState<AnimPreset>("tectonic");
  const [t, setT] = useState(1.4);
  const rafRef = useRef(0);

  const layer = useMemo(
    () =>
      makeText({
        text: word,
        fontSize: 96,
        width: 720,
        height: 120,
        fontFamily: "var(--font-archivo)",
        effect: { ...DEFAULT_TEXT_EFFECT, kind: effect, intensity: 62, offset: 34, direction: 45, color: "#f04e23", transparency: 30 },
      }),
    [effect, word],
  );

  const passes = textEffectPasses(layer, "currentColor");

  const play = () => {
    cancelAnimationFrame(rafRef.current);
    const started = performance.now();
    const step = () => {
      const elapsed = (performance.now() - started) / 1000;
      setT(elapsed);
      if (elapsed < 2.2) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    play();
    return () => cancelAnimationFrame(rafRef.current);
    // Replaying whenever the chosen motion changes is the point of the demo.
  }, [move]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const anim = sampleAnim(
    { in: { preset: move, duration: 0.9, delay: 0.05, easing: "expoOut" }, out: { preset: "none", duration: 0.4, delay: 0, easing: "easeIn" }, loop: { preset: "none", speed: 1 } },
    layer,
    t,
    3,
  );

  const shown = anim.reveal < 1 ? word.slice(0, Math.ceil(word.length * anim.reveal)) : word;
  const flip = Math.cos((anim.skewY * Math.PI) / 180);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--hairline)] surface-1">
      <div className="checkerboard relative grid h-56 place-items-center overflow-hidden px-6 sm:h-64">
        <div
          className="relative select-none"
          style={{
            opacity: anim.opacity,
            filter: anim.blur > 0.2 ? `blur(${anim.blur}px)` : undefined,
            transform: [
              `translate(${anim.dx}px, ${anim.dy}px)`,
              `scale(${anim.scaleX * (anim.skewY ? Math.max(Math.abs(flip), 0.02) : 1)}, ${anim.scaleY})`,
              `rotate(${anim.rotation}deg)`,
            ].join(" "),
          }}
        >
          {/* Every pass is a real copy of the type, exactly as the canvas draws it. */}
          {passes.map((p, i) => (
            <span
              key={i}
              aria-hidden={i < passes.length - 1}
              className={clsx("font-display whitespace-nowrap tabular", i < passes.length - 1 && "absolute inset-0")}
              style={{
                display: "block",
                fontFamily: "var(--font-archivo)",
                fontSize: "clamp(2.1rem, 7vw, 4.2rem)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                transform: `translate(${p.dx * 0.55}px, ${p.dy * 0.55}px)`,
                color: p.fill === "currentColor" ? "var(--text-1)" : p.fill === "transparent" ? "transparent" : p.fill,
                opacity: p.opacity,
                WebkitTextStroke: p.stroke ? `${(p.strokeWidth ?? 1) * 0.5}px ${p.stroke === "currentColor" ? "var(--text-1)" : p.stroke}` : undefined,
                textShadow: p.shadowColor ? `0 ${(p.shadowOffsetY ?? 0) * 0.5}px ${(p.shadowBlur ?? 0) * 0.5}px ${p.shadowColor}` : undefined,
              }}
            >
              {i === passes.length - 1 ? shown : word}
            </span>
          ))}
        </div>

        <button
          onClick={play}
          className="absolute bottom-3 right-3 rounded-full border border-[var(--hairline)] surface-1 px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-2 transition-colors hover:text-1"
        >
          Replay
        </button>
      </div>

      <div className="space-y-3 border-t border-[var(--hairline)] p-4">
        <ChipRow label="Effect" items={EFFECTS.map((e) => ({ key: e.kind, label: e.label }))} value={effect} onPick={(k) => setEffect(k as TextEffectKind)} />
        <ChipRow label="Motion" items={MOVES.map((m) => ({ key: m.preset, label: m.label }))} value={move} onPick={(k) => setMove(k as AnimPreset)} />
      </div>
    </div>
  );
}

function ChipRow({
  label, items, value, onPick,
}: {
  label: string;
  items: { key: string; label: string }[];
  value: string;
  onPick: (key: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-3">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <button
            key={i.key}
            onClick={() => onPick(i.key)}
            className={clsx(
              "rounded-full border px-2.5 py-1 text-[0.72rem] font-medium transition-all duration-150",
              value === i.key
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]"
                : "border-[var(--hairline)] text-2 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-1",
            )}
          >
            {i.label}
          </button>
        ))}
      </div>
    </div>
  );
}
