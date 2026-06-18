-- Private bucket for uploaded past-question files.
insert into storage.buckets (id, name, public)
values ('papers', 'papers', false)
on conflict (id) do nothing;

-- Storage policies on storage.objects, scoped to the 'papers' bucket.
-- V1 simplicity (per spec): read = any authenticated user; writes = any
-- authenticated user (the UI only exposes upload to reps/admins). The DB-level
-- `papers` insert RLS is the real guard on who can attach a file to a course.
-- Tighten these to rep/admin-only later if needed.

create policy "papers read"   on storage.objects for select to authenticated
  using (bucket_id = 'papers');

create policy "papers insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'papers');

create policy "papers update" on storage.objects for update to authenticated
  using (bucket_id = 'papers') with check (bucket_id = 'papers');

create policy "papers delete" on storage.objects for delete to authenticated
  using (bucket_id = 'papers');
