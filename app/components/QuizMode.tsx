"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  GraduationCap,
  RotateCcw,
  Target,
  Trophy,
  X,
} from "lucide-react";
import type { Confidence } from "../lib/curriculum";
import { SERVICE_INDEX } from "../lib/curriculum";
import { QUIZ, type QuizQuestion } from "../lib/quiz";

interface QuizModeProps {
  confidence: Record<string, Confidence>;
  onSetConfidence: (id: string, level: Confidence | undefined) => void;
  onReview: (serviceId: string) => void;
  onClose: () => void;
}

type Phase = "setup" | "playing" | "summary";
type Scope =
  | { kind: "all" }
  | { kind: "weak" }
  | { kind: "domain"; domain: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function questionsForScope(
  scope: Scope,
  confidence: Record<string, Confidence>,
): QuizQuestion[] {
  if (scope.kind === "all") return QUIZ;
  if (scope.kind === "domain")
    return QUIZ.filter((q) => q.domain === scope.domain);
  // weak zones: linked service currently marked "weak"
  return QUIZ.filter((q) => confidence[q.serviceId] === "weak");
}

export function QuizMode({
  confidence,
  onSetConfidence,
  onReview,
  onClose,
}: QuizModeProps) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [scope, setScope] = useState<Scope>({ kind: "all" });
  const [deck, setDeck] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const domains = useMemo(
    () => [...new Set(QUIZ.map((q) => q.domain))],
    [],
  );
  const scopeCount = questionsForScope(scope, confidence).length;

  // Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const start = (questions: QuizQuestion[]) => {
    if (questions.length === 0) return;
    setDeck(shuffle(questions));
    setIndex(0);
    setSelected(null);
    setResults({});
    setPhase("playing");
  };

  const answer = (q: QuizQuestion, choice: number) => {
    if (selected !== null) return; // already answered
    setSelected(choice);
    const correct = choice === q.answerIndex;
    setResults((prev) => ({ ...prev, [q.id]: correct }));

    // Feed the confidence heatmap.
    if (!correct) {
      onSetConfidence(q.serviceId, "weak");
    } else {
      const cur = confidence[q.serviceId];
      if (cur !== "mastered" && cur !== "reviewing") {
        onSetConfidence(q.serviceId, "reviewing");
      }
    }
  };

  const next = () => {
    if (index + 1 >= deck.length) {
      setPhase("summary");
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const score = Object.values(results).filter(Boolean).length;
  const missed = deck.filter((q) => results[q.id] === false);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950/95 backdrop-blur">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 p-2">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold text-zinc-50">Scenario Quiz</h1>
            <p className="text-[11px] text-zinc-500">
              Active recall · answers update your heatmap
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close quiz"
          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
          {/* ── Setup ─────────────────────────────────────────────────── */}
          {phase === "setup" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-fuchsia-400" />
                <h2 className="text-lg font-semibold text-zinc-100">
                  Pick a scope
                </h2>
              </div>

              <div className="space-y-2">
                <ScopeOption
                  active={scope.kind === "all"}
                  onClick={() => setScope({ kind: "all" })}
                  icon={<BookOpen className="h-4 w-4" />}
                  label="All questions"
                  count={QUIZ.length}
                />
                <ScopeOption
                  active={scope.kind === "weak"}
                  onClick={() => setScope({ kind: "weak" })}
                  icon={<Target className="h-4 w-4" />}
                  label="My weak zones only"
                  count={
                    QUIZ.filter((q) => confidence[q.serviceId] === "weak").length
                  }
                  hint="Questions linked to services you've marked Weak"
                />
                <div className="pt-2">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    By domain
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {domains.map((d) => {
                      const active =
                        scope.kind === "domain" && scope.domain === d;
                      return (
                        <button
                          key={d}
                          onClick={() => setScope({ kind: "domain", domain: d })}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? "border-fuchsia-500/60 bg-fuchsia-500/15 text-fuchsia-200"
                              : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                          }`}
                        >
                          {d}{" "}
                          <span className="text-zinc-600">
                            ({QUIZ.filter((q) => q.domain === d).length})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => start(questionsForScope(scope, confidence))}
                disabled={scopeCount === 0}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {scopeCount === 0 ? (
                  "No questions in this scope"
                ) : (
                  <>
                    Start {scopeCount} question{scopeCount === 1 ? "" : "s"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── Playing ───────────────────────────────────────────────── */}
          {phase === "playing" && deck[index] && (
            <QuestionCard
              q={deck[index]}
              index={index}
              total={deck.length}
              score={score}
              selected={selected}
              onAnswer={(choice) => answer(deck[index], choice)}
              onNext={next}
              isLast={index + 1 >= deck.length}
            />
          )}

          {/* ── Summary ───────────────────────────────────────────────── */}
          {phase === "summary" && (
            <Summary
              total={deck.length}
              score={score}
              missed={missed}
              onReview={(id) => {
                onReview(id);
                onClose();
              }}
              onRetryAll={() => start(deck)}
              onRetryMissed={() => start(missed)}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ScopeOption({
  active,
  onClick,
  icon,
  label,
  count,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  hint?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
        active
          ? "border-fuchsia-500/60 bg-fuchsia-500/10"
          : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/50"
      }`}
    >
      <span className={active ? "text-fuchsia-300" : "text-zinc-400"}>
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-zinc-100">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
      <span className="text-xs font-semibold text-zinc-400">{count}</span>
    </button>
  );
}

function QuestionCard({
  q,
  index,
  total,
  score,
  selected,
  onAnswer,
  onNext,
  isLast,
}: {
  q: QuizQuestion;
  index: number;
  total: number;
  score: number;
  selected: number | null;
  onAnswer: (choice: number) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const answered = selected !== null;
  const correct = selected === q.answerIndex;
  const linked = SERVICE_INDEX[q.serviceId];

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          Question {index + 1} / {total}
        </span>
        <span className="rounded-full border border-zinc-800 px-2 py-0.5">
          {q.domain}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-fuchsia-500 transition-all"
          style={{ width: `${((index + (answered ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <h2 className="text-base font-medium leading-relaxed text-zinc-100">
        {q.prompt}
      </h2>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answerIndex;
          const isChosen = i === selected;
          let cls =
            "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-200";
          if (answered) {
            if (isAnswer)
              cls = "border-emerald-500/60 bg-emerald-500/10 text-emerald-100";
            else if (isChosen)
              cls = "border-red-500/60 bg-red-500/10 text-red-100";
            else cls = "border-zinc-800 bg-zinc-900/20 text-zinc-500";
          }
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => onAnswer(i)}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${cls}`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-semibold">
                {answered && isAnswer ? (
                  <Check className="h-3.5 w-3.5" />
                ) : answered && isChosen ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div className="space-y-4">
          <div
            className={`rounded-lg border p-4 ${
              correct
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-red-500/40 bg-red-500/5"
            }`}
          >
            <p
              className={`mb-1 text-sm font-semibold ${
                correct ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {correct ? "Correct" : "Not quite"}
              {linked && (
                <span className="ml-2 font-normal text-zinc-500">
                  · marked {correct ? "Reviewing" : "Weak"} on {linked.name}
                </span>
              )}
            </p>
            <p className="text-sm leading-relaxed text-zinc-300">
              {q.explanation}
            </p>
          </div>

          <button
            onClick={onNext}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-500"
          >
            {isLast ? "See results" : "Next question"}
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-center text-xs text-zinc-600">
            Score so far: {score} / {index + 1}
          </p>
        </div>
      )}
    </div>
  );
}

function Summary({
  total,
  score,
  missed,
  onReview,
  onRetryAll,
  onRetryMissed,
  onClose,
}: {
  total: number;
  score: number;
  missed: QuizQuestion[];
  onReview: (id: string) => void;
  onRetryAll: () => void;
  onRetryMissed: () => void;
  onClose: () => void;
}) {
  const pct = total ? Math.round((score / total) * 100) : 0;
  const tone =
    pct >= 80
      ? "text-emerald-400"
      : pct >= 50
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-zinc-900 p-4 ring-1 ring-zinc-800">
          <Trophy className={`h-8 w-8 ${tone}`} />
        </div>
        <div>
          <p className={`text-4xl font-bold ${tone}`}>{pct}%</p>
          <p className="mt-1 text-sm text-zinc-400">
            {score} of {total} correct
          </p>
        </div>
      </div>

      {missed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Review your misses ({missed.length})
          </h3>
          <ul className="space-y-2">
            {missed.map((q) => {
              const linked = SERVICE_INDEX[q.serviceId];
              return (
                <li key={q.id}>
                  <button
                    onClick={() => onReview(q.serviceId)}
                    className="flex w-full items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-left transition-colors hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5"
                  >
                    <BookOpen className="h-4 w-4 shrink-0 text-fuchsia-400" />
                    <span className="flex-1 text-sm text-zinc-200">
                      {q.prompt}
                    </span>
                    {linked && (
                      <span className="shrink-0 text-xs font-medium text-fuchsia-300">
                        {linked.name} →
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        {missed.length > 0 && (
          <button
            onClick={onRetryMissed}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-3 text-sm font-semibold text-white hover:bg-fuchsia-500"
          >
            <Target className="h-4 w-4" />
            Retry missed
          </button>
        )}
        <button
          onClick={onRetryAll}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
        >
          <RotateCcw className="h-4 w-4" />
          Retry all
        </button>
        <button
          onClick={onClose}
          className="flex flex-1 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-400 hover:bg-zinc-800"
        >
          Back to map
        </button>
      </div>
    </div>
  );
}
