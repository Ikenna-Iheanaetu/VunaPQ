"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { completeOnboarding, type OnboardingState } from "./actions";
import { levelsForCount } from "@/lib/levels";

type Department = { id: string; name: string; num_levels: number };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Continue
    </button>
  );
}

export default function OnboardingForm({
  departments,
  defaultName,
}: {
  departments: Department[];
  defaultName: string;
}) {
  const [state, formAction] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    { error: null },
  );
  const [departmentId, setDepartmentId] = useState("");
  const [level, setLevel] = useState("");

  const selectedDept = departments.find((d) => d.id === departmentId);
  const levels = selectedDept ? levelsForCount(selectedDept.num_levels) : [];

  const fieldClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          defaultValue={defaultName}
          placeholder="Jane Doe"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="matric_no" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Matric number
        </label>
        <input
          id="matric_no"
          name="matric_no"
          required
          placeholder="VUG/SEN/22/1234"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="department_id" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Department
        </label>
        <select
          id="department_id"
          name="department_id"
          required
          value={departmentId}
          onChange={(e) => {
            setDepartmentId(e.target.value);
            setLevel("");
          }}
          className={fieldClass}
        >
          <option value="" disabled>
            Select your department
          </option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="current_level" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Current level
        </label>
        <select
          id="current_level"
          name="current_level"
          required
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          disabled={!selectedDept}
          className={`${fieldClass} disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400`}
        >
          <option value="" disabled>
            {selectedDept ? "Select your level" : "Pick a department first"}
          </option>
          {levels.map((l) => (
            <option key={l} value={l}>
              {l} Level
            </option>
          ))}
        </select>
      </div>

      <SubmitButton />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
    </form>
  );
}
