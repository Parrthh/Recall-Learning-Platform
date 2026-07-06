"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarTopic {
  slug: string;
  title: string;
  completionPercent: number;
}

export interface SidebarSection {
  name: string;
  topics: SidebarTopic[];
}

export interface SidebarCategory {
  name: string;
  sections: SidebarSection[];
}

export function Sidebar({ categories }: { categories: SidebarCategory[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Topics" className="space-y-8">
      {categories.map((category) => (
        <div key={category.name}>
          <h2 className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {category.name}
          </h2>
          {category.sections.map((section) => (
            <div key={section.name} className="mt-3">
              <h3 className="px-2 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                {section.name}
              </h3>
              <ul className="mt-1 space-y-0.5">
                {section.topics.map((topic) => {
                  const href = `/topics/${topic.slug}`;
                  const active = pathname === href;
                  return (
                    <li key={topic.slug}>
                      <Link
                        href={href}
                        className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                          active
                            ? "bg-sky-500/10 text-sky-300"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{topic.title}</span>
                        <span
                          className={`ml-2 shrink-0 text-[10px] tabular-nums ${
                            topic.completionPercent >= 100
                              ? "text-emerald-400"
                              : topic.completionPercent > 0
                                ? "text-amber-400"
                                : "text-slate-600"
                          }`}
                        >
                          {topic.completionPercent}%
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}
