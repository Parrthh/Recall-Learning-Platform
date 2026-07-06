import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { readTopicContent } from "@/lib/content";
import { topicCompletionPercent } from "@/lib/progress";
import { Markdown } from "@/components/Markdown";
import { TheoryReadToggle } from "@/components/TheoryReadToggle";
import { QuestionCard } from "@/components/QuestionCard";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const userId = await requireUserId();
  const { slug } = await params;

  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { userStatuses: { where: { userId } } },
      },
      progress: { where: { userId } },
    },
  });
  if (!topic) notFound();

  const [content, prerequisiteTopics] = await Promise.all([
    readTopicContent(topic.contentPath),
    topic.prerequisites.length > 0
      ? prisma.topic.findMany({
          where: { slug: { in: topic.prerequisites } },
          select: { slug: true, title: true },
        })
      : Promise.resolve([]),
  ]);

  const theoryRead = topic.progress[0]?.theoryRead ?? false;
  const solvedQuestions = topic.questions.filter(
    (q) => q.userStatuses[0]?.status === "SOLVED"
  ).length;
  const completionPercent = topicCompletionPercent({
    theoryRead,
    totalQuestions: topic.questions.length,
    solvedQuestions,
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {topic.category === "DSA" ? "Data Structures & Algorithms" : "System Design"} ·{" "}
            {topic.section}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">{topic.title}</h1>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums text-sky-400">{completionPercent}%</div>
          <div className="text-xs text-slate-500">complete</div>
        </div>
      </div>

      {prerequisiteTopics.length > 0 && (
        <p className="mt-4 text-sm text-slate-400">
          Prerequisites:{" "}
          {prerequisiteTopics.map((p, i) => (
            <span key={p.slug}>
              {i > 0 && ", "}
              <Link href={`/topics/${p.slug}`} className="text-sky-400 hover:underline">
                {p.title}
              </Link>
            </span>
          ))}
        </p>
      )}

      <article className="mt-8">
        <Markdown>{content}</Markdown>
      </article>

      <div className="mt-8 border-t border-slate-800 pt-6">
        <TheoryReadToggle slug={topic.slug} initialTheoryRead={theoryRead} />
      </div>

      {topic.questions.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white">
            Practice questions{" "}
            <span className="text-base font-normal text-slate-500">
              ({solvedQuestions}/{topic.questions.length} solved)
            </span>
          </h2>
          <div className="mt-6 space-y-6">
            {topic.questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={{
                  id: question.id,
                  title: question.title,
                  difficulty: question.difficulty,
                  hintCount: question.hints.length,
                  sourceUrl: question.sourceUrl,
                  status: question.userStatuses[0]?.status ?? null,
                  nextReviewAt: question.userStatuses[0]?.nextReviewAt?.toISOString() ?? null,
                }}
                prompt={<Markdown>{question.prompt}</Markdown>}
                hints={question.hints.map((hint, i) => (
                  <Markdown key={i}>{hint}</Markdown>
                ))}
                solution={<Markdown>{question.solutionMd}</Markdown>}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
