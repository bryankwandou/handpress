import type { Metadata } from "next";
import { EditorShell } from "@/components/editor/EditorShell";

export const metadata: Metadata = {
  title: "Editor",
  description: "Lay out a flyer, poster, or social post. Every control is open, nothing is watermarked.",
};

export default function EditorPage() {
  return <EditorShell />;
}
