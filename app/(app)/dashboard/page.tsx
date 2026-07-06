import Link from "next/link";
import { requireUserId } from "@/lib/session";
import { getDashboardData } from "@/lib/queries";

export const metadata = { title: "Dashboard — Recall" };

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-bold tabular-nums text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export default async function DashboardPage() {
  const userId = await requireUserId();
  const { stats, topics, dueForReview } = await getDashboardData(userId);

  const startedTopics = topics.filter((t) => t.completionPercent > 0);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Topics covered"
          value={`${stats.topicsDone}/${stats.topicsTotal}`}
          sub={`${stats.topicsStarted} started`}
        />
        <StatCard label="Questions solved" value={`${stats.questionsSolved}/${stats.questionsTotal}`} />
        <StatCard
          label="Study streak"
          value={`${stats.streakDays} day${stats.streakDays === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Last studied"
          value={stats.lastStudiedAt ? stats.lastStudiedAt.toLocaleDateString("en-US") : "—"}
        />
      </div>

      {dueForReview.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-white">Due for review</h2>
          <ul className="mt-4 space-y-2">
            {dueForReview.map((item) => (
              <li
                key={item.questionId}
                className="flex items-center justify-between rounded-lg border border-violet-600/30 bg-violet-500/5 px-4 py-3"
              >
                <div>
                  <Link
                    href={`/topics/${item.topicSlug}`}
                    className="font-medium text-white hover:text-sky-300"
                  >
                    {item.questionTitle}
                  </Link>
                  <span className="ml-2 text-sm text-slate-500">{item.topicTitle}</span>
                </div>
                <span className="text-xs text-violet-300">
                  {item.nextReviewAt
                    ? `due ${item.nextReviewAt.toLocaleDateString("en-US")}`
                    : "needs review"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Topic progress</h2>
        {startedTopics.length === 0 ? (
          <p className="mt-4 text-slate-400">
            Nothing started yet — pick a topic from the sidebar to begin.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {startedTopics.map((topic) => (
              <li key={topic.id}>
                <Link
                  href={`/topics/${topic.slug}`}
                  className="block rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{topic.title}</span>
                    <span className="text-sm tabular-nums text-slate-400">
                      {topic.completionPercent}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        topic.completionPercent >= 100 ? "bg-emerald-500" : "bg-sky-500"
                      }`}
                      style={{ width: `${topic.completionPercent}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-xs text-slate-500">
                    {topic.theoryRead ? "theory read" : "theory unread"}
                    {topic.totalQuestions > 0 &&
                      ` · ${topic.solvedQuestions}/${topic.totalQuestions} questions solved`}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 pb-8">
        <h2 className="text-xl font-semibold text-white">All topics</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.slug}`}
              className="rounded-lg border border-slate-800 bg-slate-900/30 px-4 py-3 hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{topic.title}</span>
                <span
                  className={`text-xs tabular-nums ${
                    topic.completionPercent >= 100
                      ? "text-emerald-400"
                      : topic.completionPercent > 0
                        ? "text-amber-400"
                        : "text-slate-600"
                  }`}
                >
                  {topic.completionPercent}%
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{topic.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
