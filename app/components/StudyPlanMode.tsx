"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  GraduationCap,
  Layers,
  Map as MapIcon,
  RotateCcw,
  Trophy,
  WalletCards,
  X,
} from "lucide-react";
import type { Confidence } from "../lib/curriculum";
import { SERVICE_INDEX } from "../lib/curriculum";
import { CONFIDENCE_STYLES } from "../lib/confidence";
import {
  STUDY_PLAN,
  TOTAL_TASKS,
  type StudyAction,
  type StudyWeek,
} from "../lib/studyPlan";

const DONE_KEY = "gcp-pca-studyplan-done-v1";

interface StudyPlanModeProps {
  confidence: Record<string, Confidence>;
  onReview: (serviceId: string) => void;
  onQuiz: (section: string) => void;
  onCaseStudy: (caseStudyId: string) => void;
  onFlashcards: (deck?: string) => void;
  onClose: () => void;
}

export function StudyPlanMode({
  confidence,
  onReview,
  onQuiz,
  onCaseStudy,
  onFlashcards,
  onClose,
}: StudyPlanModeProps) {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DONE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setDone(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: Set<string>) => {
    setDone(next);
    try {
      localStorage.setItem(DONE_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };

  const toggle = (id: string) => {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persist(next);
  };

  const completed = useMemo(
    () =>
      STUDY_PLAN.reduce(
        (n, w) => n + w.tasks.filter((t) => done.has(t.id)).length,
        0,
      ),
    [done],
  );
  const pct = Math.round((completed / TOTAL_TASKS) * 100);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const runAction = (action: StudyAction) => {
    switch (action.type) {
      case "quiz":
        return onQuiz(action.section);
      case "caseStudy":
        return onCaseStudy(action.caseStudy);
      case "flashcards":
        return onFlashcards(action.deck);
      case "map":
        return onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950/95 backdrop-blur">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 p-2">
            <CalendarCheck className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold text-zinc-50">6-Week Study Plan</h1>
            <p className="text-[11px] text-zinc-500">
              The official PCA cohort track · progress saved
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {completed > 0 && (
            <button
              onClick={() => persist(new Set())}
              title="Reset plan progress"
              className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close study plan"
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          {/* Overall progress */}
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                {pct === 100 ? (
                  <Trophy className="h-4 w-4 text-amber-400" />
                ) : (
                  <CalendarCheck className="h-4 w-4 text-sky-400" />
                )}
                {pct === 100 ? "Plan complete — go book the exam!" : "Your progress"}
              </span>
              <span className="text-sm font-semibold text-sky-300">
                {completed}/{TOTAL_TASKS}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Weeks */}
          <ol className="space-y-4">
            {STUDY_PLAN.map((week) => (
              <WeekCard
                key={week.week}
                week={week}
                done={done}
                confidence={confidence}
                onToggle={toggle}
                onReview={onReview}
                onAction={runAction}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

const ACTION_META: Record<
  StudyAction["type"],
  { label: string; icon: typeof GraduationCap }
> = {
  quiz: { label: "Start", icon: GraduationCap },
  caseStudy: { label: "Open", icon: Layers },
  flashcards: { label: "Study", icon: WalletCards },
  map: { label: "View", icon: MapIcon },
};

function WeekCard({
  week,
  done,
  confidence,
  onToggle,
  onReview,
  onAction,
}: {
  week: StudyWeek;
  done: Set<string>;
  confidence: Record<string, Confidence>;
  onToggle: (id: string) => void;
  onReview: (serviceId: string) => void;
  onAction: (action: StudyAction) => void;
}) {
  const total = week.tasks.length;
  const complete = week.tasks.filter((t) => done.has(t.id)).length;
  const pct = Math.round((complete / total) * 100);
  const finished = complete === total;

  return (
    <li
      className={`rounded-xl border p-4 transition-colors sm:p-5 ${
        finished
          ? "border-emerald-500/30 bg-emerald-500/[0.04]"
          : "border-zinc-800 bg-zinc-900/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg text-center ${
            finished
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-sky-500/15 text-sky-300"
          }`}
        >
          {finished ? (
            <Check className="h-5 w-5" />
          ) : (
            <>
              <span className="text-[8px] font-medium uppercase leading-none opacity-70">
                Wk
              </span>
              <span className="text-base font-bold leading-none">
                {week.week}
              </span>
            </>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            {week.module}
          </p>
          <h3 className="text-sm font-bold text-zinc-50">{week.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            {week.focus}
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-zinc-500">
          {complete}/{total}
        </span>
      </div>

      {/* Per-week progress */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full transition-all ${
            finished ? "bg-emerald-500" : "bg-sky-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Topic chips */}
      {week.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {week.topics.map((id) => {
            const svc = SERVICE_INDEX[id];
            if (!svc) return null;
            const conf = confidence[id];
            const dot = conf
              ? CONFIDENCE_STYLES[conf].dot
              : "bg-zinc-600";
            return (
              <button
                key={id}
                onClick={() => onReview(id)}
                className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-sky-500/40 hover:text-sky-200"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {svc.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Task checklist */}
      <ul className="mt-3 space-y-1.5">
        {week.tasks.map((task) => {
          const isDone = done.has(task.id);
          const meta = task.action ? ACTION_META[task.action.type] : null;
          const ActionIcon = meta?.icon;
          return (
            <li
              key={task.id}
              className="flex items-start gap-2.5 rounded-lg px-1 py-1"
            >
              <button
                onClick={() => onToggle(task.id)}
                aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  isDone
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-zinc-600 hover:border-emerald-500"
                }`}
              >
                {isDone && <Check className="h-3 w-3" />}
              </button>
              <span
                className={`flex-1 text-xs leading-relaxed ${
                  isDone ? "text-zinc-500 line-through" : "text-zinc-300"
                }`}
              >
                {task.label}
              </span>
              {task.action && meta && ActionIcon && (
                <button
                  onClick={() => onAction(task.action!)}
                  className="flex shrink-0 items-center gap-1 rounded-md border border-sky-500/40 bg-sky-500/10 px-2 py-1 text-[11px] font-semibold text-sky-200 transition-colors hover:bg-sky-500/20"
                >
                  <ActionIcon className="h-3 w-3" />
                  {meta.label}
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </li>
  );
}
