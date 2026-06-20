"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ExamType } from "@/lib/database.types";

export type UploadState = { error: string | null };

const ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const EXAM_TYPES: ExamType[] = ["exam", "test", "quiz", "assignment"];
const MAX_BYTES = 15 * 1024 * 1024;

export async function uploadPaper(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const course_id = String(formData.get("course_id") ?? "");
  const session_id = String(formData.get("session_id") ?? "");
  const exam_type = String(formData.get("exam_type") ?? "exam");
  const title = String(formData.get("title") ?? "").trim() || null;
  const file = formData.get("file");

  if (!course_id || !session_id) {
    return { error: "Pick a course and a session." };
  }
  if (!EXAM_TYPES.includes(exam_type as ExamType)) {
    return { error: "Invalid paper type." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return { error: "Upload a PDF or image (JPG, PNG, WebP)." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "File is too large (max 15MB)." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${course_id}/${session_id}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("papers")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) {
    return { error: `Upload failed: ${upErr.message}` };
  }

  const { error: insErr } = await supabase.from("papers").insert({
    course_id,
    session_id,
    exam_type: exam_type as ExamType,
    file_path: path,
    file_mime: file.type,
    title,
    uploaded_by: user.id,
  });

  if (insErr) {
    // Roll back the orphaned file so storage doesn't drift from the table.
    await supabase.storage.from("papers").remove([path]);
    if (insErr.code === "42501") {
      return { error: "You can only upload for a course you rep." };
    }
    return { error: insErr.message };
  }

  redirect(`/courses/${course_id}`);
}
