import Link from "next/link";
import { redirect } from "next/navigation";
import { BookPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/auth";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import UploadForm from "./UploadForm";

export default async function UploadPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.isRep && !ctx.isAdmin) redirect("/browse");

  const supabase = await createClient();

  // Courses the user may upload for.
  let courses: { id: string; code: string; title: string; level: number }[] = [];
  if (ctx.isAdmin) {
    const { data } = await supabase
      .from("courses")
      .select("id, code, title, level")
      .order("code");
    courses = data ?? [];
  } else {
    const { data: assignments } = await supabase
      .from("rep_assignments")
      .select("department_id, level")
      .eq("user_id", ctx.userId)
      .eq("status", "active");
    const pairs = new Set(
      (assignments ?? []).map((a) => `${a.department_id}:${a.level}`),
    );
    const deptIds = [...new Set((assignments ?? []).map((a) => a.department_id))];
    if (deptIds.length) {
      const { data } = await supabase
        .from("courses")
        .select("id, code, title, level, department_id")
        .in("department_id", deptIds)
        .order("code");
      courses = (data ?? [])
        .filter((c) => pairs.has(`${c.department_id}:${c.level}`))
        .map(({ id, code, title, level }) => ({ id, code, title, level }));
    }
  }

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, label")
    .order("label", { ascending: false });

  return (
    <div>
      <Breadcrumbs items={[{ label: "Upload paper" }]} />
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900">
        Upload a paper
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        Add a past question for students to study.
      </p>

      {courses.length > 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <UploadForm courses={courses} sessions={sessions ?? []} />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="text-sm text-zinc-500">
            No courses available to upload for yet.
          </p>
          <Link
            href="/rep/courses"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800"
          >
            <BookPlus className="h-4 w-4" />
            Add a course first
          </Link>
        </div>
      )}
    </div>
  );
}
