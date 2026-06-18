import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

// Next.js 16 renamed Middleware to Proxy: this file must be `proxy.ts` and
// export a function named `proxy` (plus `config`). It runs on every matched
// request to (a) refresh the Supabase auth session cookie and (b) gate routes.

const PUBLIC_PREFIXES = ['/login', '/auth'];

function isPublic(pathname: string) {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
}

export async function proxy(request: NextRequest) {
  // If Supabase env isn't configured yet, don't block rendering.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Redirect helper that preserves any refreshed auth cookies.
  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = '';
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Not signed in: allow public routes, push everything else to /login.
  if (!user) {
    return isPublic(pathname) ? response : redirectTo('/login');
  }

  // Signed in: enforce a completed profile before using the app.
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, matric_no, department_id, current_level')
    .eq('id', user.id)
    .maybeSingle();

  const profileComplete = Boolean(
    profile?.full_name &&
      profile?.matric_no &&
      profile?.department_id &&
      profile?.current_level,
  );

  if (!profileComplete) {
    return pathname === '/onboarding' ? response : redirectTo('/onboarding');
  }

  // Complete profile: keep users out of the auth/onboarding/landing pages.
  if (
    pathname === '/onboarding' ||
    pathname === '/login' ||
    pathname === '/'
  ) {
    return redirectTo('/browse');
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals, the API, and static asset files.
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
