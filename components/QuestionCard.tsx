"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type QuestionStatus = "ATTEMPTED" | "SOLVED" | "NEEDS_REVIEW";

interface QuestionMeta {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  hintCount: number;
  sourceUrl: string | null;
  status: QuestionStatus | null;
  nextReviewAt: string | null;
}

const DIFFICULTY_STYLES: Record<QuestionMeta["difficulty"], string> = {
  EASY: "bg-emerald-500/15 text-emerald-300",
  MEDIUM: "bg-amber-500/15 text-amber-300",
  HARD: "bg-red-500/15 text-red-300",
};

const STATUS_LABELS: { value: QuestionStatus; label: string }[] = [
  { value: "ATTEMPTED", label: "Attempted" },
  { value: "SOLVED", label: "Solved" },
  { value: "NEEDS_REVIEW", label: "Needs review" },
];

export function QuestionCard({
  question,
  prompt,
  hints,
  solution,
}: {
  question: QuestionMeta;
  prompt: ReactNode;
  hints: ReactNode[];
  solution: ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<QuestionStatus | null>(question.status);
  const [nextReviewAt, setNextReviewAt] = useState<string | null>(question.nextReviewAt);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  // Scratchpad persists locally per question — it's a thinking space, not submitted code.
  const scratchKey = `recall-scratch-${question.id}`;
  const [scratch, setScratch] = useState(
    () => (typeof window === "undefined" ? "" : window.localStorage.getItem(scratchKey)) ?? ""
  );
  const [reviewDays, setReviewDays] = useState(3);
  const [pending, setPending] = useState(false);

  function onScratchChange(value: string) {
    setScratch(value);
    window.localStorage.setItem(scratchKey, value);
  }

  async function updateStatus(next: QuestionStatus, days?: number) {
    setPending(true);
    const res = await fetch(`/api/questions/${question.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next, reviewDays: days ?? null }),
    });
    setPending(false);
    if (res.ok) {
      const data = (await res.json()) as { status: QuestionStatus; nextReviewAt: string | null };
      setStatus(data.status);
      setNextReviewAt(data.nextReviewAt);
      router.refresh();
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6" data-question={question.id}>
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-semibold text-white">{question.title}</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFFICULTY_STYLES[question.difficulty]}`}
        >
          {question.difficulty.charAt(0) + question.difficulty.slice(1).toLowerCase()}
        </span>
        {status && (
          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
            {STATUS_LABELS.find((s) => s.value === status)?.label}
          </span>
        )}
        {nextReviewAt && (
          <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs text-violet-300">
            review {new Date(nextReviewAt).toLocaleDateString()}
          </span>
        )}
        {question.sourceUrl && (
          <a
            href={question.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-sky-400 hover:underline"
          >
            source ↗
          </a>
        )}
      </div>

      <div className="mt-3 text-slate-300">{prompt}</div>

      {question.hintCount > 0 && (
        <div className="mt-4 space-y-2">
          {hints.slice(0, revealedHints).map((hint, i) => (
            <div
              key={i}
              className="rounded-md border border-amber-600/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-200/90"
            >
              <span className="font-medium text-amber-300">Hint {i + 1}:</span> {hint}
            </div>
          ))}
          {revealedHints < question.hintCount && (
            <button
              type="button"
              onClick={() => setRevealedHints((n) => n + 1)}
              className="text-sm text-amber-400 hover:underline"
            >
              Reveal hint {revealedHints + 1} of {question.hintCount}
            </button>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <button
          type="button"
          onClick={() => setShowScratchpad((v) => !v)}
          className="text-slate-400 hover:text-white"
        >
          {showScratchpad ? "Hide scratchpad" : "Open scratchpad"}
        </button>
        <button
          type="button"
          onClick={() => setShowSolution((v) => !v)}
          className="text-slate-400 hover:text-white"
        >
          {showSolution ? "Hide solution" : "Show solution"}
        </button>
      </div>

      {showScratchpad && (
        <textarea
          value={scratch}
          onChange={(e) => onScratchChange(e.target.value)}
          placeholder="Sketch your approach or code here — saved locally in your browser."
          spellCheck={false}
          className="mt-3 h-48 w-full rounded-md border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
        />
      )}

      {showSolution && (
        <div className="mt-4 rounded-md border border-slate-700 bg-slate-950 p-4">{solution}</div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
        {STATUS_LABELS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            disabled={pending}
            onClick={() => updateStatus(value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
              status === value
                ? value === "SOLVED"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-600/40"
                  : value === "NEEDS_REVIEW"
                    ? "bg-red-500/20 text-red-300 border border-red-600/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-600/40"
                : "border border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="mx-1 text-slate-600">|</span>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Review again in
          <input
            type="number"
            min={1}
            max={365}
            value={reviewDays}
            onChange={(e) => setReviewDays(Math.max(1, Math.min(365, Number(e.target.value) || 1)))}
            className="w-16 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200"
          />
          days
        </label>
        <button
          type="button"
          disabled={pending}
          onClick={() => updateStatus(status ?? "NEEDS_REVIEW", reviewDays)}
          className="rounded-md border border-violet-600/40 px-3 py-1.5 text-sm text-violet-300 hover:bg-violet-500/10 disabled:opacity-50"
        >
          Schedule review
        </button>
      </div>
    </div>
  );
}
