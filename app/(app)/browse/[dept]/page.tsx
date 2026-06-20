import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { levelsForCount } from "@/lib/levels";

export default async function LevelsPage({
  params,
}: {
  params: Promise<{ dept: string }>;
}) {
  const { dept } = await params;
  const supabase = await createClient();

  const { data: department } = await supabase
    .from("departments")
    .select("id, name, code, num_levels")
    .eq("code", dept)
    .maybeSingle();
  if (!department) notFound();

  const LEVELS = levelsForCount(department.num_levels);

  const { data: courses } = await supabase
    .from("courses")
    .select("level")
    .eq("department_id", department.id);

  const counts = new Map<number, number>();
  for (const c of courses ?? []) {
    counts.set(c.level, (counts.get(c.level) ?? 0) + 1);
  }

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Browse", href: "/browse" }, { label: department.name }]}
      />
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900">
        {department.name}
      </h1>
      <p className="mb-6 text-sm text-zinc-500">Choose a level.</p>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LEVELS.map((level) => {
          const n = counts.get(level) ?? 0;
          return (
            <li key={level}>
              <Link
                href={`/browse/${department.code}/${level}`}
                className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-green-300 hover:bg-green-50/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 group-hover:bg-green-100 group-hover:text-green-700">
                  <Layers className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-zinc-900">
                    {level} Level
                  </span>
                  <span className="block text-xs text-zinc-500">
                    {n} {n === 1 ? "course" : "courses"}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
