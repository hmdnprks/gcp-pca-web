"use client";

import { useEffect } from "react";
import {
  Compass,
  HelpCircle,
  Info,
  Link2,
  ListChecks,
  ScrollText,
  ShieldCheck,
  Table2,
  Tag,
  TriangleAlert,
  Wrench,
  X,
} from "lucide-react";
import type { Confidence, DecisionMatrix, FlatService } from "../lib/curriculum";
import { SERVICE_INDEX } from "../lib/curriculum";
import { iconFor } from "../lib/icons";
import { ConfidencePicker } from "./ConfidencePicker";

interface DetailPanelProps {
  service: FlatService | null;
  confidence: Confidence | undefined;
  onSetConfidence: (level: Confidence | undefined) => void;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

function Section({
  icon: Icon,
  title,
  accent,
  items,
}: {
  icon: typeof Info;
  title: string;
  accent: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        <Icon className={`h-4 w-4 ${accent}`} />
        {title}
      </h3>
      <ul className="space-y-2 pl-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-300">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CaseStudyTags({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        <Tag className="h-4 w-4 text-violet-400" />
        Case Study Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((c) => (
          <span
            key={c}
            className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300"
          >
            {c}
          </span>
        ))}
      </div>
    </section>
  );
}

function MatrixView({ matrix }: { matrix: DecisionMatrix }) {
  return (
    <div className="space-y-6">
      {/* The decision */}
      <div className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 p-3">
        <div className="flex items-start gap-2">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-300" />
          <p className="text-sm font-medium text-fuchsia-100">
            {matrix.question}
          </p>
        </div>
      </div>

      {/* Comparison table */}
      <section className="space-y-2">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <Table2 className="h-4 w-4 text-fuchsia-400" />
          Comparison
        </h3>
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-zinc-900">
                <th className="sticky left-0 z-10 bg-zinc-900 px-3 py-2 font-semibold text-zinc-300">
                  Option
                </th>
                {matrix.columns.map((c) => (
                  <th
                    key={c.key}
                    className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-400"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((r) => (
                <tr key={r.option} className="border-t border-zinc-800 align-top">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 whitespace-nowrap bg-zinc-950 px-3 py-2 text-left font-semibold text-fuchsia-300"
                  >
                    {r.option}
                  </th>
                  {matrix.columns.map((c) => (
                    <td key={c.key} className="px-3 py-2 text-zinc-300">
                      {r.cells[c.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* When to choose */}
      <section className="space-y-2">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <ListChecks className="h-4 w-4 text-emerald-400" />
          When to choose
        </h3>
        <ul className="space-y-2">
          {matrix.rows.map((r) => (
            <li
              key={r.option}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
            >
              <p className="text-sm font-semibold text-fuchsia-300">{r.option}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                {r.pickWhen}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Section
        icon={TriangleAlert}
        title="Traps & Gotchas"
        accent="text-red-400"
        items={matrix.traps}
      />

      {/* Trigger keywords */}
      {matrix.keywords.length > 0 && (
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <ScrollText className="h-4 w-4 text-fuchsia-400" />
            Trigger Keywords → Answer
          </h3>
          <ul className="space-y-1.5">
            {matrix.keywords.map((k, i) => (
              <li
                key={i}
                className="rounded-md border border-fuchsia-500/30 bg-fuchsia-500/10 px-2.5 py-1.5 text-xs font-medium text-fuchsia-200"
              >
                {k}
              </li>
            ))}
          </ul>
        </section>
      )}

      <CaseStudyTags items={matrix.caseStudies} />
    </div>
  );
}

export function DetailPanel({
  service,
  confidence,
  onSetConfidence,
  onClose,
  onNavigate,
}: DetailPanelProps) {
  // Close on Escape.
  useEffect(() => {
    if (!service) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [service, onClose]);

  const open = service !== null;
  const isMatrix = !!service?.matrix;
  const Icon = service ? iconFor(service.icon) : Info;
  const pairings = (service?.pairings ?? [])
    .map((id) => SERVICE_INDEX[id])
    .filter(Boolean);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Slide-out panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={service ? `${service.name} details` : "Service details"}
        className={`fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl transition-transform duration-300 ease-out ${
          isMatrix ? "max-w-3xl sm:w-[46rem]" : "max-w-md sm:w-[30rem]"
        } ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {service && (
          <>
            <header className="flex items-start gap-3 border-b border-zinc-800 p-5">
              <div className="rounded-lg bg-zinc-800/80 p-2.5">
                <Icon className="h-6 w-6 text-zinc-100" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  {service.pillarName}
                </p>
                <h2 className="truncate text-lg font-semibold text-zinc-50">
                  {service.name}
                </h2>
                <p className="mt-0.5 text-sm text-zinc-400">{service.tagline}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close panel"
                className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Confidence control */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Confidence
              </span>
              <ConfidencePicker
                value={confidence}
                onChange={onSetConfidence}
                size="lg"
              />
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {service.matrix ? (
                <MatrixView matrix={service.matrix} />
              ) : service.detail ? (
                <>
                  <Section
                    icon={Compass}
                    title="Design & Architecture"
                    accent="text-sky-400"
                    items={service.detail.design}
                  />
                  <Section
                    icon={ShieldCheck}
                    title="Security & Compliance"
                    accent="text-rose-400"
                    items={service.detail.security}
                  />
                  <Section
                    icon={Wrench}
                    title="Operations & Reliability"
                    accent="text-amber-400"
                    items={service.detail.operations}
                  />

                  {/* Keywords */}
                  {service.detail.keywords.length > 0 && (
                    <section className="space-y-2">
                      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        <ScrollText className="h-4 w-4 text-emerald-400" />
                        Exam Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {service.detail.keywords.map((k, i) => (
                          <span
                            key={i}
                            className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Anti-patterns */}
                  <Section
                    icon={TriangleAlert}
                    title="Anti-patterns (Wrong Choice)"
                    accent="text-red-400"
                    items={service.detail.antipatterns}
                  />

                  <CaseStudyTags items={service.detail.caseStudies} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-700 p-8 text-center">
                  <Info className="h-8 w-8 text-zinc-600" />
                  <p className="text-sm font-medium text-zinc-300">
                    Deep-dive content not yet populated
                  </p>
                  <p className="text-xs text-zinc-500">
                    This is a structural placeholder node. Add its exam criteria in{" "}
                    <code className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-300">
                      app/lib/curriculum.ts
                    </code>
                    .
                  </p>
                </div>
              )}

              {/* Paired services */}
              {pairings.length > 0 && (
                <section className="space-y-2 border-t border-zinc-800 pt-5">
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <Link2 className="h-4 w-4 text-cyan-400" />
                    Frequently Paired With
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pairings.map((p) => {
                      const PIcon = iconFor(p.icon);
                      return (
                        <button
                          key={p.id}
                          onClick={() => onNavigate(p.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-200"
                        >
                          <PIcon className="h-3.5 w-3.5" />
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
