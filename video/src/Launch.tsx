import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Eyebrow, Misregistered, Rise, Rule, Scene } from "./parts";
import { C, FONT } from "./theme";

/* Scene boundaries, in frames at 30fps. Kept in one place so retiming the film
 * is an edit to this table rather than a hunt through the file. */
const S = {
  open: 0,
  move: 105,
  problem: 225,
  timeline: 375,
  effects: 555,
  render: 720,
  formats: 870,
  templates: 1005,
  end: 1125,
  total: 1290,
};

const len = (from: keyof typeof S, to: keyof typeof S) => S[to] - S[from];

export const Launch: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    <Sequence from={S.open} durationInFrames={len("open", "move")}><Open /></Sequence>
    <Sequence from={S.move} durationInFrames={len("move", "problem")}><Move /></Sequence>
    <Sequence from={S.problem} durationInFrames={len("problem", "timeline")}><Problem /></Sequence>
    <Sequence from={S.timeline} durationInFrames={len("timeline", "effects")}><Timeline /></Sequence>
    <Sequence from={S.effects} durationInFrames={len("effects", "render")}><Effects /></Sequence>
    <Sequence from={S.render} durationInFrames={len("render", "formats")}><Render /></Sequence>
    <Sequence from={S.formats} durationInFrames={len("formats", "templates")}><Formats /></Sequence>
    <Sequence from={S.templates} durationInFrames={len("templates", "end")}><Templates /></Sequence>
    <Sequence from={S.end} durationInFrames={len("end", "total")}><End /></Sequence>
  </AbsoluteFill>
);

export const LAUNCH_LENGTH = S.total;

/* ------------------------------------------------------------------ 01 */
/* Deliberately motionless. The point of the first line is made by holding
 * still while the viewer waits for something to happen. */
const Open: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return (
    <Scene bg={C.paper}>
      <div style={{ opacity: fade }}>
        <div
          style={{
            fontFamily: FONT.display,
            fontSize: 132,
            lineHeight: 0.98,
            letterSpacing: "-0.045em",
            textTransform: "uppercase",
            color: C.ink,
          }}
        >
          A still poster{"\n"}gets scrolled past.
        </div>
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ 02 */
const Move: React.FC = () => (
  <Scene bg={C.paper}>
    <Misregistered text={"Make yours\nmove."} size={168} color={C.ink} over={C.plate1} />
    <Rise delay={38} style={{ marginTop: 64 }}>
      <div style={{ fontFamily: FONT.body, fontSize: 42, color: "#4a453d", maxWidth: 1180, lineHeight: 1.5 }}>
        Handpress is a design studio that runs in a browser tab, where the motion is the point rather than
        an afterthought bolted on at the end.
      </div>
    </Rise>
  </Scene>
);

/* ------------------------------------------------------------------ 03 */
const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // The bar fills, then stops short — the export ceiling, drawn.
  const fill = spring({ frame: frame - 45, fps, config: { damping: 200 } });
  return (
    <Scene>
      <Eyebrow delay={0}>What usually happens next</Eyebrow>
      <Rise delay={12} style={{ marginTop: 40 }}>
        <div
          style={{
            fontFamily: FONT.display,
            fontSize: 108,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            color: C.paper,
          }}
        >
          You hit export{"\n"}and meet a wall.
        </div>
      </Rise>

      <div style={{ marginTop: 90, width: 1400 }}>
        <div style={{ height: 26, background: "#ffffff14", position: "relative", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${interpolate(fill, [0, 1], [0, 46])}%`, background: C.plate1 }} />
          <div style={{ position: "absolute", left: "46%", top: -14, width: 4, height: 54, background: C.yellow }} />
        </div>
        <Rise delay={70} style={{ marginTop: 34 }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 30, color: C.soft, letterSpacing: "0.06em" }}>
            Encoding on a server costs the vendor money, so the download is where the meter goes.
          </div>
        </Rise>
      </div>
    </Scene>
  );
};

/* ------------------------------------------------------------------ 04 */
/* The product claim, shown rather than stated: four layers, four different
 * entrances, each starting at its own moment. */
const LAYERS = [
  { name: "Backdrop", delay: 0, colour: C.plate2, width: 1240 },
  { name: "Headline", delay: 14, colour: C.plate1, width: 980 },
  { name: "Date strip", delay: 28, colour: C.yellow, width: 720 },
  { name: "Ticket note", delay: 42, colour: C.soft, width: 520 },
];

const Timeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <Eyebrow>Every layer, its own timeline</Eyebrow>
      <div style={{ marginTop: 70, display: "flex", flexDirection: "column", gap: 34 }}>
        {LAYERS.map((l) => {
          const s = spring({ frame: frame - 20 - l.delay, fps, config: { damping: 200, mass: 0.8 } });
          return (
            <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 30 }}>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 26,
                  color: C.neutral,
                  width: 280,
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                }}
              >
                {l.name}
              </div>
              <div
                style={{
                  height: 56,
                  width: l.width * s,
                  background: l.colour,
                  opacity: interpolate(s, [0, 0.3, 1], [0, 1, 1]),
                }}
              />
            </div>
          );
        })}
      </div>
      <Rise delay={95} style={{ marginTop: 80 }}>
        <div style={{ fontFamily: FONT.body, fontSize: 40, color: C.soft, maxWidth: 1200, lineHeight: 1.5 }}>
          Eighteen entrances, six idle behaviours, an exit on each element, and eight easing curves to
          shape them with.
        </div>
      </Rise>
    </Scene>
  );
};

/* ------------------------------------------------------------------ 05 */
/* Each effect is drawn the way the editor draws it — stacked copies of the
 * glyphs, offset and re-inked — not as a filter. */
const Effects: React.FC = () => {
  const frame = useCurrentFrame();
  const which = Math.min(3, Math.floor(frame / 38));
  const local = frame % 38;
  const enter = interpolate(local, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  const passes: Record<number, { label: string; render: React.ReactNode }> = {
    0: { label: "Extrude", render: <Stack word="PRESS" copies={9} step={7} back={C.plate1} front={C.paper} /> },
    1: { label: "Echo", render: <Stack word="PRESS" copies={4} step={26} back={C.plate2} front={C.paper} fade /> },
    2: { label: "Neon", render: <Glow word="PRESS" /> },
    3: { label: "Hollow", render: <Hollow word="PRESS" /> },
  };

  return (
    <Scene>
      <Eyebrow>Type effects, built like print</Eyebrow>
      <div style={{ marginTop: 100, height: 300, display: "flex", alignItems: "center", opacity: enter }}>
        {passes[which].render}
      </div>
      <div style={{ marginTop: 60, fontFamily: FONT.mono, fontSize: 30, color: C.plate1, letterSpacing: "0.2em", textTransform: "uppercase" }}>
        {passes[which].label}
      </div>
      <div style={{ marginTop: 40, fontFamily: FONT.body, fontSize: 38, color: C.soft, maxWidth: 1200, lineHeight: 1.5 }}>
        Stacked copies of the letterforms rather than a blur applied afterwards, which is why they hold at six
        times the size.
      </div>
    </Scene>
  );
};

const BIG: React.CSSProperties = {
  fontFamily: FONT.display,
  fontSize: 220,
  letterSpacing: "-0.04em",
  lineHeight: 1,
};

const Stack: React.FC<{ word: string; copies: number; step: number; back: string; front: string; fade?: boolean }> = ({
  word, copies, step, back, front, fade,
}) => (
  <div style={{ position: "relative" }}>
    {Array.from({ length: copies }).map((_, i) => (
      <div
        key={i}
        style={{
          ...BIG,
          position: "absolute",
          left: (copies - i) * step,
          top: (copies - i) * step * 0.6,
          color: back,
          opacity: fade ? 0.22 + (i / copies) * 0.5 : 1,
        }}
      >
        {word}
      </div>
    ))}
    <div style={{ ...BIG, position: "relative", color: front }}>{word}</div>
  </div>
);

const Glow: React.FC<{ word: string }> = ({ word }) => (
  <div style={{ position: "relative" }}>
    {[46, 28, 14].map((b) => (
      <div
        key={b}
        style={{ ...BIG, position: "absolute", inset: 0, color: "#00ffd0", filter: `blur(${b}px)`, opacity: 0.7 }}
      >
        {word}
      </div>
    ))}
    <div style={{ ...BIG, position: "relative", color: C.paper }}>{word}</div>
  </div>
);

const Hollow: React.FC<{ word: string }> = ({ word }) => (
  <div
    style={{
      ...BIG,
      color: "transparent",
      WebkitTextStroke: `4px ${C.paper}`,
    }}
  >
    {word}
  </div>
);

/* ------------------------------------------------------------------ 06 */
const Render: React.FC = () => (
  <Scene bg={C.plate2}>
    <Eyebrow color="#9fb6e8">The part that matters</Eyebrow>
    <Rise delay={12} style={{ marginTop: 44 }}>
      <div
        style={{
          fontFamily: FONT.display,
          fontSize: 116,
          lineHeight: 0.98,
          letterSpacing: "-0.04em",
          textTransform: "uppercase",
          color: "#ffffff",
        }}
      >
        The export is a render,{"\n"}not a screen capture.
      </div>
    </Rise>
    <Rise delay={44} style={{ marginTop: 56 }}>
      <div style={{ fontFamily: FONT.mono, fontSize: 34, color: "#c9d8f2", lineHeight: 1.7 }}>
        sample(spec, layer, t)
      </div>
    </Rise>
    <Rise delay={60} style={{ marginTop: 30 }}>
      <div style={{ fontFamily: FONT.body, fontSize: 40, color: "#cfdcf5", maxWidth: 1250, lineHeight: 1.5 }}>
        One pure function answers where everything sits at any moment. The preview calls it while you scrub;
        the encoder calls it while it writes. That is why the file matches what you approved.
      </div>
    </Rise>
  </Scene>
);

/* ------------------------------------------------------------------ 07 */
const FORMATS = ["MP4", "WEBM", "PNG", "JPG", "WEBP", "SVG", "PDF", "JSON"];

const Formats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <Eyebrow>Eight ways out, none of them capped</Eyebrow>
      <div style={{ marginTop: 80, display: "flex", flexWrap: "wrap", gap: 26, maxWidth: 1500 }}>
        {FORMATS.map((f, i) => {
          const s = spring({ frame: frame - 18 - i * 5, fps, config: { damping: 200, mass: 0.6 } });
          return (
            <div
              key={f}
              style={{
                border: `2px solid ${C.plate1}`,
                padding: "26px 44px",
                fontFamily: FONT.display,
                fontSize: 54,
                color: C.paper,
                letterSpacing: "-0.02em",
                opacity: s,
                transform: `scale(${interpolate(s, [0, 1], [0.86, 1])})`,
              }}
            >
              {f}
            </div>
          );
        })}
      </div>
      <Rise delay={80} style={{ marginTop: 70 }}>
        <div style={{ fontFamily: FONT.body, fontSize: 40, color: C.soft, maxWidth: 1250, lineHeight: 1.5 }}>
          Six times resolution on the rasters, 300 dpi on the print files, and live editable text in the SVG.
        </div>
      </Rise>
    </Scene>
  );
};

/* ------------------------------------------------------------------ 08 */
const Templates: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.round(interpolate(spring({ frame: frame - 10, fps, config: { damping: 200 } }), [0, 1], [0, 40]));
  return (
    <Scene bg={C.paper}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 40 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 300, color: C.ink, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums" }}>
          {count}
        </div>
        <div style={{ fontFamily: FONT.display, fontSize: 86, color: C.plate1, textTransform: "uppercase", letterSpacing: "-0.03em" }}>
          designs{"\n"}to start from
        </div>
      </div>
      <Rise delay={55} style={{ marginTop: 50 }}>
        <div style={{ fontFamily: FONT.body, fontSize: 40, color: "#4a453d", maxWidth: 1300, lineHeight: 1.5 }}>
          Gig bills, market boards, story promos, thumbnails, A4 flyers, menus, cards, opening hours. Each one
          already animated, already the right size, and unlocked to the last layer.
        </div>
      </Rise>
    </Scene>
  );
};

/* ------------------------------------------------------------------ 09 */
const End: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Scene>
      <Misregistered text="HANDPRESS" size={186} delay={4} />
      <div style={{ marginTop: 56 }}>
        <Rule delay={40} width={420} />
      </div>
      <Rise delay={52} style={{ marginTop: 48 }}>
        <div style={{ fontFamily: FONT.body, fontSize: 46, color: C.soft }}>
          No account. No watermark. No ceiling on the export.
        </div>
      </Rise>
      <Rise delay={70} style={{ marginTop: 60 }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 40, color: C.plate1, letterSpacing: "0.1em" }}>
          handpress.vercel.app
        </div>
      </Rise>
      <div
        style={{
          marginTop: 110,
          fontFamily: FONT.mono,
          fontSize: 24,
          color: "#5c564c",
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          opacity: interpolate(frame, [90, 110], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Runs in the browser · nothing uploaded
      </div>
    </Scene>
  );
};
