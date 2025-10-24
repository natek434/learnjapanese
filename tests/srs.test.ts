import { describe, expect, it } from "vitest";
import { initializeSchedule, scheduleNext } from "@/src/lib/srs";

describe("Leitner scheduling", () => {
  it("moves card to next box on good grade", () => {
    const start = initializeSchedule("hiragana-a", new Date("2024-01-01T00:00:00Z"));
    const next = scheduleNext(start, 2, new Date("2024-01-01T00:00:00Z"));
    expect(next.box).toBe(2);
    expect(next.dueAt.toISOString()).toBe("2024-01-02T00:00:00.000Z");
  });

  it("resets to box 1 on failure", () => {
    const start = { ...initializeSchedule("hiragana-ka"), box: 4 as const };
    const next = scheduleNext(start, 0, new Date("2024-01-01T00:00:00Z"));
    expect(next.box).toBe(1);
    expect(next.seenCount).toBe(start.seenCount + 1);
  });
});
