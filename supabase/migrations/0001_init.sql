-- ===== enums =====
create type user_role         as enum ('student','course_rep','department_admin','super_admin');
create type exam_type         as enum ('exam','test','quiz','assignment');
create type semester_type     as enum ('first','second');
create type solution_source   as enum ('ai','human');
create type assignment_status as enum ('active','pending','revoked');
create type transfer_status   as enum ('pending','approved','rejected');

-- ===== schools / departments / courses / sessions =====
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table departments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  name text not null,        -- 'Software Engineering'
  code text not null,        -- 'SEN'
  num_levels int not null default 4 check (num_levels between 1 and 6), -- years: SEN = 4 (100-400)
  created_at timestamptz default now(),
  unique (school_id, code)
);

create table sessions (              -- academic years
  id uuid primary key default gen_random_uuid(),
  label text not null unique         -- '2024/2025'
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments(id) on delete cascade,
  level int not null check (level in (100,200,300,400,500,600)),
  semester semester_type not null,
  code text not null,                -- 'SEN402'
  title text not null,               -- 'Advanced Web (Spring Boot/JPA)'
  credit_load int check (credit_load between 0 and 12),  -- units, set by rep/admin
  created_at timestamptz default now(),
  unique (department_id, code, semester)
);

-- ===== profiles (1:1 with auth.users) =====
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text default '',
  matric_no text unique,
  department_id uuid references departments(id),
  current_level int check (current_level in (100,200,300,400,500,600)),
  role user_role not null default 'student',
  created_at timestamptz default now()
);

-- ===== papers / questions / solutions =====
create table papers (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  session_id uuid not null references sessions(id),
  exam_type exam_type not null default 'exam',
  file_path text not null,           -- storage path in 'papers' bucket
  file_mime text,                    -- 'application/pdf' | 'image/jpeg' ...
  title text,                        -- optional human label
  uploaded_by uuid references profiles(id),
  status text not null default 'published',  -- 'published' | 'pending'
  created_at timestamptz default now()
);

create table questions (             -- [LATER] populated by AI parsing
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references papers(id) on delete cascade,
  number text,
  body_text text,
  marks int
);

create table solutions (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid references papers(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade, -- nullable; v1 = paper-level
  content text not null,             -- markdown
  source solution_source not null default 'ai',
  model text,                        -- 'claude-sonnet-4-6'
  verified boolean not null default false,
  verified_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ===== rep role + handoff =====
create table rep_assignments (       -- THIS is "the level account"
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  department_id uuid not null references departments(id) on delete cascade,
  level int not null check (level in (100,200,300,400,500,600)),
  session_id uuid references sessions(id),
  status assignment_status not null default 'active',
  assigned_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table rep_transfers (         -- [LATER] the yearly handoff
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments(id) on delete cascade,
  level int not null,
  from_user uuid references profiles(id),
  to_user uuid references profiles(id),
  status transfer_status not null default 'pending',
  initiated_by uuid references profiles(id),
  approved_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- helpful indexes for the browse hierarchy
create index courses_department_level_idx on courses (department_id, level);
create index papers_course_idx            on papers (course_id);
create index solutions_paper_idx          on solutions (paper_id);
create index rep_assignments_user_idx     on rep_assignments (user_id);
create index rep_assignments_dept_level_idx on rep_assignments (department_id, level, status);

-- ===== auto-create profile on signup =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
