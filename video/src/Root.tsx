import React from "react";
import { Composition } from "remotion";
import { LAUNCH_LENGTH, Launch } from "./Launch";
import { FPS } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Launch"
      component={Launch}
      durationInFrames={LAUNCH_LENGTH}
      fps={FPS}
      width={1920}
      height={1080}
    />
    {/* Same film, cropped for a phone-shaped feed. */}
    <Composition
      id="LaunchVertical"
      component={Launch}
      durationInFrames={LAUNCH_LENGTH}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);
