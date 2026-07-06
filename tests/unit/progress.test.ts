import { describe, expect, it } from "vitest";
import {
  computeStreak,
  countByStatus,
  dayKeyUTC,
  deriveTopicStatus,
  overallStats,
  topicCompletionPercent,
} from "@/lib/progress";

describe("topicCompletionPercent", () => {
  it("is 0 with nothing done", () => {
    expect(
      topicCompletionPercent({ theoryRead: false, totalQuestions: 4, solvedQuestions: 0 })
    ).toBe(0);
  });

  it("gives theory half the weight", () => {
    expect(
      topicCompletionPercent({ theoryRead: true, totalQuestions: 4, solvedQuestions: 0 })
    ).toBe(50);
  });

  it("weights questions proportionally in the other half", () => {
    expect(
      topicCompletionPercent({ theoryRead: false, totalQuestions: 4, solvedQuestions: 2 })
    ).toBe(25);
    expect(
      topicCompletionPercent({ theoryRead: true, totalQuestions: 4, solvedQuestions: 4 })
    ).toBe(100);
  });

  it("rounds to whole percent", () => {
    expect(
      topicCompletionPercent({ theoryRead: false, totalQuestions: 3, solvedQuestions: 1 })
    ).toBe(17); // 50/3 ≈ 16.67
  });

  it("treats question-less topics as complete once theory is read", () => {
    expect(
      topicCompletionPercent({ theoryRead: true, totalQuestions: 0, solvedQuestions: 0 })
    ).toBe(100);
    expect(
      topicCompletionPercent({ theoryRead: false, totalQuestions: 0, solvedQuestions: 0 })
    ).toBe(0);
  });

  it("rejects impossible counts", () => {
    expect(() =>
      topicCompletionPercent({ theoryRead: false, totalQuestions: 2, solvedQuestions: 3 })
    ).toThrow(RangeError);
    expect(() =>
      topicCompletionPercent({ theoryRead: false, totalQuestions: -1, solvedQuestions: 0 })
    ).toThrow(RangeError);
  });
});

describe("deriveTopicStatus", () => {
  it("maps 0% to NOT_STARTED", () => {
    expect(
      deriveTopicStatus({ theoryRead: false, totalQuestions: 3, solvedQuestions: 0 })
    ).toBe("NOT_STARTED");
  });

  it("maps partial progress to IN_PROGRESS", () => {
    expect(
      deriveTopicStatus({ theoryRead: true, totalQuestions: 3, solvedQuestions: 0 })
    ).toBe("IN_PROGRESS");
    expect(
      deriveTopicStatus({ theoryRead: false, totalQuestions: 3, solvedQuestions: 1 })
    ).toBe("IN_PROGRESS");
  });

  it("maps 100% to DONE", () => {
    expect(
      deriveTopicStatus({ theoryRead: true, totalQuestions: 3, solvedQuestions: 3 })
    ).toBe("DONE");
    expect(
      deriveTopicStatus({ theoryRead: true, totalQuestions: 0, solvedQuestions: 0 })
    ).toBe("DONE");
  });
});

describe("computeStreak", () => {
  const day = (s: string) => new Date(`${s}T12:00:00Z`);
  const now = day("2026-07-06");

  it("is 0 with no activity", () => {
    expect(computeStreak([], now)).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(computeStreak([day("2026-07-04"), day("2026-07-05"), day("2026-07-06")], now)).toBe(3);
  });

  it("does not break if today has no activity yet", () => {
    expect(computeStreak([day("2026-07-04"), day("2026-07-05")], now)).toBe(2);
  });

  it("is 0 when the last activity was 2+ days ago", () => {
    expect(computeStreak([day("2026-07-01"), day("2026-07-02")], now)).toBe(0);
  });

  it("stops at gaps", () => {
    expect(
      computeStreak([day("2026-07-01"), day("2026-07-05"), day("2026-07-06")], now)
    ).toBe(2);
  });

  it("dedupes multiple activities on the same day", () => {
    expect(
      computeStreak(
        [day("2026-07-06"), new Date("2026-07-06T01:00:00Z"), day("2026-07-05")],
        now
      )
    ).toBe(2);
  });
});

describe("overallStats", () => {
  it("aggregates topics, questions, and streak", () => {
    const now = new Date("2026-07-06T12:00:00Z");
    const stats = overallStats({
      topics: [{ status: "DONE" }, { status: "IN_PROGRESS" }, { status: "NOT_STARTED" }],
      topicsTotal: 10,
      questionsTotal: 20,
      questionStatuses: ["SOLVED", "SOLVED", "ATTEMPTED", "NEEDS_REVIEW"],
      activityDates: [new Date("2026-07-05T09:00:00Z"), new Date("2026-07-06T10:00:00Z")],
      now,
    });
    expect(stats.topicsTotal).toBe(10);
    expect(stats.topicsStarted).toBe(2);
    expect(stats.topicsDone).toBe(1);
    expect(stats.questionsTotal).toBe(20);
    expect(stats.questionsSolved).toBe(2);
    expect(stats.streakDays).toBe(2);
    expect(stats.lastStudiedAt?.toISOString()).toBe("2026-07-06T10:00:00.000Z");
  });

  it("handles a brand-new user", () => {
    const stats = overallStats({
      topics: [],
      topicsTotal: 5,
      questionsTotal: 12,
      questionStatuses: [],
      activityDates: [],
    });
    expect(stats.topicsStarted).toBe(0);
    expect(stats.questionsSolved).toBe(0);
    expect(stats.streakDays).toBe(0);
    expect(stats.lastStudiedAt).toBeNull();
  });
});

describe("helpers", () => {
  it("countByStatus counts only the wanted status", () => {
    expect(countByStatus(["SOLVED", "ATTEMPTED", "SOLVED"], "SOLVED")).toBe(2);
    expect(countByStatus([], "SOLVED")).toBe(0);
  });

  it("dayKeyUTC truncates to the UTC date", () => {
    expect(dayKeyUTC(new Date("2026-07-06T23:59:59Z"))).toBe("2026-07-06");
  });
});
