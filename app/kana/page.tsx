import type { Metadata } from "next";
import { KanaLibrary } from "@/src/components/flashcards/kana-library";
import { kanaEntries } from "@/src/data/kana";

export const metadata: Metadata = {
  title: "Kana Library",
  description: "Browse every hiragana and katakana symbol with pronunciation, stroke guidance, and examples."
};

export default function KanaPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Kana library</h1>
        <p className="max-w-2xl text-muted-foreground">
          Filter by script, row, or search to inspect pronunciation, pitch accent, and stroke order.
          Audio clips stream only when requested and fall back to speech synthesis if offline.
        </p>
      </header>
      <KanaLibrary entries={kanaEntries} />
    </section>
  );
}
