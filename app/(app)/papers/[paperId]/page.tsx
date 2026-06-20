import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/auth";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SolveSection, type SolutionView } from "./SolveSection";
import type { ExamType } from "@/lib/database.types";

const EXAM_LABEL: Record<ExamType, string> = {
  exam: "Exam",
  test: "Test",
  quiz: "Quiz",
  assignment: "Assignment",
};

export default async function PaperPage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const { paperId } = await params;
  const supabase = await createClient();

  const { data: paper } = await supabase
    .from("papers")
    .select("id, course_id, session_id, exam_type, file_path, file_mime, title")
    .eq("id", paperId)
    .maybeSingle();
  if (!paper) notFound();

  const [{ data: course }, { data: session }, signed, { data: solution }, ctx] =
    await Promise.all([
      supabase
        .from("courses")
        .select("id, code, title, level, department_id")
        .eq("id", paper.course_id)
        .maybeSingle(),
      supabase
        .from("sessions")
        .select("label")
        .eq("id", paper.session_id)
        .maybeSingle(),
      supabase.storage.from("papers").createSignedUrl(paper.file_path, 3600),
      supabase
        .from("solutions")
        .select("id, content, source, model, verified")
        .eq("paper_id", paperId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      getSessionContext(),
    ]);

  const { data: department } = course
    ? await supabase
        .from("departments")
        .select("code, name")
        .eq("id", course.department_id)
        .maybeSingle()
    : { data: null };

  const signedUrl = signed.data?.signedUrl;
  const isPdf = paper.file_mime === "application/pdf";
  const canVerify = Boolean(ctx?.isRep || ctx?.isAdmin);
  const heading =
    paper.title ||
    `${course?.code ?? "Paper"}${session ? ` · ${session.label}` : ""}`;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Browse", href: "/browse" },
          ...(department && course
            ? [
                { label: department.name, href: `/browse/${department.code}` },
                {
                  label: `${course.level} Level`,
                  href: `/browse/${department.code}/${course.level}`,
                },
                { label: course.code, href: `/courses/${course.id}` },
              ]
            : []),
          { label: EXAM_LABEL[paper.exam_type] },
        ]}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            {heading}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {EXAM_LABEL[paper.exam_type]}
            {session ? ` · ${session.label}` : ""}
            {course ? ` · ${course.title}` : ""}
          </p>
        </div>
        {signedUrl && (
          <a
            href={signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600 shadow-sm hover:bg-zinc-50"
          >
            <Download className="h-4 w-4" />
            Open file
          </a>
        )}
      </div>

      {signedUrl ? (
        isPdf ? (
          <iframe
            src={signedUrl}
            title={heading}
            className="h-[75vh] w-full rounded-xl border border-zinc-200 bg-white"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signedUrl}
            alt={heading}
            className="w-full rounded-xl border border-zinc-200 bg-white"
          />
        )
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          Could not load the file.
        </p>
      )}

      <SolveSection
        paperId={paper.id}
        initialSolution={(solution as SolutionView | null) ?? null}
        canVerify={canVerify}
      />
    </div>
  );
}
