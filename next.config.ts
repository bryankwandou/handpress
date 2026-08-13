import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Konva ships a Node build that reaches for the native `canvas` package. The
  // browser never needs it, so point the specifier at an empty module instead
  // of letting the bundler fail on a dependency that is not installed.
  turbopack: {
    resolveAlias: {
      canvas: { browser: "./src/lib/empty-module.ts" },
    },
  },

  serverExternalPackages: ["konva", "onnxruntime-web"],

  // The segmentation model is a large WASM payload. Letting it sit in the HTTP
  // cache for a year is what makes the second cutout instant and the offline
  // case work at all.
  async headers() {
    return [
      {
        source: "/:path*.wasm",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
