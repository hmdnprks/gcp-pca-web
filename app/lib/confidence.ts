import type { Confidence } from "./curriculum";

export const CONFIDENCE_ORDER: Confidence[] = ["weak", "reviewing", "mastered"];

interface ConfidenceStyle {
  label: string;
  /** Solid swatch color (dot / picker). */
  dot: string;
  /** Node ring + background tint when this level is set. */
  node: string;
  /** Text color for labels. */
  text: string;
}

export const CONFIDENCE_STYLES: Record<Confidence, ConfidenceStyle> = {
  weak: {
    label: "Weak",
    dot: "bg-red-500",
    node: "border-red-500/60 bg-red-500/10 hover:bg-red-500/15",
    text: "text-red-400",
  },
  reviewing: {
    label: "Reviewing",
    dot: "bg-amber-500",
    node: "border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/15",
    text: "text-amber-400",
  },
  mastered: {
    label: "Mastered",
    dot: "bg-emerald-500",
    node: "border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/15",
    text: "text-emerald-400",
  },
};

export const UNSET_NODE =
  "border-zinc-700/70 bg-zinc-800/40 hover:bg-zinc-800/70";
