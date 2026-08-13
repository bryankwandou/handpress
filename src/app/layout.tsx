import type { Metadata, Viewport } from "next";
import {
  Anton, Archivo_Black, Bebas_Neue, Bricolage_Grotesque, Caveat,
  DM_Serif_Display, Inter, JetBrains_Mono, Lora, Outfit, Pacifico,
  Playfair_Display, Poppins, Righteous, Space_Grotesk, Syne,
} from "next/font/google";
import "./globals.css";

/* The type library ships with the app, so the editor keeps working offline. */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const archivo = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo", display: "swap" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });
const dmserif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dmserif", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800", "900"], variable: "--font-poppins", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-pacifico", display: "swap" });
const righteous = Righteous({ subsets: ["latin"], weight: "400", variable: "--font-righteous", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-spacegrotesk", display: "swap" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });

const FONT_VARS = [
  inter, bricolage, jetbrains, playfair, archivo, anton, bebas, dmserif,
  lora, poppins, outfit, caveat, pacifico, righteous, spaceGrotesk, syne,
]
  .map((f) => f.variable)
  .join(" ");

const SITE = "https://handpress.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Handpress — a design studio that runs in your browser",
    template: "%s · Handpress",
  },
  description:
    "Lay out flyers, posters, and social graphics with real text effects, motion, and background cutouts. Nothing is watermarked, nothing is gated, and the files never leave your machine.",
  keywords: [
    "flyer maker", "poster editor", "browser design tool", "offline design editor",
    "background remover", "text effects", "animated social posts", "free design software",
  ],
  authors: [{ name: "Bryan Kwandou" }],
  openGraph: {
    title: "Handpress — own the press",
    description:
      "A full design editor that runs in the browser. No watermark, no export limit, no account.",
    url: SITE,
    siteName: "Handpress",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Handpress — own the press",
    description: "A full design editor that runs in the browser. No watermark, no export limit, no account.",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0a08" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={FONT_VARS}>{children}</body>
    </html>
  );
}
