import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/auth";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import AssignForm from "./AssignForm";
import DepartmentForm from "./DepartmentForm";
import { revokeAssignment } from "./actions";

export default async function AdminPage() {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  if (!ctx.isAdmin) redirect("/browse");

  const isSuperAdmin = ctx.profile.role === "super_admin";
  const supabase = await createClient();

  const [{ data: people }, { data: departments }, { data: assignments }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, matric_no")
        .order("full_name"),
      supabase
        .from("departments")
        .select("id, name, code, num_levels")
        .order("name"),
      supabase
        .from("rep_assignments")
        .select("id, user_id, department_id, level")
        .eq("status", "active")
        .order("created_at", { ascending: false }),
    ]);

  const personName = new Map(
    (people ?? []).map((p) => [p.id, p.full_name || p.matric_no || "(unknown)"]),
  );
  const deptCode = new Map((departments ?? []).map((d) => [d.id, d.code]));

  return (
    <div>
      <Breadcrumbs items={[{ label: "Admin" }]} />
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900">
        Admin
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        Assign course reps and manage departments.
      </p>

      {isSuperAdmin && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Departments
          </h2>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <DepartmentForm />
          </div>
          {departments && departments.length > 0 && (
            <ul className="mt-4 divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              {departments.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-zinc-900">
                    {d.name}{" "}
                    <span className="font-normal text-zinc-500">({d.code})</span>
                  </span>
                  <span className="text-xs text-zinc-400">
                    {d.num_levels} {d.num_levels === 1 ? "year" : "years"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Course reps
        </h2>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <AssignForm people={people ?? []} departments={departments ?? []} />
        </div>

        <h3 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Active reps
        </h3>
        {assignments && assignments.length > 0 ? (
          <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            {assignments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <span className="font-medium text-zinc-900">
                    {personName.get(a.user_id)}
                  </span>
                  <span className="ml-2 text-xs text-zinc-500">
                    {deptCode.get(a.department_id)} · {a.level} Level
                  </span>
                </div>
                <form action={revokeAssignment}>
                  <input type="hidden" name="id" value={a.id} />
                  <button
                    type="submit"
                    className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Revoke
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
            No active reps yet.
          </p>
        )}
      </section>
    </div>
  );
}
