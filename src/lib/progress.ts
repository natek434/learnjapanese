import { prisma } from "@/src/lib/prisma";
import { CardSchedule, LeitnerBox } from "@/src/lib/srs";

export async function getUserProgress(userId: string) {
  const records = await prisma.progress.findMany({
    where: { userId },
    orderBy: [{ dueAt: "asc" }]
  });

  return records.map<CardSchedule>((record) => ({
    kanaId: record.kanaId,
    box: record.box as LeitnerBox,
    dueAt: record.dueAt,
    lastScore: record.lastScore,
    seenCount: record.seenCount
  }));
}

export async function getProgressSummary(userId: string) {
  const [total, due] = await Promise.all([
    prisma.progress.count({ where: { userId } }),
    prisma.progress.count({ where: { userId, dueAt: { lte: new Date() } } })
  ]);

  const streak = await prisma.progress.aggregate({
    where: { userId },
    _max: { updatedAt: true }
  });

  return {
    totalCards: total,
    dueCards: due,
    lastReviewedAt: streak._max.updatedAt
  };
}

export async function getProgressBreakdown(userId: string) {
  const grouped = await prisma.progress.groupBy({
    by: ["box"],
    where: { userId },
    _count: { _all: true },
    _avg: { lastScore: true }
  });

  return grouped.map((group) => ({
    box: group.box as LeitnerBox,
    count: group._count._all,
    averageScore: group._avg.lastScore ?? 0
  }));
}
