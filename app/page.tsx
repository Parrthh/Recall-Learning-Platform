import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const highlights = [
  {
    title: "Theory + patterns, together",
    body: "Every topic pairs the concept with its reusable pattern template, annotated code, complexity analysis, and common pitfalls.",
  },
  {
    title: "Practice attached to theory",
    body: "Each topic ships a question bank with progressive hints, hidden solutions, and a scratchpad — no tab-switching to LeetCode.",
  },
  {
    title: "Progress that sticks",
    body: "Per-topic completion, solved counts, review flags, and a study streak keep interview prep consistent.",
  },
];

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-sky-400">Recall</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-slate-300 hover:text-white">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-sky-500 px-3 py-1.5 font-medium text-white hover:bg-sky-400"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          DSA &amp; System Design,
          <span className="text-sky-400"> in one place</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Learn the theory, internalize the patterns, and drill practice questions — without
          context-switching between a notes app, LeetCode, and system design blogs.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-sky-500 px-6 py-3 font-medium text-white hover:bg-sky-400"
          >
            Start learning
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-slate-700 px-6 py-3 font-medium text-slate-200 hover:bg-slate-800"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 grid gap-6 sm:grid-cols-3">
        {highlights.map((h) => (
          <div key={h.title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="font-semibold text-white">{h.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{h.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
