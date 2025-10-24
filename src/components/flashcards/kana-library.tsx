"use client";

import { useMemo, useState } from "react";
import { KanaEntry } from "@/src/data/kana";
import { Button } from "@/src/components/ui/button";
import { KanaCard } from "@/src/components/flashcards/kana-card";

interface KanaLibraryProps {
  entries: readonly KanaEntry[];
}

const scripts = [
  { value: "all", label: "All" },
  { value: "hiragana", label: "Hiragana" },
  { value: "katakana", label: "Katakana" }
] as const;

export function KanaLibrary({ entries }: KanaLibraryProps) {
  const [script, setScript] = useState<(typeof scripts)[number]["value"]>("all");
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const set = new Set(entries.map((entry) => entry.category));
    return ["all", ...Array.from(set)];
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (script !== "all" && entry.script !== script) return false;
      if (category !== "all" && entry.category !== category) return false;
      if (!query) return true;
      const haystack = `${entry.char}${entry.romaji}${entry.example.word}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [entries, script, category, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {scripts.map((option) => (
            <Button
              key={option.value}
              variant={option.value === script ? "default" : "outline"}
              onClick={() => setScript(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((value) => (
            <Button
              key={value}
              variant={value === category ? "secondary" : "outline"}
              onClick={() => setCategory(value)}
            >
              {value === "all" ? "All rows" : value.toUpperCase()}
            </Button>
          ))}
        </div>
        <label className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
          <span className="sr-only">Search kana</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by romaji or kana"
            className="w-full bg-transparent outline-none"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((entry) => (
          <KanaCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
