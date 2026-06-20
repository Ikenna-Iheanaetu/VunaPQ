import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default async function BrowsePage() {
  const supabase = await createClient();
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, code")
    .order("name");

  return (
    <div>
      <Breadcrumbs items={[{ label: "Browse" }]} />
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900">
        Departments
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        Pick a department to browse its past questions.
      </p>

      {departments && departments.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {departments.map((d) => (
            <li key={d.id}>
              <Link
                href={`/browse/${d.code}`}
                className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-green-300 hover:bg-green-50/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 group-hover:bg-green-100 group-hover:text-green-700">
                  <Building2 className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-zinc-900">
                    {d.name}
                  </span>
                  <span className="block text-xs text-zinc-500">{d.code}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          No departments yet.
        </p>
      )}
    </div>
  );
}
