"use client";

import { useMemo, useState } from "react";
import { kanaById } from "@/src/data/kana";
import { StudyMode, useSRS } from "@/src/hooks/useSRS";
import { LeitnerBox, ReviewGrade } from "@/src/lib/srs";
import { Button } from "@/src/components/ui/button";
import { Toggle } from "@/src/components/ui/toggle";
import { useAudio } from "@/src/hooks/useAudio";
import { StrokePlayer } from "@/src/components/flashcards/stroke-player";

interface SerializedSchedule {
  kanaId: string;
  box: number;
  dueAt: string;
  lastScore: number;
  seenCount: number;
}

interface QuizClientProps {
  queue: readonly SerializedSchedule[];
}

const MODES: StudyMode[] = ["recognition", "recall", "listening", "mixed"];

export function QuizClient({ queue }: QuizClientProps) {
  const initialQueue = useMemo(
    () =>
      queue.map((item) => ({
        ...item,
        box: item.box as LeitnerBox,
        dueAt: new Date(item.dueAt)
      })),
    [queue]
  );

  const { activeCard, grade, mode, setMode, history, dueCount, isPending } = useSRS(initialQueue);
  const [revealedForId, setRevealedForId] = useState<string | null>(null);
  const showAnswer = activeCard?.kanaId === revealedForId;

  const derivedMode = useMemo<StudyMode>(() => {
    if (mode !== "mixed") {
      return mode;
    }
    const modes: StudyMode[] = ["recognition", "recall", "listening"];
    const index = history.length % modes.length;
    return modes[index] ?? "recognition";
  }, [mode, history.length]);

  const entry = activeCard ? kanaById.get(activeCard.kanaId) : undefined;
  const audio = useAudio({
    src: entry?.audio.source ?? "",
    fallbackText: entry?.syntheticFallback.text ?? "",
    lang: entry?.syntheticFallback.lang ?? "ja-JP"
  });

  const handleReveal = () => {
    if (activeCard) {
      setRevealedForId(activeCard.kanaId);
    }
  };

  const handleGrade = (value: ReviewGrade) => {
    grade(value);
    setRevealedForId(null);
  };

  if (!entry || !activeCard) {
    return (
      <div className="rounded-xl border border-border p-6 text-center text-muted-foreground">
        You’re all caught up! Come back when new cards are due.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Due now: {dueCount}</p>
          <p className="text-xs text-muted-foreground">
            Leitner box {activeCard.box} · Seen {activeCard.seenCount} times
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {MODES.map((modeOption) => (
            <Toggle
              key={modeOption}
              pressed={mode === modeOption}
              onPressedChange={() => setMode(modeOption)}
              label={`Switch to ${modeOption}`}
            >
              {modeOption}
            </Toggle>
          ))}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-4 rounded-xl border border-border p-6">
          <StudyPrompt
            mode={derivedMode}
            entry={entry}
            showAnswer={showAnswer}
            onReveal={handleReveal}
            isReplaying={audio.isLoading}
            playAudio={entry ? audio.play : undefined}
          />
          <div className="grid gap-2 sm:grid-cols-4">
            <GradeButton label="Again" shortcut="1" tone="danger" onSelect={() => handleGrade(0)} />
            <GradeButton label="Hard" shortcut="2" onSelect={() => handleGrade(1)} />
            <GradeButton label="Good" shortcut="3" onSelect={() => handleGrade(2)} />
            <GradeButton label="Easy" shortcut="4" onSelect={() => handleGrade(3)} />
          </div>
          {isPending ? <p className="text-xs text-muted-foreground">Saving progress…</p> : null}
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Details</h2>
            <p className="mt-2 text-2xl font-bold">{entry.char}</p>
            <p className="text-muted-foreground">{entry.romaji} · {entry.category} row</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Example {entry.example.word} — {entry.example.meaning} (Pitch {entry.example.pitchAccent})
            </p>
          </div>
          <StrokePlayer char={entry.char} />
        </aside>
      </div>
    </div>
  );
}

interface StudyPromptProps {
  mode: StudyMode;
  entry: NonNullable<ReturnType<typeof kanaById.get>>;
  showAnswer: boolean;
  onReveal: () => void;
  isReplaying: boolean;
  playAudio?: () => Promise<void>;
}

function StudyPrompt({ mode, entry, showAnswer, onReveal, isReplaying, playAudio }: StudyPromptProps) {
  if (mode === "listening") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Listen and recall the kana.</p>
        <Button type="button" onClick={playAudio} disabled={!playAudio}>
          {isReplaying ? "Loading audio…" : "Play pronunciation"}
        </Button>
        {showAnswer ? (
          <p className="text-4xl font-bold">{entry.char}</p>
        ) : (
          <Button variant="ghost" onClick={onReveal}>
            Reveal kana
          </Button>
        )}
      </div>
    );
  }

  if (mode === "recall") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-4xl font-bold">{entry.romaji}</p>
        {showAnswer ? (
          <p className="text-5xl font-bold">{entry.char}</p>
        ) : (
          <Button variant="ghost" onClick={onReveal}>
            Reveal kana
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <p className="text-5xl font-bold">{entry.char}</p>
      {showAnswer ? (
        <p className="text-3xl font-semibold">{entry.romaji}</p>
      ) : (
        <Button variant="ghost" onClick={onReveal}>
          Reveal romaji
        </Button>
      )}
    </div>
  );
}

interface GradeButtonProps {
  label: string;
  shortcut: string;
  onSelect: () => void;
  tone?: "danger";
}

function GradeButton({ label, shortcut, onSelect, tone }: GradeButtonProps) {
  return (
    <Button
      type="button"
      variant={tone === "danger" ? "outline" : "default"}
      onClick={onSelect}
      className={tone === "danger" ? "border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" : undefined}
    >
      <div className="flex w-full flex-col items-center">
        <span className="text-base font-semibold">{label}</span>
        <span className="text-xs text-muted-foreground">[{shortcut}]</span>
      </div>
    </Button>
  );
}
