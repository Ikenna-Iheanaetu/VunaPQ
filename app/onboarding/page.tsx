import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: departments }, { data: profile }] = await Promise.all([
    supabase.from("departments").select("id, name, num_levels").order("name"),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Finish setting up
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Tell us who you are so we can show the right courses.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <OnboardingForm
            departments={departments ?? []}
            defaultName={profile?.full_name ?? ""}
          />
        </div>
      </div>
    </main>
  );
}
