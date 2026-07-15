"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Car,
  Clapperboard,
  Filter,
  GraduationCap,
  HeartPulse,
  Layers,
  Lightbulb,
  ListChecks,
  ShoppingBag,
  Target,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CASE_STUDIES, type CaseStudy } from "../lib/caseStudies";
import { SERVICE_INDEX } from "../lib/curriculum";
import { iconFor } from "../lib/icons";
import { QUIZ } from "../lib/quiz";

const CS_ICON: Record<string, LucideIcon> = {
  altostrat: Clapperboard,
  cymbal: ShoppingBag,
  ehr: HeartPulse,
  knightmotives: Car,
};

const ACCENT_TEXT: Record<string, string> = {
  violet: "text-violet-400",
  emerald: "text-emerald-400",
  rose: "text-rose-400",
  sky: "text-sky-400",
};

interface CaseStudyExplorerProps {
  onReview: (serviceId: string) => void;
  onFilter: (caseStudyName: string) => void;
  /** Open the quiz scoped to this case study's official questions. */
  onPractice: (caseStudyId: string) => void;
  onClose: () => void;
}

export function CaseStudyExplorer({
  onReview,
  onFilter,
  onPractice,
  onClose,
}: CaseStudyExplorerProps) {
  const [activeId, setActiveId] = useState(CASE_STUDIES[0].id);
  const cs: CaseStudy =
    CASE_STUDIES.find((c) => c.id === activeId) ?? CASE_STUDIES[0];
  const CsIcon = CS_ICON[cs.id] ?? Building2;
  const accent = ACCENT_TEXT[cs.accent] ?? "text-zinc-300";
  const questionCount = QUIZ.filter((q) => q.caseStudy === cs.id).length;

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
          <div className="rounded-lg bg-gradient-to-br from-violet-500 to-sky-600 p-2">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold text-zinc-50">Case Study Explorer</h1>
            <p className="text-[11px] text-zinc-500">
              Official PCA case studies · v6.1 (Oct 2025)
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close explorer"
          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Case study list */}
        <nav className="flex shrink-0 gap-2 overflow-x-auto border-b border-zinc-800 p-3 md:w-64 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
          {CASE_STUDIES.map((c) => {
            const Icon = CS_ICON[c.id] ?? Building2;
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`flex shrink-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors md:w-full ${
                  active
                    ? "border-zinc-600 bg-zinc-800/70"
                    : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/50"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    ACCENT_TEXT[c.accent] ?? "text-zinc-400"
                  }`}
                />
                <span className="min-w-0">
                  <span className="block whitespace-nowrap text-sm font-semibold text-zinc-100 md:whitespace-normal">
                    {c.name}
                  </span>
                  <span className="hidden text-xs text-zinc-500 md:block">
                    {c.industry}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Detail */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-zinc-800/80 p-2.5">
                <CsIcon className={`h-6 w-6 ${accent}`} />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  {cs.industry}
                </p>
                <h2 className="text-xl font-bold text-zinc-50">{cs.name}</h2>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-zinc-300">{cs.summary}</p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onFilter(cs.name)}
                className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 hover:text-fuchsia-200"
              >
                <Filter className="h-4 w-4" />
                Filter the map to this case study
              </button>
              {questionCount > 0 && (
                <button
                  onClick={() => onPractice(cs.id)}
                  className="flex items-center gap-2 rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-2 text-xs font-semibold text-fuchsia-200 transition-colors hover:border-fuchsia-500/70 hover:bg-fuchsia-500/20"
                >
                  <GraduationCap className="h-4 w-4" />
                  Practice {questionCount} official question
                  {questionCount === 1 ? "" : "s"}
                </button>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <ReqList
                icon={Target}
                title="Business requirements"
                accent="text-amber-400"
                items={cs.businessReqs}
              />
              <ReqList
                icon={ListChecks}
                title="Technical requirements"
                accent="text-sky-400"
                items={cs.technicalReqs}
              />
            </div>

            {/* Proposed technical solution (official) */}
            {cs.proposedSolution && cs.proposedSolution.length > 0 && (
              <section className="space-y-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.03] p-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300/90">
                  <Lightbulb className="h-4 w-4" />
                  Proposed technical solution
                  <span className="rounded-full border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-medium normal-case tracking-normal text-amber-300/70">
                    official
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Google&apos;s reference answer from the official PCA training
                  decks.
                </p>
                <div className="space-y-3">
                  {cs.proposedSolution.map((group, gi) => (
                    <div key={gi} className="space-y-1.5">
                      {group.heading && (
                        <h4 className="text-xs font-semibold text-zinc-200">
                          {group.heading}
                        </h4>
                      )}
                      <ul className="space-y-1.5">
                        {group.points.map((point, pi) => (
                          <li
                            key={pi}
                            className="flex gap-2 text-xs leading-relaxed text-zinc-300"
                          >
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500/60" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Featured services */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Featured services & decisions ({cs.featured.length})
              </h3>
              <ul className="space-y-2">
                {cs.featured.map((f) => {
                  const svc = SERVICE_INDEX[f.serviceId];
                  if (!svc) return null;
                  const Icon = iconFor(svc.icon);
                  return (
                    <li key={f.serviceId}>
                      <button
                        onClick={() => onReview(f.serviceId)}
                        className="flex w-full items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5 text-left transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/5"
                      >
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300" />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-100">
                              {svc.name}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide text-zinc-600">
                              {svc.pillarName}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-zinc-400">
                            {f.why}
                          </span>
                        </span>
                        <span className="shrink-0 self-center text-xs font-medium text-cyan-400">
                          →
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReqList({
  icon: Icon,
  title,
  accent,
  items,
}: {
  icon: LucideIcon;
  title: string;
  accent: string;
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
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
