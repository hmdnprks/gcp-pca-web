"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  GraduationCap,
  Layers,
  Link2,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { Confidence, Service } from "../lib/curriculum";
import { CURRICULUM, SERVICE_INDEX } from "../lib/curriculum";
import { CONFIDENCE_STYLES, UNSET_NODE } from "../lib/confidence";
import { caseStudiesFor } from "../lib/caseStudies";
import { iconFor } from "../lib/icons";
import { ConfidencePicker } from "./ConfidencePicker";
import { DetailPanel } from "./DetailPanel";
import { QuizMode } from "./QuizMode";
import { CaseStudyExplorer } from "./CaseStudyExplorer";

type ConfidenceMap = Record<string, Confidence>;
type FilterValue = "all" | Confidence | "unset";

const LS_CONFIDENCE = "gcp-pca-confidence-v1";
const LS_COLLAPSED = "gcp-pca-collapsed-v1";

// Accent -> Tailwind classes (static so Tailwind can see them at build time).
const ACCENT: Record<string, { text: string; bar: string; chip: string }> = {
  sky: { text: "text-sky-400", bar: "bg-sky-500", chip: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
  emerald: { text: "text-emerald-400", bar: "bg-emerald-500", chip: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  violet: { text: "text-violet-400", bar: "bg-violet-500", chip: "bg-violet-500/10 text-violet-300 border-violet-500/30" },
  rose: { text: "text-rose-400", bar: "bg-rose-500", chip: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
  amber: { text: "text-amber-400", bar: "bg-amber-500", chip: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  cyan: { text: "text-cyan-400", bar: "bg-cyan-500", chip: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30" },
  fuchsia: { text: "text-fuchsia-400", bar: "bg-fuchsia-500", chip: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30" },
};

// Bidirectional pairing adjacency for hover highlighting.
const ADJACENCY: Record<string, Set<string>> = (() => {
  const adj: Record<string, Set<string>> = {};
  const add = (a: string, b: string) => {
    (adj[a] ??= new Set()).add(b);
    (adj[b] ??= new Set()).add(a);
  };
  for (const svc of Object.values(SERVICE_INDEX)) {
    for (const p of svc.pairings ?? []) {
      if (SERVICE_INDEX[p]) add(svc.id, p);
    }
  }
  return adj;
})();

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "weak", label: "Weak" },
  { value: "reviewing", label: "Reviewing" },
  { value: "mastered", label: "Mastered" },
  { value: "unset", label: "Untracked" },
];

// ── Service node ────────────────────────────────────────────────────────────
function ServiceNode({
  service,
  confidence,
  onSelect,
  onSetConfidence,
  highlight,
  hoveredId,
  onHover,
}: {
  service: Service;
  confidence: Confidence | undefined;
  onSelect: () => void;
  onSetConfidence: (level: Confidence | undefined) => void;
  highlight: "self" | "related" | "dimmed" | "none";
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const Icon = iconFor(service.icon);
  const confStyle = confidence ? CONFIDENCE_STYLES[confidence] : null;
  const pairCount = (service.pairings ?? []).length;

  const ring =
    highlight === "self"
      ? "ring-2 ring-cyan-300 ring-offset-1 ring-offset-zinc-950"
      : highlight === "related"
        ? "ring-2 ring-cyan-400/70"
        : "";
  const opacity = highlight === "dimmed" ? "opacity-40" : "opacity-100";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      onMouseEnter={() => onHover(service.id)}
      onMouseLeave={() => onHover(null)}
      className={`group cursor-pointer rounded-lg border p-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        confStyle ? confStyle.node : UNSET_NODE
      } ${ring} ${opacity}`}
    >
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-zinc-300" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate text-sm font-semibold text-zinc-100">
              {service.name}
            </h4>
            {service.matrix ? (
              <span
                title="Decision guide — comparison matrix"
                className="shrink-0 rounded border border-fuchsia-500/40 bg-fuchsia-500/10 px-1 text-[9px] font-medium uppercase tracking-wide text-fuchsia-300"
              >
                guide
              </span>
            ) : (
              !service.detail && (
                <span
                  title="Structural placeholder — no deep-dive yet"
                  className="shrink-0 rounded border border-zinc-700 px-1 text-[9px] font-medium uppercase tracking-wide text-zinc-500"
                >
                  stub
                </span>
              )
            )}
          </div>
          <p className="truncate text-xs text-zinc-400">{service.tagline}</p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <ConfidencePicker
          value={confidence}
          onChange={onSetConfidence}
          stopPropagation
        />
        {pairCount > 0 && (
          <span
            className={`flex items-center gap-1 text-[10px] ${
              hoveredId === service.id ? "text-cyan-300" : "text-zinc-500"
            }`}
          >
            <Link2 className="h-3 w-3" />
            {pairCount}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export function MindMap() {
  const [confidence, setConfidence] = useState<ConfidenceMap>({});
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [caseStudyFilter, setCaseStudyFilter] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load persisted state after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    try {
      const c = localStorage.getItem(LS_CONFIDENCE);
      if (c) setConfidence(JSON.parse(c));
      const col = localStorage.getItem(LS_COLLAPSED);
      if (col) setCollapsed(new Set(JSON.parse(col)));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist.
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_CONFIDENCE, JSON.stringify(confidence));
  }, [confidence, hydrated]);
  useEffect(() => {
    if (hydrated)
      localStorage.setItem(LS_COLLAPSED, JSON.stringify([...collapsed]));
  }, [collapsed, hydrated]);

  // "/" focuses search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const setServiceConfidence = useCallback(
    (id: string, level: Confidence | undefined) => {
      setConfidence((prev) => {
        const next = { ...prev };
        if (level) next[id] = level;
        else delete next[id];
        return next;
      });
    },
    [],
  );

  const togglePillar = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const matches = useCallback(
    (svc: Service) => {
      // Case study filter
      if (caseStudyFilter && !caseStudiesFor(svc.id).includes(caseStudyFilter))
        return false;
      // Confidence filter
      const conf = confidence[svc.id];
      if (filter === "unset" && conf) return false;
      if (filter !== "all" && filter !== "unset" && conf !== filter) return false;
      // Search
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const hay = [
        svc.name,
        svc.tagline,
        ...(svc.detail?.keywords ?? []),
        ...caseStudiesFor(svc.id),
        svc.matrix?.question ?? "",
        ...(svc.matrix?.rows.map((r) => r.option) ?? []),
        ...(svc.matrix?.keywords ?? []),
        ...(svc.matrix?.traps ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    },
    [confidence, filter, query, caseStudyFilter],
  );

  const relatedIds = hoveredId ? ADJACENCY[hoveredId] : undefined;

  const stats = useMemo(() => {
    const total = Object.keys(SERVICE_INDEX).length;
    const counts = { weak: 0, reviewing: 0, mastered: 0 };
    for (const level of Object.values(confidence)) counts[level]++;
    const tracked = counts.weak + counts.reviewing + counts.mastered;
    return { total, tracked, ...counts };
  }, [confidence]);

  const selected = selectedId ? SERVICE_INDEX[selectedId] : null;
  const allCollapsed = collapsed.size === CURRICULUM.length;

  const resetProgress = () => {
    if (confidence && Object.keys(confidence).length === 0) return;
    if (window.confirm("Reset all confidence levels? This cannot be undone."))
      setConfidence({});
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* ── Top navigation ─────────────────────────────────────────────── */}
      <header className="z-30 shrink-0 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 p-2">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-bold tracking-tight text-zinc-50">
                GCP PCA Mind Map
              </h1>
              <p className="text-[11px] text-zinc-500">
                Professional Cloud Architect · active recall
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative order-last w-full sm:order-none sm:ml-2 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services, keywords…  ( / )"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-8 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-cyan-500/60"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-500 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-1">
            {FILTERS.map((f) => {
              const active = filter === f.value;
              const dot =
                f.value === "weak"
                  ? "bg-red-500"
                  : f.value === "reviewing"
                    ? "bg-amber-500"
                    : f.value === "mastered"
                      ? "bg-emerald-500"
                      : f.value === "unset"
                        ? "bg-zinc-600"
                        : "";
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-200"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Progress + actions */}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-3 text-xs md:flex">
              <ProgressStat color="bg-red-500" value={stats.weak} label="Weak" />
              <ProgressStat color="bg-amber-500" value={stats.reviewing} label="Review" />
              <ProgressStat color="bg-emerald-500" value={stats.mastered} label="Mastered" />
              <span className="text-zinc-600">
                {stats.tracked}/{stats.total}
              </span>
            </div>
            <button
              onClick={() => setExplorerOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-violet-500/50 bg-violet-500/15 px-2.5 py-1.5 text-xs font-semibold text-violet-200 transition-colors hover:bg-violet-500/25"
            >
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Case Studies</span>
            </button>
            <button
              onClick={() => setQuizOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-fuchsia-500/50 bg-fuchsia-500/15 px-2.5 py-1.5 text-xs font-semibold text-fuchsia-200 transition-colors hover:bg-fuchsia-500/25"
            >
              <GraduationCap className="h-4 w-4" />
              Quiz
            </button>
            <button
              onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(CURRICULUM.map((p) => p.id)))}
              className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800"
            >
              {allCollapsed ? "Expand all" : "Collapse all"}
            </button>
            <button
              onClick={resetProgress}
              title="Reset progress"
              className="rounded-md border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mind map canvas ────────────────────────────────────────────── */}
      <main className="relative flex-1 overflow-auto">
        {/* Root node band */}
        <div className="sticky left-0 top-0 z-10 flex items-center gap-2 border-b border-zinc-800/60 bg-zinc-950/70 px-4 py-2 text-xs text-zinc-500 backdrop-blur sm:px-6">
          <span className="rounded-full bg-gradient-to-r from-sky-500/20 to-violet-500/20 px-3 py-1 font-semibold text-zinc-200 ring-1 ring-inset ring-zinc-700">
            GCP PCA Curriculum
          </span>
          {caseStudyFilter ? (
            <button
              onClick={() => setCaseStudyFilter(null)}
              title="Clear case study filter"
              className="flex items-center gap-1.5 rounded-full border border-violet-500/50 bg-violet-500/15 px-3 py-1 font-medium text-violet-200 transition-colors hover:bg-violet-500/25"
            >
              <Layers className="h-3 w-3" />
              {caseStudyFilter}
              <X className="h-3 w-3" />
            </button>
          ) : (
            <span className="text-zinc-600">
              → 6 pillars + decision guides · click a node to deep-dive
            </span>
          )}
        </div>

        <div className="flex min-h-full gap-4 p-4 sm:p-6">
          {CURRICULUM.map((pillar) => {
            const accent = ACCENT[pillar.accent] ?? ACCENT.sky;
            const PillarIcon = iconFor(pillar.icon);
            const isCollapsed = collapsed.has(pillar.id);
            const visible = pillar.services.filter(matches);

            // Per-pillar mastery bar
            const pTotal = pillar.services.length;
            const pMastered = pillar.services.filter(
              (s) => confidence[s.id] === "mastered",
            ).length;

            return (
              <section
                key={pillar.id}
                className="flex w-72 shrink-0 flex-col rounded-xl border border-zinc-800 bg-zinc-900/40"
              >
                {/* Pillar header */}
                <button
                  onClick={() => togglePillar(pillar.id)}
                  className="flex items-center gap-2.5 rounded-t-xl border-b border-zinc-800 p-3 text-left transition-colors hover:bg-zinc-800/40"
                >
                  <div className={`rounded-lg bg-zinc-800 p-2 ${accent.text}`}>
                    <PillarIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-bold text-zinc-100">
                      {pillar.name}
                    </h2>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={`h-full ${accent.bar} transition-all`}
                          style={{ width: `${pTotal ? (pMastered / pTotal) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {pMastered}/{pTotal}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${
                      isCollapsed ? "-rotate-90" : ""
                    }`}
                  />
                </button>

                {/* Services */}
                {!isCollapsed && (
                  <div className="flex flex-col gap-2.5 p-3">
                    {visible.length === 0 ? (
                      <p className="py-6 text-center text-xs text-zinc-600">
                        No matching services
                      </p>
                    ) : (
                      visible.map((svc) => {
                        let highlight: "self" | "related" | "dimmed" | "none" =
                          "none";
                        if (hoveredId) {
                          if (hoveredId === svc.id) highlight = "self";
                          else if (relatedIds?.has(svc.id)) highlight = "related";
                          else highlight = "dimmed";
                        }
                        return (
                          <ServiceNode
                            key={svc.id}
                            service={svc}
                            confidence={confidence[svc.id]}
                            onSelect={() => setSelectedId(svc.id)}
                            onSetConfidence={(level) =>
                              setServiceConfidence(svc.id, level)
                            }
                            highlight={highlight}
                            hoveredId={hoveredId}
                            onHover={setHoveredId}
                          />
                        );
                      })
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>

      {/* ── Detail panel ───────────────────────────────────────────────── */}
      <DetailPanel
        service={selected}
        confidence={selected ? confidence[selected.id] : undefined}
        onSetConfidence={(level) =>
          selected && setServiceConfidence(selected.id, level)
        }
        onClose={() => setSelectedId(null)}
        onNavigate={(id) => setSelectedId(id)}
      />

      {/* ── Quiz overlay ───────────────────────────────────────────────── */}
      {quizOpen && (
        <QuizMode
          confidence={confidence}
          onSetConfidence={setServiceConfidence}
          onReview={(id) => setSelectedId(id)}
          onClose={() => setQuizOpen(false)}
        />
      )}

      {/* ── Case Study Explorer overlay ────────────────────────────────── */}
      {explorerOpen && (
        <CaseStudyExplorer
          onReview={(id) => {
            setExplorerOpen(false);
            setSelectedId(id);
          }}
          onFilter={(name) => {
            setCaseStudyFilter(name);
            setExplorerOpen(false);
          }}
          onClose={() => setExplorerOpen(false)}
        />
      )}
    </div>
  );
}

function ProgressStat({
  color,
  value,
  label,
}: {
  color: string;
  value: number;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-zinc-400">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="font-semibold text-zinc-200">{value}</span>
      <span className="hidden lg:inline">{label}</span>
    </span>
  );
}
