import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { initializeSchedule } from "@/src/lib/srs";
import { getUserProgress } from "@/src/lib/progress";
import { kanaEntries } from "@/src/data/kana";
import { QuizClient } from "@/src/components/flashcards/quiz-client";
import { Button } from "@/src/components/ui/button";

export const metadata: Metadata = {
  title: "Kana Practice",
  description: "Adaptive Leitner reviews for hiragana and katakana with multiple study modes."
};

export default async function QuizPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col gap-6 text-center">
        <h1 className="text-3xl font-bold">Sign in to start your adaptive practice</h1>
        <p className="text-muted-foreground">
          Create a free account to track Leitner boxes, streaks, and listening history across devices.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/about-learning">See how it works</Link>
          </Button>
        </div>
      </section>
    );
  }

  const progress = await getUserProgress(session.user.id);
  const knownIds = new Set(progress.map((item) => item.kanaId));
  const seedSchedules = kanaEntries
    .filter((entry) => !knownIds.has(entry.id))
    .map((entry) => initializeSchedule(entry.id));

  const queue = [...progress, ...seedSchedules]
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
    .map((item) => ({
      kanaId: item.kanaId,
      box: item.box,
      dueAt: item.dueAt.toISOString(),
      lastScore: item.lastScore,
      seenCount: item.seenCount
    }));

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Daily practice</h1>
        <p className="text-muted-foreground">
          Cycle through recognition, recall, listening, or mixed modes. Your progress saves as soon as
          you grade a card.
        </p>
      </header>
      <QuizClient queue={queue} />
    </section>
  );
}
