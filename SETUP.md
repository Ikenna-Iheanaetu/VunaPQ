# VunaPQ — Setup

## 1. Create the Supabase project
1. Go to https://supabase.com → New project. Pick a region close to Nigeria (e.g. `eu-west`).
2. Project Settings → **API**: copy the **Project URL**, **anon public** key, and **service_role** key.
3. Authentication → Providers → **Email**: ensure it's enabled (magic link / OTP).

## 2. Configure env
Copy `.env.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...        # Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # anon public key
SUPABASE_SERVICE_ROLE_KEY=...       # service_role key (server only)
ANTHROPIC_API_KEY=...               # console.anthropic.com
```

## 3. Run migrations
Apply the files in `supabase/migrations/` **in order** (0001 → 0004).

**Option A — Supabase SQL Editor (simplest):** open each file, paste its contents, Run.

**Option B — Supabase CLI:**
```bash
pnpm dlx supabase link --project-ref <your-ref>
pnpm dlx supabase db push
```

## 4. Make yourself an admin
1. Start the app (`pnpm dev`), sign up at `/login` with your email, complete onboarding.
2. In the SQL Editor, find your id: `select id, full_name from profiles;`
3. Promote:
   ```sql
   update profiles
   set role='super_admin',
       department_id='00000000-0000-0000-0000-0000000000a1',
       current_level=400
   where id='<your-auth-uid>';
   ```

## 5. Regenerate typed schema (optional but recommended)
```bash
pnpm dlx supabase gen types typescript --project-id <your-ref> > lib/database.types.ts
```

## 6. Run
```bash
pnpm install
pnpm dev
```
