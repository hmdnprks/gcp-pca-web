"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Lightbulb, Terminal, X } from "lucide-react";
import { EXAM_TIPS, GCLOUD_CHEATSHEET } from "../lib/examTips";

type Tab = "tips" | "gcloud";

interface ExamTipsModeProps {
  onClose: () => void;
}

export function ExamTipsMode({ onClose }: ExamTipsModeProps) {
  const [tab, setTab] = useState<Tab>("tips");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950/95 backdrop-blur">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 p-2">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold text-zinc-50">Exam Tips</h1>
            <p className="text-[11px] text-zinc-500">
              From the official PCA training deck
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close exam tips"
          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex shrink-0 gap-1 border-b border-zinc-800 px-4 sm:px-6">
        <TabButton
          active={tab === "tips"}
          onClick={() => setTab("tips")}
          icon={<Lightbulb className="h-4 w-4" />}
          label="Tips & tricks"
        />
        <TabButton
          active={tab === "gcloud"}
          onClick={() => setTab("gcloud")}
          icon={<Terminal className="h-4 w-4" />}
          label="gcloud cheat-sheet"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          {tab === "tips" ? (
            <div className="space-y-5">
              {EXAM_TIPS.map((group) => (
                <section
                  key={group.heading}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5"
                >
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-300">
                    <span className="h-4 w-1 rounded-full bg-amber-500" />
                    {group.heading}
                  </h2>
                  <ul className="space-y-2">
                    {group.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="flex gap-2.5 text-[13px] leading-relaxed text-zinc-300"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500/60" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {GCLOUD_CHEATSHEET.map((group) => (
                <section key={group.heading} className="space-y-2">
                  <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <Terminal className="h-4 w-4 text-cyan-400" />
                    {group.heading}
                  </h2>
                  <ul className="space-y-2">
                    {group.commands.map((c) => (
                      <CommandRow key={c.label} label={c.label} cmd={c.cmd} />
                    ))}
                  </ul>
                </section>
              ))}
              <p className="pt-2 text-center text-[11px] text-zinc-600">
                Cheat-sheet transcribed from the official deck — verify exact
                flags against the current gcloud reference before relying on
                them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
        active
          ? "border-amber-400 text-amber-200"
          : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function CommandRow({ label, cmd }: { label: string; cmd: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <li className="rounded-lg border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-center justify-between gap-2 px-3 pt-2">
        <span className="text-xs font-medium text-zinc-300">{label}</span>
        <button
          onClick={copy}
          aria-label={`Copy: ${label}`}
          className="flex shrink-0 items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 pb-2.5 pt-1.5">
        <code className="font-mono text-[12px] leading-relaxed text-cyan-100/90">
          {cmd}
        </code>
      </pre>
    </li>
  );
}
