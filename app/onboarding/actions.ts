"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = { error: string | null };

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const full_name = String(formData.get("full_name") ?? "").trim();
  const matric_no = String(formData.get("matric_no") ?? "").trim();
  const department_id = String(formData.get("department_id") ?? "");
  const current_level = Number(formData.get("current_level"));

  if (!full_name || !matric_no || !department_id || !current_level) {
    return { error: "Please fill in all fields." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, matric_no, department_id, current_level })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "That matric number is already registered." };
    }
    return { error: error.message };
  }

  redirect("/browse");
}
