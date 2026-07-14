"use client";

import type { Confidence } from "../lib/curriculum";
import { CONFIDENCE_ORDER, CONFIDENCE_STYLES } from "../lib/confidence";

interface ConfidencePickerProps {
  value: Confidence | undefined;
  onChange: (level: Confidence | undefined) => void;
  size?: "sm" | "lg";
  /** Stop the click from bubbling to a parent node handler. */
  stopPropagation?: boolean;
}

/**
 * Three-swatch confidence selector (Weak / Reviewing / Mastered).
 * Clicking the currently-active swatch clears the confidence back to unset.
 */
export function ConfidencePicker({
  value,
  onChange,
  size = "sm",
  stopPropagation,
}: ConfidencePickerProps) {
  const dim = size === "lg" ? "h-4 w-4" : "h-3 w-3";
  const gap = size === "lg" ? "gap-2" : "gap-1";

  return (
    <div className={`flex items-center ${gap}`}>
      {CONFIDENCE_ORDER.map((level) => {
        const active = value === level;
        const style = CONFIDENCE_STYLES[level];
        return (
          <button
            key={level}
            type="button"
            title={style.label}
            aria-label={`Set confidence: ${style.label}`}
            aria-pressed={active}
            onClick={(e) => {
              if (stopPropagation) e.stopPropagation();
              onChange(active ? undefined : level);
            }}
            className={`${dim} rounded-full border transition-all ${
              active
                ? `${style.dot} border-transparent ring-2 ring-white/70 ring-offset-1 ring-offset-zinc-900`
                : `${style.dot} border-black/20 opacity-30 hover:opacity-80`
            }`}
          />
        );
      })}
    </div>
  );
}
