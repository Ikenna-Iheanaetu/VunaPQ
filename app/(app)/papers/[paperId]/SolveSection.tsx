"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Loader2, BadgeCheck, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type SolutionView = {
  id: string;
  content: string;
  source: "ai" | "human";
  model: string | null;
  verified: boolean;
};

export function SolveSection({
  paperId,
  initialSolution,
  canVerify,
}: {
  paperId: string;
  initialSolution: SolutionView | null;
  canVerify: boolean;
}) {
  const [solution, setSolution] = useState<SolutionView | null>(initialSolution);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function solve() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paperId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not generate a solution.");
        return;
      }
      setSolution(json.solution as SolutionView);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function markVerified() {
    if (!solution) return;
    setVerifying(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("solutions")
      .update({ verified: true })
      .eq("id", solution.id);
    setVerifying(false);
    if (!error) setSolution({ ...solution, verified: true });
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-900">Solution</h2>
        {solution && solution.source === "ai" && (
          <span
            className={
              solution.verified
                ? "inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                : "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"
            }
          >
            {solution.verified ? (
              <>
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </>
            ) : (
              <>
                <TriangleAlert className="h-3.5 w-3.5" /> AI · unverified
              </>
            )}
          </span>
        )}
      </div>

      {solution ? (
        <>
          <div className="prose prose-sm max-w-none rounded-xl border border-zinc-200 bg-white p-5 shadow-sm prose-headings:font-semibold prose-pre:bg-zinc-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {solution.content}
            </ReactMarkdown>
          </div>
          {!solution.verified && (
            <p className="mt-3 text-xs text-zinc-500">
              AI-generated solutions can be subtly wrong. Treat them as a study
              aid, not gospel.
              {canVerify && " A course rep can verify this once checked."}
            </p>
          )}
          {canVerify && !solution.verified && (
            <button
              onClick={markVerified}
              disabled={verifying}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-60"
            >
              {verifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BadgeCheck className="h-4 w-4" />
              )}
              Mark as verified
            </button>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center">
          <p className="mb-4 text-sm text-zinc-500">
            No solution yet. Generate a worked solution with AI.
          </p>
          <button
            onClick={solve}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Solving…" : "Solve with AI"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
