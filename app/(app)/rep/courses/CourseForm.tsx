"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";
import { createCourse, type CourseFormState } from "./actions";

type Department = { id: string; name: string };

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      Add course
    </button>
  );
}

// Holds the controlled department/level state. Remounted (via `key`) on each
// successful submit, which clears every field without a setState-in-effect.
function CourseFields({
  departments,
  levelsByDept,
}: {
  departments: Department[];
  levelsByDept: Record<string, number[]>;
}) {
  const [departmentId, setDepartmentId] = useState(
    departments.length === 1 ? departments[0].id : "",
  );
  const [level, setLevel] = useState("");
  const levels = departmentId ? levelsByDept[departmentId] ?? [] : [];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Department
          </label>
          <select
            name="department_id"
            required
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setLevel("");
            }}
            className={inputClass}
          >
            <option value="" disabled>
              Select
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Level
          </label>
          <select
            name="level"
            required
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            disabled={!departmentId}
            className={`${inputClass} disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400`}
          >
            <option value="" disabled>
              {departmentId ? "Select" : "Pick a department"}
            </option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l} Level
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          Semester
        </label>
        <select name="semester" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select
          </option>
          <option value="first">First Semester</option>
          <option value="second">Second Semester</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr_auto]">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Course code
          </label>
          <input name="code" required placeholder="SEN402" className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Title
          </label>
          <input
            name="title"
            required
            placeholder="Advanced Web Dev"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Units
          </label>
          <input
            name="credit_load"
            type="number"
            min={0}
            max={12}
            placeholder="3"
            className={`${inputClass} sm:w-20`}
          />
        </div>
      </div>
    </>
  );
}

export default function CourseForm({
  departments,
  levelsByDept,
}: {
  departments: Department[];
  levelsByDept: Record<string, number[]>;
}) {
  const [state, formAction] = useActionState<CourseFormState, FormData>(
    createCourse,
    { error: null, nonce: 0 },
  );

  return (
    <form action={formAction} className="space-y-4">
      <CourseFields
        key={state.nonce}
        departments={departments}
        levelsByDept={levelsByDept}
      />

      <div className="flex items-center gap-3">
        <SubmitButton />
        {state.nonce > 0 && (
          <span className="text-sm text-green-700">Course added.</span>
        )}
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
