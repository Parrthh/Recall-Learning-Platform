import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import { deriveTopicStatus, topicCompletionPercent } from "@/lib/progress";

const bodySchema = z.object({
  theoryRead: z.boolean(),
});

/** Mark a topic's theory as read/unread and recompute its progress. */
export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload: theoryRead boolean required" }, { status: 400 });
  }

  const topic = await prisma.topic.findUnique({ where: { slug }, select: { id: true } });
  if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

  const [totalQuestions, solvedQuestions] = await Promise.all([
    prisma.question.count({ where: { topicId: topic.id } }),
    prisma.userQuestionStatus.count({
      where: { userId, status: "SOLVED", question: { topicId: topic.id } },
    }),
  ]);
  const input = { theoryRead: parsed.data.theoryRead, totalQuestions, solvedQuestions };
  const status = deriveTopicStatus(input);

  await prisma.userProgress.upsert({
    where: { userId_topicId: { userId, topicId: topic.id } },
    create: {
      userId,
      topicId: topic.id,
      status,
      theoryRead: parsed.data.theoryRead,
      lastStudiedAt: new Date(),
    },
    update: { status, theoryRead: parsed.data.theoryRead, lastStudiedAt: new Date() },
  });

  return NextResponse.json({
    topicId: topic.id,
    status,
    theoryRead: parsed.data.theoryRead,
    completionPercent: topicCompletionPercent(input),
  });
}
