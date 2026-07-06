import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Server-component guard: returns the signed-in user id or redirects to /login. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");
  return userId;
}

/** API-route guard: returns the user id or null (caller responds 401). */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
