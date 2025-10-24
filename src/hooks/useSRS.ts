"use client";

import { useEffect, useMemo, useTransition } from "react";
import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { upsertProgress } from "@/app/actions/progress";
import { CardSchedule, ReviewGrade, compareByDueDate, scheduleNext } from "@/src/lib/srs";

export type StudyMode = "recognition" | "recall" | "listening" | "mixed";

interface SRSState {
  queue: CardSchedule[];
  history: CardSchedule[];
  mode: StudyMode;
  initialize: (queue: CardSchedule[]) => void;
  applyGrade: (grade: ReviewGrade, now: Date) => { previous: CardSchedule; updated: CardSchedule } | null;
  setMode: (mode: StudyMode) => void;
  reset: (queue: CardSchedule[]) => void;
}

const useSRSStore = create<SRSState>()(
  persist(
    (set, get) => ({
      queue: [],
      history: [],
      mode: "recognition",
      initialize(queue) {
        if (get().queue.length === 0 && queue.length > 0) {
          set({ queue: [...queue].sort(compareByDueDate), history: [] });
        }
      },
      applyGrade(grade, now) {
        const [current, ...rest] = get().queue;
        if (!current) {
          return null;
        }
        const scheduled = scheduleNext(current, grade, now);
        const nextQueue = insertByDue(rest, scheduled);
        const nextHistory = [...get().history, scheduled];
        set({ queue: nextQueue, history: nextHistory });
        return { previous: current, updated: scheduled };
      },
      setMode(mode) {
        set({ mode });
      },
      reset(queue) {
        set({ queue: [...queue].sort(compareByDueDate), history: [] });
      }
    }),
    {
      name: "kana-companion-srs",
      storage: createJSONStorage(
        () => (typeof window === "undefined" ? undefined : window.localStorage) as StateStorage,
        {
          reviver: (key, value) => {
            if (key === "dueAt" && typeof value === "string") {
              return new Date(value);
            }
            return value;
          }
        }
      )
    }
  )
);

export function useSRS(initialQueue: CardSchedule[]) {
  const [isPending, startTransition] = useTransition();
  const { queue, history, mode, initialize, applyGrade, setMode } = useSRSStore();

  useEffect(() => {
    if (initialQueue.length > 0) {
      initialize(initialQueue);
    }
  }, [initialQueue, initialize]);

  const activeCard = queue[0];
  const dueCount = useMemo(() => queue.filter((item) => item.dueAt <= new Date()).length, [queue]);

  const grade = (gradeValue: ReviewGrade) => {
    const result = applyGrade(gradeValue, new Date());
    if (!result) {
      return;
    }
    startTransition(() =>
      upsertProgress({
        kanaId: result.updated.kanaId,
        box: result.updated.box,
        dueAt: result.updated.dueAt,
        lastScore: result.updated.lastScore,
        seenCount: result.updated.seenCount
      })
    );
  };

  return {
    queue,
    history,
    activeCard,
    mode,
    setMode,
    grade,
    dueCount,
    isPending
  };
}

function insertByDue(queue: CardSchedule[], card: CardSchedule): CardSchedule[] {
  const next = [...queue];
  const index = next.findIndex((item) => item.dueAt.getTime() > card.dueAt.getTime());
  if (index === -1) {
    next.push(card);
  } else {
    next.splice(index, 0, card);
  }
  return next;
}
