import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import { computeNextReviewAt, isQuestionStatus } from "@/lib/question-status";
import { deriveTopicStatus } from "@/lib/progress";

const bodySchema = z.object({
  status: z.enum(["ATTEMPTED", "SOLVED", "NEEDS_REVIEW"]),
  reviewDays: z.number().int().min(1).max(365).nullable().optional(),
});

/**
 * Set the caller's status for a question (Attempted / Solved / Needs Review),
 * optionally scheduling a "review again in N days" date, then recompute the
 * topic-level progress so the dashboard stays consistent.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success || !isQuestionStatus(parsed.data.status)) {
    return NextResponse.json({ error: "Invalid status payload" }, { status: 400 });
  }

  const question = await prisma.question.findUnique({
    where: { id },
    select: { id: true, topicId: true },
  });
  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const nextReviewAt = computeNextReviewAt(parsed.data.reviewDays ?? null);

  const entry = await prisma.userQuestionStatus.upsert({
    where: { userId_questionId: { userId, questionId: question.id } },
    create: { userId, questionId: question.id, status: parsed.data.status, nextReviewAt },
    update: { status: parsed.data.status, nextReviewAt },
  });

  // Recompute topic progress: solved count + theoryRead drive status/percent.
  const [totalQuestions, solvedQuestions, existingProgress] = await Promise.all([
    prisma.question.count({ where: { topicId: question.topicId } }),
    prisma.userQuestionStatus.count({
      where: { userId, status: "SOLVED", question: { topicId: question.topicId } },
    }),
    prisma.userProgress.findUnique({
      where: { userId_topicId: { userId, topicId: question.topicId } },
    }),
  ]);
  const theoryRead = existingProgress?.theoryRead ?? false;
  const status = deriveTopicStatus({ theoryRead, totalQuestions, solvedQuestions });
  await prisma.userProgress.upsert({
    where: { userId_topicId: { userId, topicId: question.topicId } },
    create: { userId, topicId: question.topicId, status, theoryRead, lastStudiedAt: new Date() },
    update: { status, lastStudiedAt: new Date() },
  });

  return NextResponse.json({
    status: entry.status,
    nextReviewAt: entry.nextReviewAt,
    topic: { id: question.topicId, status, solvedQuestions, totalQuestions },
  });
}
