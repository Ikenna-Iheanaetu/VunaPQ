"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";
import { createDepartment, type DepartmentState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      Add department
    </button>
  );
}

export default function DepartmentForm() {
  const [state, formAction] = useActionState<DepartmentState, FormData>(
    createDepartment,
    { error: null, ok: false },
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_auto]">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Name
          </label>
          <input
            name="name"
            required
            placeholder="Computer Science"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Code
          </label>
          <input name="code" required placeholder="CSC" className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Years
          </label>
          <input
            name="num_levels"
            type="number"
            min={1}
            max={6}
            defaultValue={4}
            required
            className={`${inputClass} sm:w-20`}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton />
        {state.ok && (
          <span className="text-sm text-green-700">Department added.</span>
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
