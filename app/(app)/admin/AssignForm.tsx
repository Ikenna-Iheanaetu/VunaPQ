"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, UserPlus } from "lucide-react";
import { createAssignment, type AssignState } from "./actions";
import { levelsForCount } from "@/lib/levels";

type Person = {
  id: string;
  full_name: string;
  matric_no: string | null;
};
type Department = { id: string; name: string; num_levels: number };

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
        <UserPlus className="h-4 w-4" />
      )}
      Assign rep
    </button>
  );
}

export default function AssignForm({
  people,
  departments,
}: {
  people: Person[];
  departments: Department[];
}) {
  const [state, formAction] = useActionState<AssignState, FormData>(
    createAssignment,
    { error: null, ok: false },
  );
  const [departmentId, setDepartmentId] = useState("");
  const [level, setLevel] = useState("");

  const selectedDept = departments.find((d) => d.id === departmentId);
  const levels = selectedDept ? levelsForCount(selectedDept.num_levels) : [];

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          Person
        </label>
        <select name="user_id" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select a student
          </option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name || "(no name)"}
              {p.matric_no ? ` · ${p.matric_no}` : ""}
            </option>
          ))}
        </select>
      </div>

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
            disabled={!selectedDept}
            className={`${inputClass} disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400`}
          >
            <option value="" disabled>
              {selectedDept ? "Select" : "Pick a department"}
            </option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l} Level
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton />
        {state.ok && <span className="text-sm text-green-700">Rep assigned.</span>}
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
