import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/database.types";

export type SessionContext = {
  userId: string;
  email: string | undefined;
  profile: {
    full_name: string;
    role: UserRole;
    department_id: string | null;
    current_level: number | null;
    matric_no: string | null;
  };
  isAdmin: boolean;
  isRep: boolean;
};

/**
 * Loads the signed-in user plus their profile and derived role flags.
 * Returns null if not signed in or the profile row is missing.
 * Routes are already gated by the proxy; this is for rendering decisions.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, department_id, current_level, matric_no")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  const isAdmin =
    profile.role === "department_admin" || profile.role === "super_admin";

  const { count } = await supabase
    .from("rep_assignments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "active");

  return {
    userId: user.id,
    email: user.email,
    profile,
    isAdmin,
    isRep: (count ?? 0) > 0,
  };
}
