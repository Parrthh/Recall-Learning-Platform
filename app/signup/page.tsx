import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, hasGoogleProvider } from "@/lib/auth";
import { SignupForm } from "@/components/SignupForm";

export const metadata = { title: "Sign up — Recall" };

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-lg font-semibold text-sky-400">
          Recall
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-slate-400">
          Already have one?{" "}
          <Link href="/login" className="text-sky-400 hover:underline">
            Log in
          </Link>
        </p>
        <SignupForm showGoogle={hasGoogleProvider()} />
      </div>
    </main>
  );
}
