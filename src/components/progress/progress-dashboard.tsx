import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import { LeitnerBox } from "@/src/lib/srs";

interface Summary {
  totalCards: number;
  dueCards: number;
  lastReviewedAt: Date | null;
}

interface BreakdownItem {
  box: LeitnerBox;
  count: number;
  averageScore: number;
}

interface ProgressDashboardProps {
  summary: Summary;
  breakdown: BreakdownItem[];
}

export function ProgressDashboard({ summary, breakdown }: ProgressDashboardProps) {
  const accuracy = computeAccuracy(breakdown);
  const sorted = [...breakdown].sort((a, b) => a.box - b.box);
  const lastReviewed = summary.lastReviewedAt
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(summary.lastReviewedAt)
    : "No reviews yet";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Study snapshot</CardTitle>
          <CardDescription>Your current workload across Leitner boxes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric label="Total tracked" value={summary.totalCards} />
            <Metric label="Due now" value={summary.dueCards} />
            <Metric label="Average accuracy" value={`${accuracy.toFixed(0)}%`} />
          </div>
          <Progress
            value={
              summary.totalCards === 0
                ? 0
                : Math.min(100, (summary.dueCards / Math.max(summary.totalCards, 1)) * 100)
            }
            label="Due card ratio"
          />
          <p className="text-xs text-muted-foreground">Last review: {lastReviewed}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Leitner distribution</CardTitle>
          <CardDescription>How your cards are spread across spaced-repetition boxes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet — complete a review to populate this chart.</p>
          ) : (
            <div className="space-y-3">
              {sorted.map((item) => (
                <div key={item.box}>
                  <div className="flex items-center justify-between text-sm">
                    <span>Box {item.box}</span>
                    <span className="text-muted-foreground">{item.count} cards · {(item.averageScore / 3 * 100).toFixed(0)}% avg.</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-secondary"
                      style={{ width: `${calculateWidth(item.count, sorted)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function computeAccuracy(breakdown: BreakdownItem[]): number {
  if (breakdown.length === 0) return 0;
  const totalCards = breakdown.reduce((sum, item) => sum + item.count, 0);
  if (totalCards === 0) return 0;
  const weighted = breakdown.reduce((sum, item) => sum + item.averageScore * item.count, 0);
  return (weighted / (totalCards * 3)) * 100;
}

function calculateWidth(count: number, items: BreakdownItem[]): number {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return 0;
  return Math.max(5, (count / total) * 100);
}
