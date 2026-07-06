import Link from "next/link";
import { requireUserId } from "@/lib/session";
import { signOut, auth } from "@/lib/auth";
import { getTopicsWithProgress, groupForSidebar } from "@/lib/queries";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireUserId();
  const session = await auth();
  const topics = await getTopicsWithProgress(userId);
  const categories = groupForSidebar(topics);

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#0b1120]/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="text-lg font-semibold text-sky-400">
            Recall
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-slate-300 hover:text-white">
              Dashboard
            </Link>
            <span className="hidden sm:inline text-slate-500">
              {session?.user?.name ?? session?.user?.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1 flex">
        <aside className="hidden md:block w-72 shrink-0 border-r border-slate-800 overflow-y-auto max-h-[calc(100vh-57px)] sticky top-[57px] p-4">
          <Sidebar categories={categories} />
        </aside>
        <main className="flex-1 min-w-0 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
