import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { FeatureHighlights } from "@/src/components/navigation/feature-highlights";

export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-12">
      <header className="space-y-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Kana Companion</p>
        <h1 className="text-balance text-4xl font-bold sm:text-5xl">
          Master hiragana and katakana with science-backed practice
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Progress through adaptive Leitner decks, listen to native pronunciation, and follow
          stroke-by-stroke guidance. Designed for focused daily sessions on any device.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild className="gap-2">
            <Link href="/kana">
              Explore Kana Library
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/about-learning">How to Learn Effectively</Link>
          </Button>
        </div>
      </header>
      <FeatureHighlights />
    </section>
  );
}
