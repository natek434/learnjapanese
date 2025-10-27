"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { kanaById, kanaEntries, type KanaEntry } from "@/src/data/kana";
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
  const [result, setResult] = useState<StudyResult | null>(null);

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

  const listeningOptions = useMemo(() => {
    if (!entry) {
      return [] as KanaEntry[];
    }
    return buildListeningOptions(entry);
  }, [entry]);

  const isLocked = result !== null;

  const handleRecognize = (answer: string) => {
    if (!entry || isLocked) {
      return;
    }
    const normalized = normalizeRomaji(answer);
    const isCorrect = romajiMatches(entry.romaji, normalized);
    setResult({
      isCorrect,
      correctAnswer: entry.romaji,
      displayedPrompt: entry.char,
      mode: derivedMode,
      userAnswer: normalized,
      script: entry.script
    });
  };

  const handleRecall = (answer: string) => {
    if (!entry || isLocked) {
      return;
    }
    const trimmed = answer.trim();
    const isExact = trimmed === entry.char;
    const isVariation = !isExact && matchesVariantKana(entry, trimmed);
    setResult({
      isCorrect: isExact || isVariation,
      correctAnswer: entry.char,
      displayedPrompt: entry.romaji,
      mode: derivedMode,
      userAnswer: trimmed,
      script: entry.script,
      variantMatched: isVariation
    });
  };

  const handleListening = (answerId: string) => {
    if (!entry || isLocked) {
      return;
    }
    const isCorrect = answerId === entry.id;
    setResult({
      isCorrect,
      correctAnswer: entry.char,
      displayedPrompt: "audio",
      mode: derivedMode,
      userAnswer: answerId,
      script: entry.script
    });
  };

  const handleContinue = () => {
    if (!entry || !result) {
      return;
    }
    const gradeValue: ReviewGrade = result.isCorrect ? 3 : 0;
    setResult(null);
    grade(gradeValue);
  };

  useEffect(() => {
    setResult(null);
  }, [activeCard?.kanaId, activeCard?.seenCount, derivedMode]);

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
            key={`${entry.id}-${derivedMode}`}
            mode={derivedMode}
            entry={entry}
            isLocked={isLocked}
            onRecognize={handleRecognize}
            onRecall={handleRecall}
            onListen={handleListening}
            listeningOptions={listeningOptions}
            isReplaying={audio.isLoading}
            playAudio={entry ? audio.play : undefined}
          />
          {result ? (
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4 text-center">
              <p className={`text-lg font-semibold ${result.isCorrect ? "text-green-600" : "text-red-600"}`}>
                {result.isCorrect ? "Great job!" : "Keep practicing."}
              </p>
              <p className="text-sm text-muted-foreground">
                {result.mode === "listening"
                  ? result.isCorrect
                    ? "You matched the audio correctly."
                    : "The audio belonged to this kana."
                  : result.isCorrect
                    ? "Your answer matched the expected reading."
                    : "Here’s the correct answer for reference."}
              </p>
              <div className="rounded-md bg-background p-3">
                <p className="text-sm font-medium text-muted-foreground">Correct answer</p>
                <p className="text-2xl font-bold">
                  {result.mode === "recognition" ? result.correctAnswer : entry.char}
                </p>
                {result.mode !== "recognition" ? (
                  <p className="text-sm text-muted-foreground">{entry.romaji}</p>
                ) : null}
                {result.variantMatched ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Alternate script matched — logged as correct.
                  </p>
                ) : null}
              </div>
              <WordPractice key={`word-${entry.id}`} example={entry.example} />
              <Button type="button" onClick={handleContinue} disabled={isPending}>
                {isPending ? "Saving progress…" : "Next card"}
              </Button>
            </div>
          ) : null}
          {!result && isPending ? <p className="text-xs text-muted-foreground">Saving progress…</p> : null}
        </div>
        <aside className="space-y-4">
          {result ? (
            <div className="rounded-xl border border-border p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Details</h2>
              <p className="mt-2 text-2xl font-bold">{entry.char}</p>
              <p className="text-muted-foreground">{entry.romaji} · {entry.category} row</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Example {entry.example.word} — {entry.example.meaning} (Pitch {entry.example.pitchAccent})
              </p>
              <KanaVariations entry={entry} />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Answer to unlock pronunciation tips and stroke guidance.
            </div>
          )}
          <StrokePlayer char={entry.char} />
        </aside>
      </div>
    </div>
  );
}

interface StudyPromptProps {
  mode: StudyMode;
  entry: NonNullable<ReturnType<typeof kanaById.get>>;
  isLocked: boolean;
  onRecognize: (answer: string) => void;
  onRecall: (answer: string) => void;
  onListen: (answerId: string) => void;
  listeningOptions: readonly KanaEntry[];
  isReplaying: boolean;
  playAudio?: () => Promise<void>;
}

function StudyPrompt({
  mode,
  entry,
  isLocked,
  onRecognize,
  onRecall,
  onListen,
  listeningOptions,
  isReplaying,
  playAudio
}: StudyPromptProps) {
  if (mode === "listening") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Listen and select the kana you hear.</p>
        <Button type="button" onClick={playAudio} disabled={!playAudio}>
          {isReplaying ? "Loading audio…" : "Play pronunciation"}
        </Button>
        <div className="grid gap-2 sm:grid-cols-2">
          {listeningOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onListen(option.id)}
              disabled={isLocked}
              className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-3 text-center transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="text-3xl font-bold">{option.char}</span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{option.script}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "recall") {
    return <RecallPrompt entry={entry} isLocked={isLocked} onRecall={onRecall} />;
  }

  return <RecognitionPrompt entry={entry} isLocked={isLocked} onRecognize={onRecognize} />;
}

interface RecognitionPromptProps {
  entry: NonNullable<ReturnType<typeof kanaById.get>>;
  isLocked: boolean;
  onRecognize: (answer: string) => void;
}

function RecognitionPrompt({ entry, isLocked, onRecognize }: RecognitionPromptProps) {
  const [value, setValue] = useState("");

  return (
    <form
      className="space-y-4 text-center"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isLocked) {
          onRecognize(value);
        }
      }}
    >
      <p className="text-5xl font-bold">{entry.char}</p>
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <input
          type="text"
          inputMode="latin"
          placeholder="Type the romaji"
          className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-center text-lg shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={isLocked}
          autoFocus
        />
        <Button type="submit" disabled={isLocked}>
          Check answer
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Answer without accents or spaces. Variants like "shi/si" are accepted.</p>
    </form>
  );
}

interface RecallPromptProps {
  entry: NonNullable<ReturnType<typeof kanaById.get>>;
  isLocked: boolean;
  onRecall: (answer: string) => void;
}

function RecallPrompt({ entry, isLocked, onRecall }: RecallPromptProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLocked) {
      onRecall(value);
    }
  };

  const handleSelect = (character: string) => {
    if (!isLocked) {
      setValue(character);
      onRecall(character);
    }
  };

  return (
    <form className="space-y-4 text-center" onSubmit={handleSubmit}>
      <p className="text-4xl font-bold">{entry.romaji}</p>
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <input
          type="text"
          inputMode="text"
          placeholder="Type or paste the kana"
          className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-center text-lg shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={isLocked}
        />
        <Button type="submit" disabled={isLocked}>
          Check answer
        </Button>
      </div>
      <KanaPalette entry={entry} onSelect={handleSelect} disabled={isLocked} />
      <p className="text-xs text-muted-foreground">Click a character above to insert a kana variation.</p>
    </form>
  );
}

interface KanaPaletteProps {
  entry: NonNullable<ReturnType<typeof kanaById.get>>;
  onSelect: (character: string) => void;
  disabled: boolean;
}

function KanaPalette({ entry, onSelect, disabled }: KanaPaletteProps) {
  const variations = useMemo(
    () => kanaEntries.filter((candidate) => candidate.romaji === entry.romaji),
    [entry.romaji]
  );

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {variations.map((variation) => (
        <button
          key={variation.id}
          type="button"
          onClick={() => onSelect(variation.char)}
          disabled={disabled}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-lg transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="font-semibold">{variation.char}</span>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{variation.script}</span>
        </button>
      ))}
    </div>
  );
}

interface WordPracticeProps {
  example: KanaEntry["example"];
}

function WordPractice({ example }: WordPracticeProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = value.trim().toLowerCase();
    const expected = example.meaning.trim().toLowerCase();
    setStatus(normalized === expected ? "correct" : "incorrect");
  };

  return (
    <div className="space-y-2 text-left">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Word practice</p>
      <p className="text-lg font-medium">{example.word}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          placeholder="Type the English meaning"
          className="w-full rounded-md border border-border bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <Button type="submit">Check meaning</Button>
      </form>
      {status === "idle" ? (
        <p className="text-xs text-muted-foreground">Reinforce vocabulary alongside the kana.</p>
      ) : status === "correct" ? (
        <p className="text-sm text-green-600">Nice! That’s the meaning.</p>
      ) : (
        <p className="text-sm text-red-600">
          Not quite — it means <span className="font-medium">{example.meaning}</span>.
        </p>
      )}
    </div>
  );
}

interface KanaVariationsProps {
  entry: KanaEntry;
}

function KanaVariations({ entry }: KanaVariationsProps) {
  const variations = useMemo(
    () => kanaEntries.filter((candidate) => candidate.romaji === entry.romaji && candidate.id !== entry.id),
    [entry]
  );

  if (variations.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Variations</p>
      <div className="flex flex-wrap gap-2">
        {variations.map((variation) => (
          <div key={variation.id} className="rounded-md border border-border px-3 py-2">
            <p className="text-lg font-semibold">{variation.char}</p>
            <p className="text-xs text-muted-foreground">{variation.script}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StudyResult {
  isCorrect: boolean;
  correctAnswer: string;
  displayedPrompt: string;
  userAnswer: string;
  mode: StudyMode;
  script: KanaEntry["script"];
  variantMatched?: boolean;
}

function buildListeningOptions(entry: KanaEntry, desired = 4): KanaEntry[] {
  const pool = kanaEntries.filter((candidate) => candidate.script === entry.script && candidate.id !== entry.id);
  const shuffled = shuffle(pool);
  const options = shuffled.slice(0, Math.max(0, desired - 1));
  const final = [...options, entry];
  return shuffle(final);
}

function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function normalizeRomaji(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z]/g, "");
}

function romajiMatches(expected: string, received: string): boolean {
  const variants = romajiVariants.get(expected) ?? [normalizeRomaji(expected)];
  return variants.some((variant) => variant === received);
}

function matchesVariantKana(entry: KanaEntry, value: string): boolean {
  return kanaEntries.some((candidate) => candidate.char === value && candidate.romaji === entry.romaji && candidate.id !== entry.id);
}

const presetRomajiVariants: Record<string, string[]> = {
  shi: ["shi", "si"],
  chi: ["chi", "ti"],
  tsu: ["tsu", "tu"],
  ji: ["ji", "zi", "dji"],
  zu: ["zu", "du", "dzu"],
  fu: ["fu", "hu"]
};

const romajiVariants = new Map<string, string[]>();

for (const entry of kanaEntries) {
  const base = entry.romaji;
  const presets = presetRomajiVariants[base] ?? [base];
  const normalizedSet = new Set(presets.map((value) => normalizeRomaji(value)));
  normalizedSet.add(normalizeRomaji(base));
  romajiVariants.set(base, Array.from(normalizedSet));
}
