import { redirect } from "next/navigation";

// The proxy routes "/" to /browse or /login based on auth. This is a fallback
// for when the proxy is bypassed (e.g. Supabase env not yet configured).
export default function Home() {
  redirect("/browse");
}
