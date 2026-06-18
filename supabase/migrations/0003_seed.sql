-- Catalog seed. Courses are intentionally NOT seeded — reps/admins create them
-- via the app UI (code, title, level, semester, credit load).

insert into schools (id, name) values
  ('00000000-0000-0000-0000-000000000001','Veritas University, Abuja')
on conflict (id) do nothing;

insert into departments (id, school_id, name, code) values
  ('00000000-0000-0000-0000-0000000000a1',
   '00000000-0000-0000-0000-000000000001','Software Engineering','SEN')
on conflict (id) do nothing;

insert into sessions (id, label) values
  ('00000000-0000-0000-0000-0000000000b1','2024/2025'),
  ('00000000-0000-0000-0000-0000000000b2','2023/2024')
on conflict (id) do nothing;

-- After your first signup, promote yourself to super_admin:
--   update profiles
--   set role='super_admin',
--       department_id='00000000-0000-0000-0000-0000000000a1',
--       current_level=400
--   where id='<your-auth-uid>';
