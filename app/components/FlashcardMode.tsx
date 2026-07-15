"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Layers,
  RotateCcw,
  RotateCw,
  Sparkles,
  Trophy,
  WalletCards,
  X,
} from "lucide-react";
import { SERVICE_INDEX } from "../lib/curriculum";
import {
  FLASHCARDS,
  FLASHCARD_DECKS,
  type Flashcard,
} from "../lib/flashcards";

const KNOWN_KEY = "gcp-pca-flashcards-known-v1";

interface FlashcardModeProps {
  onReview: (serviceId: string) => void;
  /** When set, open straight into this deck (auto-start). */
  initialDeck?: string | null;
  onClose: () => void;
}

type Phase = "setup" | "playing" | "summary";
type Scope = { kind: "all" } | { kind: "deck"; deck: string };
type Grade = "known" | "review";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cardsForScope(scope: Scope): Flashcard[] {
  if (scope.kind === "all") return FLASHCARDS;
  return FLASHCARDS.filter((c) => c.deck === scope.deck);
}

export function FlashcardMode({
  onReview,
  initialDeck,
  onClose,
}: FlashcardModeProps) {
  // Deep-link: when opened for a specific deck, start straight into it.
  const deepDeck =
    initialDeck && FLASHCARD_DECKS.some((d) => d === initialDeck)
      ? initialDeck
      : null;
  const initialScope: Scope = deepDeck
    ? { kind: "deck", deck: deepDeck }
    : { kind: "all" };
  const [phase, setPhase] = useState<Phase>(deepDeck ? "playing" : "setup");
  const [scope, setScope] = useState<Scope>(initialScope);
  const [deck, setDeck] = useState<Flashcard[]>(() =>
    deepDeck ? shuffle(cardsForScope(initialScope)) : [],
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, Grade>>({});
  const [known, setKnown] = useState<Set<string>>(new Set());

  // Load mastered cards from localStorage after mount (read post-mount to
  // avoid an SSR hydration mismatch — matches the rest of the app).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KNOWN_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setKnown(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  const persistKnown = (next: Set<string>) => {
    setKnown(next);
    try {
      localStorage.setItem(KNOWN_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  };

  const decks = useMemo(() => [...FLASHCARD_DECKS], []);

  const start = (cards: Flashcard[]) => {
    if (cards.length === 0) return;
    setDeck(shuffle(cards));
    setIndex(0);
    setFlipped(false);
    setResults({});
    setPhase("playing");
  };

  const grade = (card: Flashcard, g: Grade) => {
    setResults((prev) => ({ ...prev, [card.id]: g }));
    const next = new Set(known);
    if (g === "known") next.add(card.id);
    else next.delete(card.id);
    persistKnown(next);

    if (index + 1 >= deck.length) {
      setPhase("summary");
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  // Keyboard: Esc closes, Space/Enter flips, 1/2 grade once flipped.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (phase !== "playing") return;
      const card = deck[index];
      if (!card) return;
      if ((e.key === " " || e.key === "Enter") && !flipped) {
        e.preventDefault();
        setFlipped(true);
      } else if (flipped && (e.key === "1" || e.key === "2")) {
        e.preventDefault();
        grade(card, e.key === "1" ? "review" : "known");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, deck, index, flipped]);

  const knownCount = deck.filter((c) => results[c.id] === "known").length;
  const reviewPile = deck.filter((c) => results[c.id] === "review");

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950/95 backdrop-blur">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 p-2">
            <WalletCards className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold text-zinc-50">Study Cards</h1>
            <p className="text-[11px] text-zinc-500">
              Official PCA flashcards · flip &amp; self-grade
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close study cards"
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
                <Sparkles className="h-6 w-6 text-teal-400" />
                <h2 className="text-lg font-semibold text-zinc-100">
                  Pick a deck
                </h2>
              </div>

              <div className="space-y-2">
                <DeckOption
                  active={scope.kind === "all"}
                  onClick={() => setScope({ kind: "all" })}
                  icon={<Layers className="h-4 w-4" />}
                  label="All study cards"
                  count={FLASHCARDS.length}
                  known={FLASHCARDS.filter((c) => known.has(c.id)).length}
                />
                <div className="pt-2">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    By topic
                  </p>
                  <div className="space-y-2">
                    {decks.map((d) => {
                      const cards = FLASHCARDS.filter((c) => c.deck === d);
                      return (
                        <DeckOption
                          key={d}
                          active={scope.kind === "deck" && scope.deck === d}
                          onClick={() => setScope({ kind: "deck", deck: d })}
                          icon={<WalletCards className="h-4 w-4" />}
                          label={d}
                          count={cards.length}
                          known={cards.filter((c) => known.has(c.id)).length}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => start(cardsForScope(scope))}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-500"
              >
                Study {cardsForScope(scope).length} card
                {cardsForScope(scope).length === 1 ? "" : "s"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-center text-[11px] text-zinc-600">
                Tip: press <kbd className="text-zinc-400">Space</kbd> to flip,{" "}
                <kbd className="text-zinc-400">1</kbd> /{" "}
                <kbd className="text-zinc-400">2</kbd> to grade. Progress is
                saved.
              </p>
            </div>
          )}

          {/* ── Playing ───────────────────────────────────────────────── */}
          {phase === "playing" && deck[index] && (
            <CardView
              card={deck[index]}
              index={index}
              total={deck.length}
              flipped={flipped}
              wasKnown={known.has(deck[index].id)}
              onFlip={() => setFlipped(true)}
              onGrade={(g) => grade(deck[index], g)}
              onReview={onReview}
            />
          )}

          {/* ── Summary ───────────────────────────────────────────────── */}
          {phase === "summary" && (
            <Summary
              total={deck.length}
              knownCount={knownCount}
              reviewPile={reviewPile}
              onReview={(id) => {
                onReview(id);
                onClose();
              }}
              onRetryReview={() => start(reviewPile)}
              onRestart={() => start(deck)}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DeckOption({
  active,
  onClick,
  icon,
  label,
  count,
  known,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  known: number;
}) {
  const pct = count ? Math.round((known / count) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
        active
          ? "border-teal-500/60 bg-teal-500/10"
          : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/50"
      }`}
    >
      <span className={active ? "text-teal-300" : "text-zinc-400"}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-zinc-100">{label}</span>
        <span className="mt-1 flex items-center gap-2">
          <span className="h-1 w-24 overflow-hidden rounded-full bg-zinc-800">
            <span
              className="block h-full bg-teal-500"
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="text-[11px] text-zinc-500">
            {known}/{count} mastered
          </span>
        </span>
      </span>
      <span className="text-xs font-semibold text-zinc-400">{count}</span>
    </button>
  );
}

function CardView({
  card,
  index,
  total,
  flipped,
  wasKnown,
  onFlip,
  onGrade,
  onReview,
}: {
  card: Flashcard;
  index: number;
  total: number;
  flipped: boolean;
  wasKnown: boolean;
  onFlip: () => void;
  onGrade: (g: Grade) => void;
  onReview: (serviceId: string) => void;
}) {
  const linked = card.serviceId ? SERVICE_INDEX[card.serviceId] : undefined;

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
        <span>
          Card {index + 1} / {total}
        </span>
        <span className="flex items-center gap-1.5">
          {wasKnown && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 text-emerald-300/80">
              <Check className="h-3 w-3" /> mastered
            </span>
          )}
          <span className="rounded-full border border-teal-500/30 bg-teal-500/5 px-2 py-0.5 text-teal-300/80">
            {card.deck}
          </span>
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-teal-500 transition-all"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      {/* Card */}
      <button
        onClick={() => !flipped && onFlip()}
        disabled={flipped}
        className={`flex min-h-[16rem] w-full flex-col rounded-2xl border p-6 text-left transition-colors sm:p-8 ${
          flipped
            ? "cursor-default border-teal-500/40 bg-zinc-900"
            : "border-zinc-700 bg-zinc-900/60 hover:border-teal-500/40 hover:bg-zinc-900"
        }`}
      >
        <span className="mb-3 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          {flipped ? (
            <>
              <RotateCw className="h-3.5 w-3.5" /> Answer
            </>
          ) : (
            <>
              <WalletCards className="h-3.5 w-3.5" /> Prompt
            </>
          )}
        </span>

        <p className="text-lg font-semibold leading-snug text-zinc-100">
          {card.front}
        </p>

        {flipped ? (
          <p className="mt-4 border-t border-zinc-800 pt-4 text-[15px] leading-relaxed text-teal-100/90">
            {card.back}
          </p>
        ) : (
          <span className="mt-auto pt-6 text-sm text-zinc-500">
            Tap the card (or press Space) to reveal the answer
          </span>
        )}
      </button>

      {flipped && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => onGrade("review")}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-500/20"
            >
              <RotateCcw className="h-4 w-4" />
              Review again
              <span className="text-amber-400/60">(1)</span>
            </button>
            <button
              onClick={() => onGrade("known")}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/20"
            >
              <Check className="h-4 w-4" />
              Got it
              <span className="text-emerald-400/60">(2)</span>
            </button>
          </div>
          {linked && (
            <button
              onClick={() => onReview(card.serviceId!)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Review {linked.name} on the map
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Summary({
  total,
  knownCount,
  reviewPile,
  onReview,
  onRetryReview,
  onRestart,
  onClose,
}: {
  total: number;
  knownCount: number;
  reviewPile: Flashcard[];
  onReview: (serviceId: string) => void;
  onRetryReview: () => void;
  onRestart: () => void;
  onClose: () => void;
}) {
  const pct = total ? Math.round((knownCount / total) * 100) : 0;
  const tone =
    pct >= 80
      ? "text-emerald-400"
      : pct >= 50
        ? "text-amber-400"
        : "text-teal-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-zinc-900 p-4 ring-1 ring-zinc-800">
          <Trophy className={`h-8 w-8 ${tone}`} />
        </div>
        <div>
          <p className={`text-4xl font-bold ${tone}`}>{pct}%</p>
          <p className="mt-1 text-sm text-zinc-400">
            {knownCount} of {total} marked “Got it”
          </p>
        </div>
      </div>

      {reviewPile.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Flagged to review ({reviewPile.length})
          </h3>
          <ul className="space-y-2">
            {reviewPile.map((c) => {
              const linked = c.serviceId
                ? SERVICE_INDEX[c.serviceId]
                : undefined;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => linked && onReview(c.serviceId!)}
                    disabled={!linked}
                    className="flex w-full items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-left transition-colors enabled:hover:border-teal-500/40 enabled:hover:bg-teal-500/5 disabled:cursor-default"
                  >
                    <WalletCards className="h-4 w-4 shrink-0 text-teal-400" />
                    <span className="flex-1 text-sm text-zinc-200">
                      {c.front}
                    </span>
                    {linked && (
                      <span className="shrink-0 text-xs font-medium text-teal-300">
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
        {reviewPile.length > 0 && (
          <button
            onClick={onRetryReview}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-500"
          >
            <RotateCcw className="h-4 w-4" />
            Review flagged ({reviewPile.length})
          </button>
        )}
        <button
          onClick={onRestart}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
        >
          <RotateCw className="h-4 w-4" />
          Restart deck
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
