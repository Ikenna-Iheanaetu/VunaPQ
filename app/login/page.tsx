"use client";

import { useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: "email",
    });
    setLoading(false);
    if (error) setError(error.message);
    else window.location.assign("/browse");
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-white">
            <GraduationCap className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            VunaPQ
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Veritas University past questions
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {!sent ? (
            <form onSubmit={sendLink} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send sign-in link
              </button>
              <p className="text-center text-xs text-zinc-500">
                We&apos;ll email you a magic link to sign in. No password needed.
              </p>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-4">
              <div className="rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-800">
                Check <span className="font-medium">{email}</span> for a sign-in
                link. Click it to continue.
              </div>
              <div>
                <label
                  htmlFor="otp"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Or enter the 6-digit code
                </label>
                <input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-center text-lg tracking-[0.3em] outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.trim().length < 6}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify code
              </button>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setOtp("");
                  setError(null);
                }}
                className="w-full text-center text-xs text-zinc-500 hover:text-zinc-700"
              >
                Use a different email
              </button>
            </form>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
