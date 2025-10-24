export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

export interface CardSchedule {
  readonly kanaId: string;
  readonly box: LeitnerBox;
  readonly dueAt: Date;
  readonly lastScore: number;
  readonly seenCount: number;
}

export type ReviewGrade = 0 | 1 | 2 | 3;

const BOX_INTERVALS: Record<LeitnerBox, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 4,
  5: 7
};

export function initializeSchedule(kanaId: string, now: Date = new Date()): CardSchedule {
  return {
    kanaId,
    box: 1,
    dueAt: now,
    lastScore: 0,
    seenCount: 0
  };
}

export function scheduleNext(card: CardSchedule, grade: ReviewGrade, now: Date = new Date()): CardSchedule {
  const success = grade >= 2;
  const nextBox = success ? Math.min(5, (card.box + 1) as LeitnerBox) : 1;
  const intervalDays = BOX_INTERVALS[nextBox as LeitnerBox];
  const dueAt = addDays(now, intervalDays);

  return {
    ...card,
    box: nextBox as LeitnerBox,
    dueAt,
    lastScore: grade,
    seenCount: card.seenCount + 1
  };
}

export function isDue(card: CardSchedule, now: Date = new Date()): boolean {
  return card.dueAt.getTime() <= now.getTime();
}

export function compareByDueDate(a: CardSchedule, b: CardSchedule): number {
  const diff = a.dueAt.getTime() - b.dueAt.getTime();
  return diff === 0 ? a.kanaId.localeCompare(b.kanaId) : diff;
}

function addDays(base: Date, days: number): Date {
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  return result;
}
