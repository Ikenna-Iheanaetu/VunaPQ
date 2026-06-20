import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, BookPlus, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/auth";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { SemesterType } from "@/lib/database.types";

const SEMESTER_LABEL: Record<SemesterType, string> = {
  first: "First Semester",
  second: "Second Semester",
};

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ dept: string; level: string }>;
}) {
  const { dept, level } = await params;
  const levelNum = Number(level);
  const supabase = await createClient();

  const { data: department } = await supabase
    .from("departments")
    .select("id, name, code")
    .eq("code", dept)
    .maybeSingle();
  if (!department || !Number.isFinite(levelNum)) notFound();

  const [{ data: courses }, ctx] = await Promise.all([
    supabase
      .from("courses")
      .select("id, code, title, semester, credit_load")
      .eq("department_id", department.id)
      .eq("level", levelNum)
      .order("code"),
    getSessionContext(),
  ]);

  const canManage = Boolean(ctx?.isRep || ctx?.isAdmin);
  const semesters: SemesterType[] = ["first", "second"];

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Browse", href: "/browse" },
          { label: department.name, href: `/browse/${department.code}` },
          { label: `${levelNum} Level` },
        ]}
      />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {department.code} {levelNum} Level
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Select a course.</p>
        </div>
        {canManage && (
          <Link
            href="/rep/courses"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 shadow-sm hover:bg-zinc-50"
          >
            <BookPlus className="h-4 w-4" />
            Add course
          </Link>
        )}
      </div>

      {courses && courses.length > 0 ? (
        <div className="space-y-8">
          {semesters.map((sem) => {
            const list = courses.filter((c) => c.semester === sem);
            if (list.length === 0) return null;
            return (
              <section key={sem}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {SEMESTER_LABEL[sem]}
                </h2>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {list.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/courses/${c.id}`}
                        className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-green-300 hover:bg-green-50/40"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 group-hover:bg-green-100 group-hover:text-green-700">
                          <BookOpen className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-zinc-900">
                            {c.code}
                          </span>
                          <span className="block truncate text-xs text-zinc-500">
                            {c.title}
                            {c.credit_load ? ` · ${c.credit_load} units` : ""}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            No courses at this level yet.
          </p>
          {canManage && (
            <Link
              href="/rep/courses"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800"
            >
              <BookPlus className="h-4 w-4" />
              Add the first course
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
