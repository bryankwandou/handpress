import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "./theme";

/* ------------------------------------------------------------- primitives */

/** Rise-and-fade, the same shape the editor's "rise" entrance produces. */
export const Rise: React.FC<{
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, distance = 60, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.7 } });
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [distance, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** The signature: one word printed twice, the second plate slightly off. */
export const Misregistered: React.FC<{
  text: string;
  size: number;
  delay?: number;
  color?: string;
  over?: string;
}> = ({ text, size, delay = 0, color = C.paper, over = C.plate1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 120, mass: 0.9 } });
  // The offset starts wide and settles, so the plates visibly come into register.
  const slip = interpolate(s, [0, 1], [size * 0.16, size * 0.045]);

  return (
    <div style={{ position: "relative", opacity: s }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          color: over,
          transform: `translate(${-slip}px, ${-slip * 0.6}px)`,
          fontFamily: FONT.display,
          fontSize: size,
          lineHeight: 0.92,
          letterSpacing: "-0.045em",
          textTransform: "uppercase",
          whiteSpace: "pre",
        }}
      >
        {text}
      </div>
      <div
        style={{
          color,
          fontFamily: FONT.display,
          fontSize: size,
          lineHeight: 0.92,
          letterSpacing: "-0.045em",
          textTransform: "uppercase",
          whiteSpace: "pre",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; delay?: number; color?: string }> = ({
  children,
  delay = 0,
  color = C.neutral,
}) => (
  <Rise delay={delay} distance={18}>
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 26,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color,
      }}
    >
      {children}
    </div>
  </Rise>
);

/** A rule that draws itself left to right. */
export const Rule: React.FC<{ delay?: number; color?: string; width?: number }> = ({
  delay = 0,
  color = C.plate1,
  width = 320,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return <div style={{ width: width * s, height: 6, background: color }} />;
};

/**
 * Scenes are composed once against a 1920-wide board and scaled to whatever
 * frame they are rendered into, so the vertical cut is the same layout at a
 * different size rather than a second set of hand-tuned numbers.
 */
export const Scene: React.FC<{ children: React.ReactNode; bg?: string; pad?: number }> = ({
  children,
  bg = C.ink,
  pad = 130,
}) => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: bg, justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 1920, padding: pad, transform: `scale(${width / 1920})`, transformOrigin: "center" }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
