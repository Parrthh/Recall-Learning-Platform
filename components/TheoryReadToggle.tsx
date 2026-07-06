"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TheoryReadToggle({
  slug,
  initialTheoryRead,
}: {
  slug: string;
  initialTheoryRead: boolean;
}) {
  const router = useRouter();
  const [theoryRead, setTheoryRead] = useState(initialTheoryRead);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    const next = !theoryRead;
    const res = await fetch(`/api/topics/${slug}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theoryRead: next }),
    });
    setPending(false);
    if (res.ok) {
      setTheoryRead(next);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={theoryRead}
      className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
        theoryRead
          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-600/40"
          : "bg-sky-500 text-white hover:bg-sky-400"
      }`}
    >
      {theoryRead ? "✓ Theory read — mark as unread" : "Mark theory as read"}
    </button>
  );
}
