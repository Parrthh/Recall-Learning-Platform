import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, hasGoogleProvider } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Log in — Recall" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-lg font-semibold text-sky-400">
          Recall
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-white">Log in</h1>
        <p className="mt-1 text-sm text-slate-400">
          New here?{" "}
          <Link href="/signup" className="text-sky-400 hover:underline">
            Create an account
          </Link>
        </p>
        <Suspense>
          <LoginForm showGoogle={hasGoogleProvider()} />
        </Suspense>
      </div>
    </main>
  );
}
