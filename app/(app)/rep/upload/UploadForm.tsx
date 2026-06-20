"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Upload } from "lucide-react";
import { uploadPaper, type UploadState } from "./actions";

type CourseOption = {
  id: string;
  code: string;
  title: string;
  level: number;
};
type SessionOption = { id: string; label: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Upload className="h-4 w-4" />
      )}
      {pending ? "Uploading…" : "Upload paper"}
    </button>
  );
}

export default function UploadForm({
  courses,
  sessions,
}: {
  courses: CourseOption[];
  sessions: SessionOption[];
}) {
  const [state, formAction] = useActionState<UploadState, FormData>(
    uploadPaper,
    { error: null },
  );

  const inputClass =
    "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          Course
        </label>
        <select name="course_id" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select course
          </option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.title} ({c.level}L)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Session
          </label>
          <select name="session_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select session
            </option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Type
          </label>
          <select name="exam_type" defaultValue="exam" className={inputClass}>
            <option value="exam">Exam</option>
            <option value="test">Test</option>
            <option value="quiz">Quiz</option>
            <option value="assignment">Assignment</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          Label <span className="text-zinc-400">(optional)</span>
        </label>
        <input
          name="title"
          placeholder="e.g. Final exam, 2024/2025"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          File
        </label>
        <input
          name="file"
          type="file"
          required
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-green-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-green-700 hover:file:bg-green-100"
        />
        <p className="mt-1.5 text-xs text-zinc-400">
          PDF or image, up to 15MB.
        </p>
      </div>

      <SubmitButton />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
