import { describe, expect, it } from "vitest";
import {
  canTransition,
  computeNextReviewAt,
  isDueForReview,
  isQuestionStatus,
} from "@/lib/question-status";

describe("isQuestionStatus", () => {
  it("accepts the three valid statuses", () => {
    expect(isQuestionStatus("ATTEMPTED")).toBe(true);
    expect(isQuestionStatus("SOLVED")).toBe(true);
    expect(isQuestionStatus("NEEDS_REVIEW")).toBe(true);
  });

  it("rejects everything else", () => {
    expect(isQuestionStatus("solved")).toBe(false);
    expect(isQuestionStatus("")).toBe(false);
    expect(isQuestionStatus(null)).toBe(false);
    expect(isQuestionStatus(42)).toBe(false);
  });
});

describe("canTransition", () => {
  it("allows first status from none", () => {
    expect(canTransition(null, "ATTEMPTED")).toBe(true);
  });

  it("allows moving between any statuses (re-attempting is legitimate)", () => {
    expect(canTransition("SOLVED", "NEEDS_REVIEW")).toBe(true);
    expect(canTransition("NEEDS_REVIEW", "SOLVED")).toBe(true);
    expect(canTransition("ATTEMPTED", "ATTEMPTED")).toBe(true);
  });
});

describe("computeNextReviewAt", () => {
  const now = new Date("2026-07-06T12:00:00Z");

  it("returns null when no review is requested (clears the flag)", () => {
    expect(computeNextReviewAt(null, now)).toBeNull();
    expect(computeNextReviewAt(undefined, now)).toBeNull();
  });

  it("adds N days", () => {
    expect(computeNextReviewAt(3, now)?.toISOString()).toBe("2026-07-09T12:00:00.000Z");
    expect(computeNextReviewAt(1, now)?.toISOString()).toBe("2026-07-07T12:00:00.000Z");
  });

  it("rolls over month boundaries", () => {
    expect(computeNextReviewAt(30, now)?.toISOString()).toBe("2026-08-05T12:00:00.000Z");
  });

  it("rejects invalid day counts", () => {
    expect(() => computeNextReviewAt(0, now)).toThrow(RangeError);
    expect(() => computeNextReviewAt(-2, now)).toThrow(RangeError);
    expect(() => computeNextReviewAt(1.5, now)).toThrow(RangeError);
    expect(() => computeNextReviewAt(366, now)).toThrow(RangeError);
  });
});

describe("isDueForReview", () => {
  const now = new Date("2026-07-06T12:00:00Z");

  it("NEEDS_REVIEW is always due", () => {
    expect(isDueForReview({ status: "NEEDS_REVIEW", nextReviewAt: null }, now)).toBe(true);
  });

  it("past review dates are due, future ones are not", () => {
    expect(
      isDueForReview({ status: "SOLVED", nextReviewAt: new Date("2026-07-05T00:00:00Z") }, now)
    ).toBe(true);
    expect(
      isDueForReview({ status: "SOLVED", nextReviewAt: new Date("2026-07-08T00:00:00Z") }, now)
    ).toBe(false);
  });

  it("no flag and no date means not due", () => {
    expect(isDueForReview({ status: "SOLVED", nextReviewAt: null }, now)).toBe(false);
    expect(isDueForReview({ status: "ATTEMPTED", nextReviewAt: null }, now)).toBe(false);
  });
});
