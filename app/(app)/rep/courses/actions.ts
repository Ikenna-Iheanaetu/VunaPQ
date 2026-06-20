"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CourseFormState = { error: string | null; nonce: number };

export async function createCourse(
  _prev: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const department_id = String(formData.get("department_id") ?? "");
  const level = Number(formData.get("level"));
  const semester = String(formData.get("semester") ?? "");
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const title = String(formData.get("title") ?? "").trim();
  const creditRaw = String(formData.get("credit_load") ?? "").trim();
  const credit_load = creditRaw ? Number(creditRaw) : null;

  if (!department_id || !level || !semester || !code || !title) {
    return { error: "Please fill in all required fields.", nonce: 0 };
  }
  if (semester !== "first" && semester !== "second") {
    return { error: "Invalid semester.", nonce: 0 };
  }

  const { error } = await supabase
    .from("courses")
    .insert({ department_id, level, semester, code, title, credit_load });

  if (error) {
    if (error.code === "23505") {
      return {
        error: "A course with that code already exists for this semester.",
        nonce: 0,
      };
    }
    if (error.code === "42501") {
      return {
        error: "You can only add courses for a department/level you rep.",
        nonce: 0,
      };
    }
    return { error: error.message, nonce: 0 };
  }

  revalidatePath("/rep/courses");
  // A fresh nonce remounts the form fields (clearing them) on each success.
  return { error: null, nonce: Date.now() };
}
