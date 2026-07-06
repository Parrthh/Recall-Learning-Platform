import type { QuestionStatus } from "@prisma/client";

export const QUESTION_STATUSES = ["ATTEMPTED", "SOLVED", "NEEDS_REVIEW"] as const;

export function isQuestionStatus(value: unknown): value is QuestionStatus {
  return typeof value === "string" && (QUESTION_STATUSES as readonly string[]).includes(value);
}

/**
 * Valid transitions between question states. `null` represents "no status yet".
 * Any state can move to any other state (re-attempting a solved question is
 * legitimate), except that a question can never go back to "no status".
 */
export function canTransition(from: QuestionStatus | null, to: QuestionStatus): boolean {
  if (from === to) return true;
  return isQuestionStatus(to);
}

/**
 * Compute the next review date for the "review again in N days" flag.
 * Returns null when reviewDays is absent, which clears the flag.
 * Throws on non-positive or non-integer day counts.
 */
export function computeNextReviewAt(
  reviewDays: number | null | undefined,
  now: Date = new Date()
): Date | null {
  if (reviewDays === null || reviewDays === undefined) return null;
  if (!Number.isInteger(reviewDays) || reviewDays < 1 || reviewDays > 365) {
    throw new RangeError("reviewDays must be an integer between 1 and 365");
  }
  const next = new Date(now);
  next.setDate(next.getDate() + reviewDays);
  return next;
}

/** A question is due for review when flagged NEEDS_REVIEW or its review date has passed. */
export function isDueForReview(
  entry: { status: QuestionStatus; nextReviewAt: Date | null },
  now: Date = new Date()
): boolean {
  if (entry.status === "NEEDS_REVIEW") return true;
  return entry.nextReviewAt !== null && entry.nextReviewAt.getTime() <= now.getTime();
}
