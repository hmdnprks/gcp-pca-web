"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  GitBranch,
  Layers,
  Lightbulb,
  ListChecks,
  Search,
  Shuffle,
  Target,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  ARCHITECTURES,
  ARCH_CATEGORIES,
  type ArchNode,
  type ArchPattern,
} from "../lib/architectures";
import { SERVICE_INDEX } from "../lib/curriculum";
import { CASE_STUDIES } from "../lib/caseStudies";
import { iconFor } from "../lib/icons";

// Tailwind can't see dynamically-built class names, so map accents explicitly.
const ACCENT: Record<
  string,
  { text: string; dot: string; chip: string; ring: string }
> = {
  cyan: {
    text: "text-cyan-400",
    dot: "bg-cyan-500",
    chip: "hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-100",
    ring: "border-cyan-500/30 bg-cyan-500/[0.04]",
  },
  emerald: {
    text: "text-emerald-400",
    dot: "bg-emerald-500",
    chip: "hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-100",
    ring: "border-emerald-500/30 bg-emerald-500/[0.04]",
  },
  sky: {
    text: "text-sky-400",
    dot: "bg-sky-500",
    chip: "hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-100",
    ring: "border-sky-500/30 bg-sky-500/[0.04]",
  },
  amber: {
    text: "text-amber-400",
    dot: "bg-amber-500",
    chip: "hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-100",
    ring: "border-amber-500/30 bg-amber-500/[0.04]",
  },
  fuchsia: {
    text: "text-fuchsia-400",
    dot: "bg-fuchsia-500",
    chip: "hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 hover:text-fuchsia-100",
    ring: "border-fuchsia-500/30 bg-fuchsia-500/[0.04]",
  },
  rose: {
    text: "text-rose-400",
    dot: "bg-rose-500",
    chip: "hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-100",
    ring: "border-rose-500/30 bg-rose-500/[0.04]",
  },
};

const fallback = ACCENT.cyan;
const accentOf = (category: string) =>
  ACCENT[ARCH_CATEGORIES[category as keyof typeof ARCH_CATEGORIES]?.accent] ??
  fallback;

interface ArchitecturePatternsProps {
  /** Jump to a service's deep-dive node in the map. */
  onReview: (serviceId: string) => void;
  /** Pattern to open on first render (defaults to the first). */
  initialId?: string;
  onClose: () => void;
}

export function ArchitecturePatterns({
  onReview,
  initialId,
  onClose,
}: ArchitecturePatternsProps) {
  const [activeId, setActiveId] = useState(
    initialId && ARCHITECTURES.some((a) => a.id === initialId)
      ? initialId
      : ARCHITECTURES[0].id,
  );
  const [query, setQuery] = useState("");

  const pattern: ArchPattern =
    ARCHITECTURES.find((a) => a.id === activeId) ?? ARCHITECTURES[0];
  const accent = accentOf(pattern.category);
  const PatternIcon = iconFor(pattern.icon);

  const q = query.trim().toLowerCase();
  const matches = (a: ArchPattern) =>
    !q ||
    a.name.toLowerCase().includes(q) ||
    a.tagline.toLowerCase().includes(q) ||
    a.problem.toLowerCase().includes(q) ||
    a.useCases.some((u) => u.toLowerCase().includes(q)) ||
    a.examTriggers.some((t) => t.toLowerCase().includes(q)) ||
    a.stages.some((s) =>
      s.nodes.some((n) => nodeLabel(n).toLowerCase().includes(q)),
    );
  const visible = ARCHITECTURES.filter(matches);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950/95 backdrop-blur">
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-600 p-2">
            <GitBranch className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold text-zinc-50">
              Architecture Patterns
            </h1>
            <p className="text-[11px] text-zinc-500">
              End-to-end reference architectures · the use cases that demand
              them
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close architecture patterns"
          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Pattern list */}
        <nav className="flex shrink-0 flex-col border-b border-zinc-800 md:w-72 md:border-b-0 md:border-r">
          <div className="border-b border-zinc-800 p-3">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search patterns & triggers…"
                className="w-full bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto p-3 md:flex-col md:overflow-y-auto">
            {visible.length === 0 && (
              <p className="px-1 py-2 text-xs text-zinc-500">No matches.</p>
            )}
            {visible.map((a) => {
              const acc = accentOf(a.category);
              const Icon = iconFor(a.icon);
              const active = a.id === activeId;
              return (
                <button
                  key={a.id}
                  onClick={() => setActiveId(a.id)}
                  className={`flex shrink-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors md:w-full ${
                    active
                      ? "border-zinc-600 bg-zinc-800/70"
                      : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${acc.text}`} />
                  <span className="min-w-0">
                    <span className="block whitespace-nowrap text-sm font-semibold text-zinc-100 md:whitespace-normal">
                      {a.name}
                    </span>
                    <span className="hidden text-[11px] text-zinc-500 md:block">
                      {ARCH_CATEGORIES[a.category].label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Detail */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-zinc-800/80 p-2.5">
                <PatternIcon className={`h-6 w-6 ${accent.text}`} />
              </div>
              <div>
                <p
                  className={`text-[11px] font-medium uppercase tracking-wider ${accent.text}`}
                >
                  {ARCH_CATEGORIES[pattern.category].label}
                </p>
                <h2 className="text-xl font-bold text-zinc-50">
                  {pattern.name}
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {pattern.tagline}
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-zinc-300">
              {pattern.problem}
            </p>

            {/* The flow */}
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <Layers className="h-4 w-4 text-zinc-500" />
                The architecture (click any service to open its node)
              </h3>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
                {pattern.stages.map((stage, si) => (
                  <div
                    key={si}
                    className="flex items-stretch gap-2 lg:flex-1"
                  >
                    <div
                      className={`flex-1 rounded-xl border p-3 ${accent.ring}`}
                    >
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${accent.text}`}
                        >
                          {si + 1}. {stage.label}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-snug text-zinc-400">
                        {stage.role}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {stage.nodes.map((n, ni) => (
                          <NodeChip
                            key={ni}
                            node={n}
                            accentChip={accent.chip}
                            onReview={onReview}
                          />
                        ))}
                      </div>
                    </div>
                    {si < pattern.stages.length - 1 && (
                      <div className="flex shrink-0 items-center justify-center text-zinc-600">
                        <ArrowRight className="h-4 w-4 rotate-90 lg:rotate-0" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Use cases */}
            <ListSection
              icon={Target}
              title="Use cases that demand this"
              accent="text-amber-400"
              dot="bg-amber-500/60"
              items={pattern.useCases}
            />

            {/* Exam triggers */}
            <section
              className={`space-y-2 rounded-xl border p-4 ${accent.ring}`}
            >
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                <Lightbulb className={`h-4 w-4 ${accent.text}`} />
                Exam trigger phrases
              </h3>
              <ul className="space-y-1.5">
                {pattern.examTriggers.map((t, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-xs leading-relaxed text-zinc-300"
                  >
                    <span
                      className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${accent.dot}`}
                    />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Variants */}
            {pattern.variants && pattern.variants.length > 0 && (
              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <Shuffle className="h-4 w-4 text-sky-400" />
                  Variants — swap to fit the scenario
                </h3>
                <ul className="space-y-1.5">
                  {pattern.variants.map((v, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs leading-relaxed"
                    >
                      <span className="text-zinc-400">If </span>
                      <span className="text-zinc-200">{v.when}</span>
                      <span className="text-zinc-600"> — </span>
                      <span className="font-medium text-sky-300">{v.swap}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Pitfalls */}
            <ListSection
              icon={AlertTriangle}
              title="Pitfalls & wrong turns"
              accent="text-rose-400"
              dot="bg-rose-500/60"
              items={pattern.pitfalls}
            />

            {/* Related case studies */}
            {pattern.caseStudies && pattern.caseStudies.length > 0 && (
              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <ListChecks className="h-4 w-4 text-zinc-500" />
                  Seen in these case studies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {pattern.caseStudies.map((csId) => {
                    const cs = CASE_STUDIES.find((c) => c.id === csId);
                    if (!cs) return null;
                    return (
                      <span
                        key={csId}
                        className="rounded-full border border-zinc-700 bg-zinc-900/60 px-2.5 py-1 text-[11px] font-medium text-zinc-300"
                      >
                        {cs.name}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function nodeLabel(node: ArchNode): string {
  if (node.label) return node.label;
  if (node.id && SERVICE_INDEX[node.id]) return SERVICE_INDEX[node.id].name;
  return node.id ?? "";
}

function NodeChip({
  node,
  accentChip,
  onReview,
}: {
  node: ArchNode;
  accentChip: string;
  onReview: (serviceId: string) => void;
}) {
  const svc = node.id ? SERVICE_INDEX[node.id] : undefined;
  const label = nodeLabel(node);

  // Not a real service node (e.g. Eventarc) → static reference chip.
  if (!svc) {
    return (
      <span className="flex items-center gap-1.5 rounded-md border border-dashed border-zinc-700 bg-zinc-900/40 px-2 py-1 text-[11px] text-zinc-400">
        <Boxes className="h-3 w-3 shrink-0 text-zinc-600" />
        {label}
      </span>
    );
  }

  const Icon = iconFor(svc.icon);
  return (
    <button
      onClick={() => onReview(svc.id)}
      title={`Open ${svc.name}`}
      className={`flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900/70 px-2 py-1 text-[11px] font-medium text-zinc-200 transition-colors ${accentChip}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </button>
  );
}

function ListSection({
  icon: Icon,
  title,
  accent,
  dot,
  items,
}: {
  icon: LucideIcon;
  title: string;
  accent: string;
  dot: string;
  items: string[];
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        <Icon className={`h-4 w-4 ${accent}`} />
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-2 text-xs leading-relaxed text-zinc-300"
          >
            <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${dot}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
