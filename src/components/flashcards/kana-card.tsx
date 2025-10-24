"use client";

import { useState } from "react";
import { Volume2, CheckCircle2, Loader2 } from "lucide-react";
import { KanaEntry } from "@/src/data/kana";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { useAudio } from "@/src/hooks/useAudio";
import { StrokePlayer } from "@/src/components/flashcards/stroke-player";

interface KanaCardProps {
  entry: KanaEntry;
}

export function KanaCard({ entry }: KanaCardProps) {
  const [played, setPlayed] = useState(false);
  const { play, isLoading, error, hasNativeAudio } = useAudio({
    src: entry.audio.source,
    fallbackText: entry.syntheticFallback.text,
    lang: entry.syntheticFallback.lang
  });

  const handlePlay = async () => {
    await play();
    setPlayed(true);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-4xl font-bold">{entry.char}</CardTitle>
          <span className="text-sm uppercase tracking-wide text-muted-foreground">{entry.script}</span>
        </div>
        <CardDescription className="text-base text-foreground">
          {entry.romaji} · {entry.category} row
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2">
          <div>
            <p className="text-sm font-medium text-foreground">Example: {entry.example.word}</p>
            <p className="text-sm text-muted-foreground">
              {entry.example.meaning} · Pitch accent {entry.example.pitchAccent}
            </p>
            {!hasNativeAudio ? (
              <p className="text-xs text-muted-foreground">Using synthetic speech to save bandwidth.</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePlay}
            disabled={isLoading}
            aria-label={`Play ${entry.char} pronunciation`}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
        {played ? (
          <p className="flex items-center gap-2 text-xs text-primary">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Played this audio
          </p>
        ) : null}
        <StrokePlayer char={entry.char} />
      </CardContent>
    </Card>
  );
}
