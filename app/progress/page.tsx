import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/src/lib/auth";
import { getProgressBreakdown, getProgressSummary } from "@/src/lib/progress";
import { ProgressDashboard } from "@/src/components/progress/progress-dashboard";
import { Button } from "@/src/components/ui/button";

export const metadata: Metadata = {
  title: "Progress Dashboard",
  description: "Track kana streaks, accuracy, and Leitner box distribution."
};

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col gap-6 text-center">
        <h1 className="text-3xl font-bold">See your streaks and accuracy</h1>
        <p className="text-muted-foreground">
          Sign in to unlock insights on box distribution, recent activity, and session targets.
        </p>
        <Button asChild>
          <Link href="/auth/sign-in">Sign in</Link>
        </Button>
      </section>
    );
  }

  const [summary, breakdown] = await Promise.all([
    getProgressSummary(session.user.id),
    getProgressBreakdown(session.user.id)
  ]);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Progress dashboard</h1>
        <p className="text-muted-foreground">
          Keep an eye on due cards, accuracy trends, and when you last reviewed.
        </p>
      </header>
      <ProgressDashboard summary={summary} breakdown={breakdown} />
    </section>
  );
}
