-- ===== helpers =====
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('department_admin','super_admin')
  );
$$;

create or replace function public.is_active_rep(dep uuid, lvl int)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from rep_assignments
    where user_id = auth.uid() and department_id = dep
      and level = lvl and status = 'active'
  );
$$;

create or replace function public.is_super_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'super_admin'
  );
$$;

-- ===== enable RLS =====
alter table schools          enable row level security;
alter table departments      enable row level security;
alter table sessions         enable row level security;
alter table courses          enable row level security;
alter table profiles         enable row level security;
alter table papers           enable row level security;
alter table questions        enable row level security;
alter table solutions        enable row level security;
alter table rep_assignments  enable row level security;
alter table rep_transfers    enable row level security;

-- ===== catalog: any authenticated user can read =====
create policy read_schools     on schools     for select to authenticated using (true);
create policy read_departments on departments for select to authenticated using (true);
create policy read_sessions    on sessions    for select to authenticated using (true);
create policy read_courses     on courses     for select to authenticated using (true);

-- departments are managed by super admins (name, code, number of levels)
create policy write_departments_ins on departments for insert to authenticated
  with check (is_super_admin());
create policy write_departments_upd on departments for update to authenticated
  using (is_super_admin()) with check (is_super_admin());
create policy write_departments_del on departments for delete to authenticated
  using (is_super_admin());

-- courses are user-managed: reps (for their dept+level) and admins create/edit them
create policy write_courses_ins on courses for insert to authenticated
with check (is_admin() or is_active_rep(department_id, level));

create policy write_courses_upd on courses for update to authenticated
using (is_admin() or is_active_rep(department_id, level))
with check (is_admin() or is_active_rep(department_id, level));

create policy write_courses_del on courses for delete to authenticated
using (is_admin() or is_active_rep(department_id, level));

-- ===== profiles: read all (names aren't secret), update only your own =====
create policy read_profiles   on profiles for select to authenticated using (true);
create policy update_own_prof on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ===== papers: read all; write by active rep for the course's dept+level, or admin =====
create policy read_papers on papers for select to authenticated using (true);

create policy write_papers_ins on papers for insert to authenticated
with check (
  is_admin() or exists (
    select 1 from courses c
    where c.id = course_id and is_active_rep(c.department_id, c.level)
  )
);

create policy write_papers_upd on papers for update to authenticated
using (
  is_admin() or exists (
    select 1 from courses c
    where c.id = course_id and is_active_rep(c.department_id, c.level)
  )
);

create policy write_papers_del on papers for delete to authenticated
using (
  is_admin() or exists (
    select 1 from courses c
    where c.id = course_id and is_active_rep(c.department_id, c.level)
  )
);

-- ===== questions & solutions: read all; writes via service-role (solve route bypasses RLS) =====
create policy read_questions on questions for select to authenticated using (true);
create policy read_solutions on solutions for select to authenticated using (true);

-- reps/admins can mark a solution verified
create policy verify_solutions on solutions for update to authenticated
using (
  is_admin() or exists (
    select 1 from papers p join courses c on c.id = p.course_id
    where p.id = paper_id and is_active_rep(c.department_id, c.level)
  )
)
with check (
  is_admin() or exists (
    select 1 from papers p join courses c on c.id = p.course_id
    where p.id = paper_id and is_active_rep(c.department_id, c.level)
  )
);

-- ===== rep_assignments: read all; only admins write =====
create policy read_assignments  on rep_assignments for select to authenticated using (true);
create policy write_assignments on rep_assignments for all to authenticated
  using (is_admin()) with check (is_admin());

-- ===== rep_transfers [LATER]: read own/admin; only admins write =====
create policy read_transfers  on rep_transfers for select to authenticated
  using (is_admin() or from_user = auth.uid() or to_user = auth.uid());
create policy write_transfers on rep_transfers for all to authenticated
  using (is_admin()) with check (is_admin());
