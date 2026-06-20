"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AssignState = { error: string | null; ok: boolean };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin =
    profile?.role === "department_admin" || profile?.role === "super_admin";
  if (!isAdmin) redirect("/browse");
  return { supabase, userId: user.id };
}

export async function createAssignment(
  _prev: AssignState,
  formData: FormData,
): Promise<AssignState> {
  const { supabase, userId } = await requireAdmin();

  const user_id = String(formData.get("user_id") ?? "");
  const department_id = String(formData.get("department_id") ?? "");
  const level = Number(formData.get("level"));

  if (!user_id || !department_id || !level) {
    return { error: "Pick a person, department and level.", ok: false };
  }

  const { error } = await supabase.from("rep_assignments").insert({
    user_id,
    department_id,
    level,
    status: "active",
    assigned_by: userId,
  });

  if (error) {
    if (error.code === "42501") {
      return { error: "Not permitted.", ok: false };
    }
    return { error: error.message, ok: false };
  }

  revalidatePath("/admin");
  return { error: null, ok: true };
}

export async function revokeAssignment(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase
    .from("rep_assignments")
    .update({ status: "revoked" })
    .eq("id", id);
  revalidatePath("/admin");
}

export type DepartmentState = { error: string | null; ok: boolean };

const SCHOOL_ID = "00000000-0000-0000-0000-000000000001"; // Veritas University, Abuja

export async function createDepartment(
  _prev: DepartmentState,
  formData: FormData,
): Promise<DepartmentState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const num_levels = Number(formData.get("num_levels"));

  if (!name || !code) {
    return { error: "Enter a department name and code.", ok: false };
  }
  if (!Number.isInteger(num_levels) || num_levels < 1 || num_levels > 6) {
    return { error: "Number of levels must be between 1 and 6.", ok: false };
  }

  const { error } = await supabase
    .from("departments")
    .insert({ school_id: SCHOOL_ID, name, code, num_levels });

  if (error) {
    if (error.code === "23505") {
      return { error: "A department with that code already exists.", ok: false };
    }
    if (error.code === "42501") {
      return { error: "Only a super admin can add departments.", ok: false };
    }
    return { error: error.message, ok: false };
  }

  revalidatePath("/admin");
  return { error: null, ok: true };
}
