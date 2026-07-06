import type { QuestionStatus, TopicStatus } from "@prisma/client";

export interface TopicProgressInput {
  theoryRead: boolean;
  totalQuestions: number;
  solvedQuestions: number;
}

/**
 * Per-topic completion percentage: theory counts for half, solved questions
 * for the other half. Topics without questions are complete once theory is read.
 */
export function topicCompletionPercent(input: TopicProgressInput): number {
  const { theoryRead, totalQuestions, solvedQuestions } = input;
  if (totalQuestions < 0 || solvedQuestions < 0 || solvedQuestions > totalQuestions) {
    throw new RangeError("invalid question counts");
  }
  if (totalQuestions === 0) return theoryRead ? 100 : 0;
  const theoryPart = theoryRead ? 50 : 0;
  const questionPart = (solvedQuestions / totalQuestions) * 50;
  return Math.round(theoryPart + questionPart);
}

/** Derive the stored topic status from the underlying progress facts. */
export function deriveTopicStatus(input: TopicProgressInput): TopicStatus {
  const percent = topicCompletionPercent(input);
  if (percent >= 100) return "DONE";
  if (percent > 0 || input.theoryRead) return "IN_PROGRESS";
  return "NOT_STARTED";
}

/** Count of questions with a given status from a status list. */
export function countByStatus(statuses: QuestionStatus[], wanted: QuestionStatus): number {
  return statuses.reduce((acc, s) => (s === wanted ? acc + 1 : acc), 0);
}

/** Truncate a date to a UTC day key like "2026-07-06". */
export function dayKeyUTC(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Current study streak in days: the number of consecutive UTC days with
 * activity, counting back from today (or yesterday, so an unfinished today
 * doesn't break the streak).
 */
export function computeStreak(activityDates: Date[], now: Date = new Date()): number {
  if (activityDates.length === 0) return 0;
  const days = new Set(activityDates.map(dayKeyUTC));
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  // A streak may end today or yesterday; anything older means it's broken.
  if (!days.has(dayKeyUTC(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(dayKeyUTC(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(dayKeyUTC(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export interface OverallStats {
  topicsTotal: number;
  topicsStarted: number;
  topicsDone: number;
  questionsTotal: number;
  questionsSolved: number;
  streakDays: number;
  lastStudiedAt: Date | null;
}

export function overallStats(params: {
  topics: { status: TopicStatus }[];
  topicsTotal: number;
  questionsTotal: number;
  questionStatuses: QuestionStatus[];
  activityDates: Date[];
  now?: Date;
}): OverallStats {
  const { topics, topicsTotal, questionsTotal, questionStatuses, activityDates } = params;
  const now = params.now ?? new Date();
  const lastStudiedAt =
    activityDates.length > 0
      ? new Date(Math.max(...activityDates.map((d) => d.getTime())))
      : null;
  return {
    topicsTotal,
    topicsStarted: topics.filter((t) => t.status !== "NOT_STARTED").length,
    topicsDone: topics.filter((t) => t.status === "DONE").length,
    questionsTotal,
    questionsSolved: countByStatus(questionStatuses, "SOLVED"),
    streakDays: computeStreak(activityDates, now),
    lastStudiedAt,
  };
}
