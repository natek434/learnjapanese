"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/src/components/ui/button";

interface StrokePlayerProps {
  char: string;
}

interface StrokeData {
  viewBox: string;
  strokes: string[];
}

export function StrokePlayer({ char }: StrokePlayerProps) {
  const [data, setData] = useState<StrokeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [isLoading, setLoading] = useState(false);

  const url = useMemo(() => {
    const codepoint = char.codePointAt(0);
    if (!codepoint) return null;
    const hex = codepoint.toString(16).padStart(5, "0");
    return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
  }, [char]);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const load = async () => {
      setStep(0);
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load stroke data (${response.status})`);
        }
        const text = await response.text();
        if (cancelled) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) {
          throw new Error("Invalid SVG");
        }
        const viewBox = svg.getAttribute("viewBox") ?? "0 0 109 109";
        const paths = Array.from(svg.querySelectorAll("path[id*='-s']"))
          .map((path) => path.getAttribute("d") ?? "")
          .filter(Boolean);
        if (paths.length === 0) {
          throw new Error("No stroke paths found");
        }
        setData({ viewBox, strokes: paths });
        setStep(1);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading stroke order…</p>;
  }

  if (error) {
    return <p className="text-sm text-muted-foreground">Stroke preview unavailable.</p>;
  }

  if (!data) {
    return null;
  }

  const maxStep = data.strokes.length;
  const displayed = data.strokes.slice(0, step);

  return (
    <div className="space-y-2">
      <svg
        viewBox={data.viewBox}
        className="h-32 w-full rounded-lg border border-border bg-white/80 dark:bg-slate-900"
        role="img"
        aria-label={`Stroke order for ${char}`}
      >
        <rect x="0" y="0" width="100%" height="100%" fill="white" className="dark:fill-slate-900" />
        {displayed.map((path, index) => (
          <path
            key={path}
            d={path}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: index + 1 === step ? 1 : 0.6 }}
          />
        ))}
      </svg>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Step {step} / {maxStep}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step <= 1}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStep((prev) => Math.min(maxStep, prev + 1))}
            disabled={step >= maxStep}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
