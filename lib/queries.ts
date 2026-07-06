import { prisma } from "@/lib/prisma";
import { overallStats, topicCompletionPercent, type OverallStats } from "@/lib/progress";
import { isDueForReview } from "@/lib/question-status";
import type { SidebarCategory } from "@/components/Sidebar";

const CATEGORY_LABELS: Record<string, string> = {
  DSA: "Data Structures & Algorithms",
  SYSTEM_DESIGN: "System Design",
};

export interface TopicWithUserProgress {
  id: string;
  category: "DSA" | "SYSTEM_DESIGN";
  section: string;
  title: string;
  slug: string;
  summary: string;
  theoryRead: boolean;
  totalQuestions: number;
  solvedQuestions: number;
  completionPercent: number;
}

/** All topics joined with the user's progress, in taxonomy order. */
export async function getTopicsWithProgress(userId: string): Promise<TopicWithUserProgress[]> {
  const topics = await prisma.topic.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
    include: {
      progress: { where: { userId } },
      questions: {
        select: { id: true, userStatuses: { where: { userId }, select: { status: true } } },
      },
    },
  });

  return topics.map((topic) => {
    const theoryRead = topic.progress[0]?.theoryRead ?? false;
    const totalQuestions = topic.questions.length;
    const solvedQuestions = topic.questions.filter(
      (q) => q.userStatuses[0]?.status === "SOLVED"
    ).length;
    return {
      id: topic.id,
      category: topic.category,
      section: topic.section,
      title: topic.title,
      slug: topic.slug,
      summary: topic.summary,
      theoryRead,
      totalQuestions,
      solvedQuestions,
      completionPercent: topicCompletionPercent({ theoryRead, totalQuestions, solvedQuestions }),
    };
  });
}

/** Group topics into the sidebar taxonomy: category → section → topics. */
export function groupForSidebar(topics: TopicWithUserProgress[]): SidebarCategory[] {
  const categories: SidebarCategory[] = [];
  for (const topic of topics) {
    const categoryName = CATEGORY_LABELS[topic.category] ?? topic.category;
    let category = categories.find((c) => c.name === categoryName);
    if (!category) {
      category = { name: categoryName, sections: [] };
      categories.push(category);
    }
    let section = category.sections.find((s) => s.name === topic.section);
    if (!section) {
      section = { name: topic.section, topics: [] };
      category.sections.push(section);
    }
    section.topics.push({
      slug: topic.slug,
      title: topic.title,
      completionPercent: topic.completionPercent,
    });
  }
  return categories;
}

export interface DashboardData {
  stats: OverallStats;
  topics: TopicWithUserProgress[];
  dueForReview: {
    questionId: string;
    questionTitle: string;
    topicSlug: string;
    topicTitle: string;
    status: string;
    nextReviewAt: Date | null;
  }[];
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [topics, progressRows, statusRows, questionsTotal] = await Promise.all([
    getTopicsWithProgress(userId),
    prisma.userProgress.findMany({ where: { userId } }),
    prisma.userQuestionStatus.findMany({
      where: { userId },
      include: {
        question: { select: { id: true, title: true, topic: { select: { slug: true, title: true } } } },
      },
    }),
    prisma.question.count(),
  ]);

  const activityDates = [
    ...progressRows.map((p) => p.lastStudiedAt),
    ...statusRows.map((s) => s.updatedAt),
  ];

  const stats = overallStats({
    topics: progressRows.map((p) => ({ status: p.status })),
    topicsTotal: topics.length,
    questionsTotal,
    questionStatuses: statusRows.map((s) => s.status),
    activityDates,
  });

  const dueForReview = statusRows
    .filter((s) => isDueForReview(s))
    .sort((a, b) => (a.nextReviewAt?.getTime() ?? 0) - (b.nextReviewAt?.getTime() ?? 0))
    .map((s) => ({
      questionId: s.question.id,
      questionTitle: s.question.title,
      topicSlug: s.question.topic.slug,
      topicTitle: s.question.topic.title,
      status: s.status,
      nextReviewAt: s.nextReviewAt,
    }));

  return { stats, topics, dueForReview };
}
