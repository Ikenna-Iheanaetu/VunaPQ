import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Image as ImageIcon, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { ExamType } from "@/lib/database.types";

const EXAM_LABEL: Record<ExamType, string> = {
  exam: "Exam",
  test: "Test",
  quiz: "Quiz",
  assignment: "Assignment",
};

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, code, title, level, semester, credit_load, department_id")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) notFound();

  const [{ data: department }, { data: papers }, { data: sessions }] =
    await Promise.all([
      supabase
        .from("departments")
        .select("code, name")
        .eq("id", course.department_id)
        .maybeSingle(),
      supabase
        .from("papers")
        .select("id, title, exam_type, file_mime, session_id, created_at")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false }),
      supabase.from("sessions").select("id, label"),
    ]);

  const sessionLabel = new Map((sessions ?? []).map((s) => [s.id, s.label]));

  // Group papers by session, ordering groups by session label (newest first).
  type Paper = NonNullable<typeof papers>[number];
  const groups = new Map<string, Paper[]>();
  for (const p of papers ?? []) {
    const list = groups.get(p.session_id) ?? [];
    list.push(p);
    groups.set(p.session_id, list);
  }
  const orderedSessionIds = [...groups.keys()].sort((a, b) =>
    (sessionLabel.get(b) ?? "").localeCompare(sessionLabel.get(a) ?? ""),
  );

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Browse", href: "/browse" },
          ...(department
            ? [
                { label: department.name, href: `/browse/${department.code}` },
                {
                  label: `${course.level} Level`,
                  href: `/browse/${department.code}/${course.level}`,
                },
              ]
            : []),
          { label: course.code },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {course.code}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">{course.title}</p>
        <p className="mt-0.5 text-xs text-zinc-400">
          {course.level} Level · {course.semester === "first" ? "First" : "Second"}{" "}
          Semester
          {course.credit_load ? ` · ${course.credit_load} units` : ""}
        </p>
      </div>

      {orderedSessionIds.length > 0 ? (
        <div className="space-y-8">
          {orderedSessionIds.map((sid) => (
            <section key={sid}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {sessionLabel.get(sid) ?? "Unknown session"}
              </h2>
              <ul className="space-y-2">
                {(groups.get(sid) ?? []).map((p) => {
                  const isPdf = p.file_mime === "application/pdf";
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/papers/${p.id}`}
                        className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm transition-colors hover:border-green-300 hover:bg-green-50/40"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 group-hover:bg-green-100 group-hover:text-green-700">
                          {isPdf ? (
                            <FileText className="h-5 w-5" />
                          ) : (
                            <ImageIcon className="h-5 w-5" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-zinc-900">
                            {p.title || `${EXAM_LABEL[p.exam_type]} paper`}
                          </span>
                          <span className="block text-xs text-zinc-500">
                            {EXAM_LABEL[p.exam_type]}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          No papers uploaded for this course yet.
        </p>
      )}
    </div>
  );
}
