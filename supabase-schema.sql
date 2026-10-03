-- GROUPDOCS - SIMPLE ACCOUNT SCHEMA (NO SUPABASE AUTH / NO EMAIL CONFIRMATION)
-- Run this entire file ONCE in Supabase SQL Editor.
-- IMPORTANT: This is suitable for a classroom/demo app. For a production app, use Supabase Auth.

create extension if not exists pgcrypto;

-- Remove old demo tables/functions so the schema no longer depends on auth.users.
drop trigger if exists on_group_created on public.groups;
drop function if exists public.join_group_by_code(text);
drop function if exists public.join_group_by_code(text, uuid);
drop function if exists public.add_group_owner();
drop table if exists public.documents cascade;
drop table if exists public.group_members cascade;
drop table if exists public.groups cascade;
drop table if exists public.profiles cascade;

create table public.app_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  initials text not null default '',
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  code text not null unique,
  owner_id uuid not null references public.app_users(id) on delete cascade,
  color text not null default '#8B5CF6',
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  role text not null check (role in ('Trưởng nhóm', 'Thành viên')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  uri text not null,
  size bigint,
  type text not null,
  mime_type text,
  group_id uuid not null references public.groups(id) on delete cascade,
  uploader_id uuid not null references public.app_users(id),
  uploader_name text not null,
  shared_by_id uuid references public.app_users(id),
  shared_by_name text,
  upload_date timestamptz not null default now()
);

create or replace function public.register_app_user(p_full_name text, p_email text, p_password text, p_initials text default '')
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare new_id uuid;
begin
  if length(trim(p_full_name)) = 0 then raise exception 'Vui lòng nhập họ và tên.'; end if;
  if length(trim(p_email)) = 0 then raise exception 'Vui lòng nhập email.'; end if;
  if length(p_password) < 6 then raise exception 'Mật khẩu cần ít nhất 6 ký tự.'; end if;
  if exists (select 1 from public.app_users where lower(email) = lower(trim(p_email))) then
    raise exception 'Email này đã được đăng ký.';
  end if;
  insert into public.app_users(full_name, email, password_hash, initials)
  values (trim(p_full_name), lower(trim(p_email)), crypt(p_password, gen_salt('bf')), p_initials)
  returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.login_app_user(p_email text, p_password text)
returns table(id uuid, full_name text, email text, initials text)
language sql
security definer
set search_path = public, extensions
as $$
  select u.id, u.full_name, u.email, u.initials
  from public.app_users u
  where lower(u.email) = lower(trim(p_email))
    and u.password_hash = crypt(p_password, u.password_hash)
  limit 1;
$$;

create or replace function public.add_group_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.group_members(group_id, user_id, role)
  values (new.id, new.owner_id, 'Trưởng nhóm');
  return new;
end;
$$;

create trigger on_group_created
after insert on public.groups
for each row execute procedure public.add_group_owner();

create or replace function public.join_group_by_code(p_code text, p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare found_group uuid;
begin
  if not exists (select 1 from public.app_users where id = p_user_id) then
    raise exception 'Tài khoản không hợp lệ.';
  end if;
  select id into found_group from public.groups where upper(code) = upper(trim(p_code));
  if found_group is null then raise exception 'Không tìm thấy nhóm với mã này.'; end if;
  insert into public.group_members(group_id, user_id, role)
  values (found_group, p_user_id, 'Thành viên') on conflict do nothing;
  return found_group;
end;
$$;

-- No Supabase Auth is used, so the Expo app connects as anon.
-- RLS is disabled for these demo tables. Password hashes are never selected by the app;
-- registration/login are performed through the functions above.
alter table public.app_users disable row level security;
alter table public.groups disable row level security;
alter table public.group_members disable row level security;
alter table public.documents disable row level security;

revoke all on public.app_users from anon, authenticated;
grant select (id, full_name, email, initials, created_at) on public.app_users to anon, authenticated;
grant execute on function public.register_app_user(text, text, text, text) to anon, authenticated;
grant execute on function public.login_app_user(text, text) to anon, authenticated;
grant execute on function public.join_group_by_code(text, uuid) to anon, authenticated;
grant select, insert, update, delete on public.groups to anon, authenticated;
grant select, insert, update, delete on public.group_members to anon, authenticated;
grant select, insert, update, delete on public.documents to anon, authenticated;

-- Storage bucket used by Expo DocumentPicker upload.
insert into storage.buckets (id, name, public, file_size_limit)
values ('groupdocs-files', 'groupdocs-files', true, 104857600)
on conflict (id) do update set
  public = true,
  file_size_limit = 104857600;

drop policy if exists "groupdocs public read" on storage.objects;
drop policy if exists "groupdocs anon delete" on storage.objects;
create policy "groupdocs public read" on storage.objects for select using (bucket_id = 'groupdocs-files');
create policy "groupdocs anon upload" on storage.objects for insert to anon, authenticated with check (bucket_id = 'groupdocs-files');
create policy "groupdocs anon delete" on storage.objects for delete to anon, authenticated using (bucket_id = 'groupdocs-files');
