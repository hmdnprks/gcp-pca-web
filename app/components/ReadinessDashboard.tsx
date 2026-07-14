"use client";

import { useEffect, useMemo } from "react";
import { Gauge, X } from "lucide-react";
import type { Confidence } from "../lib/curriculum";
import { SERVICE_INDEX } from "../lib/curriculum";
import { computeReadiness, type DomainReadiness } from "../lib/domains";
import { CONFIDENCE_STYLES } from "../lib/confidence";
import { iconFor } from "../lib/icons";

interface ReadinessDashboardProps {
  confidence: Record<string, Confidence>;
  onReview: (serviceId: string) => void;
  onClose: () => void;
}

function tone(pct: number): string {
  if (pct >= 70) return "text-emerald-400";
  if (pct >= 40) return "text-amber-400";
  return "text-red-400";
}
function barTone(pct: number): string {
  if (pct >= 70) return "bg-emerald-500";
  if (pct >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export function ReadinessDashboard({
  confidence,
  onReview,
  onClose,
}: ReadinessDashboardProps) {
  const report = useMemo(() => computeReadiness(confidence), [confidence]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const overall = Math.round(report.overall);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950/95 backdrop-blur">
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-sky-600 p-2">
            <Gauge className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold text-zinc-50">Exam Readiness</h1>
            <p className="text-[11px] text-zinc-500">
              Weighted by the 6 official exam domains
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close readiness dashboard"
          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 p-5 sm:p-6">
          {/* Overall */}
          <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Estimated exam-weighted readiness
            </p>
            <p className={`text-5xl font-bold ${tone(overall)}`}>{overall}%</p>
            <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full ${barTone(overall)} transition-all`}
                style={{ width: `${overall}%` }}
              />
            </div>
            <p className="max-w-md text-xs text-zinc-500">
              A rough estimate: each domain&apos;s readiness (Mastered = full,
              Reviewing = half credit) weighted by its share of the exam. Focus
              your weakest high-weight domains first.
            </p>
          </div>

          {/* Per-domain */}
          <div className="space-y-3">
            {report.perDomain.map((d) => (
              <DomainCard key={d.domain.id} d={d} onReview={onReview} confidence={confidence} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DomainCard({
  d,
  confidence,
  onReview,
}: {
  d: DomainReadiness;
  confidence: Record<string, Confidence>;
  onReview: (serviceId: string) => void;
}) {
  const pct = Math.round(d.readiness);
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-zinc-400">
              §{d.domain.section}
            </span>
            <h2 className="text-sm font-semibold text-zinc-100">
              {d.domain.name}
            </h2>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {d.domain.blurb}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
            {d.domain.weight}% of exam
          </span>
          <p className={`mt-1 text-lg font-bold ${tone(pct)}`}>{pct}%</p>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full ${barTone(pct)} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-zinc-500">
        <Count color="bg-emerald-500" n={d.counts.mastered} label="Mastered" />
        <Count color="bg-amber-500" n={d.counts.reviewing} label="Reviewing" />
        <Count color="bg-red-500" n={d.counts.weak} label="Weak" />
        <Count color="bg-zinc-600" n={d.counts.untracked} label="Untracked" />
      </div>

      {/* Service pills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {d.serviceIds.map((id) => {
          const svc = SERVICE_INDEX[id];
          if (!svc) return null;
          const Icon = iconFor(svc.icon);
          const c = confidence[id];
          const dot = c ? CONFIDENCE_STYLES[c].dot : "bg-zinc-600";
          return (
            <button
              key={id}
              onClick={() => onReview(id)}
              title={`${svc.name}${c ? ` · ${CONFIDENCE_STYLES[c].label}` : " · Untracked"}`}
              className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              <span className={`h-2 w-2 rounded-full ${dot}`} />
              <Icon className="h-3 w-3 text-zinc-500" />
              {svc.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Count({ color, n, label }: { color: string; n: number; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="font-semibold text-zinc-300">{n}</span>
      {label}
    </span>
  );
}
