import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/auth";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { levelsForCount } from "@/lib/levels";
import CourseForm from "./CourseForm";

export default async function RepCoursesPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.isRep && !ctx.isAdmin) redirect("/browse");

  const supabase = await createClient();

  let departments: { id: string; name: string; code: string }[] = [];
  const levelsByDept: Record<string, number[]> = {};

  if (ctx.isAdmin) {
    const { data } = await supabase
      .from("departments")
      .select("id, name, code, num_levels")
      .order("name");
    departments = (data ?? []).map(({ id, name, code }) => ({ id, name, code }));
    for (const d of data ?? []) levelsByDept[d.id] = levelsForCount(d.num_levels);
  } else {
    const { data: assignments } = await supabase
      .from("rep_assignments")
      .select("department_id, level")
      .eq("user_id", ctx.userId)
      .eq("status", "active");
    const deptIds = [...new Set((assignments ?? []).map((a) => a.department_id))];
    if (deptIds.length) {
      const { data } = await supabase
        .from("departments")
        .select("id, name, code")
        .in("id", deptIds)
        .order("name");
      departments = data ?? [];
    }
    // A rep may only manage the exact levels they're assigned, per department.
    for (const a of assignments ?? []) {
      const list = levelsByDept[a.department_id] ?? [];
      if (!list.includes(a.level)) list.push(a.level);
      list.sort((x, y) => x - y);
      levelsByDept[a.department_id] = list;
    }
  }

  const deptIds = departments.map((d) => d.id);
  const { data: courses } = deptIds.length
    ? await supabase
        .from("courses")
        .select("id, code, title, level, semester, credit_load, department_id")
        .in("department_id", deptIds)
        .order("level")
        .order("code")
    : { data: [] };

  const deptCode = new Map(departments.map((d) => [d.id, d.code]));

  return (
    <div>
      <Breadcrumbs items={[{ label: "Manage courses" }]} />
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900">
        Manage courses
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        Add the courses students should see for your department and level.
      </p>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <CourseForm departments={departments} levelsByDept={levelsByDept} />
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Existing courses
      </h2>
      {courses && courses.length > 0 ? (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {courses.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <span className="font-medium text-zinc-900">{c.code}</span>{" "}
                <span className="text-zinc-500">{c.title}</span>
              </div>
              <span className="shrink-0 text-xs text-zinc-400">
                {deptCode.get(c.department_id)} · {c.level}L ·{" "}
                {c.semester === "first" ? "1st" : "2nd"}
                {c.credit_load ? ` · ${c.credit_load}u` : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
          No courses yet.
        </p>
      )}
    </div>
  );
}
