import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, Upload, BookPlus, Shield } from "lucide-react";
import { getSessionContext } from "@/lib/auth";
import { signOut } from "./actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");

  const showRepLinks = ctx.isRep || ctx.isAdmin;

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/browse" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-base font-semibold tracking-tight text-zinc-900">
              VunaPQ
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            {showRepLinks && (
              <>
                <Link
                  href="/rep/courses"
                  className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 sm:flex"
                >
                  <BookPlus className="h-4 w-4" />
                  Courses
                </Link>
                <Link
                  href="/rep/upload"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-zinc-600 hover:bg-zinc-100"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Link>
              </>
            )}
            {ctx.isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-zinc-600 hover:bg-zinc-100"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="ml-1 rounded-lg px-3 py-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
