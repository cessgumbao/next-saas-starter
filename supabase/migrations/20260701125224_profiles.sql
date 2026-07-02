-- Identity layer: profiles (1:1 with auth.users) and per-user notification prefs.

-- Shared trigger to maintain updated_at on row changes.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles: mirrors auth.users, holds display fields and the super-admin gate.
create table profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  full_name         text,
  email             text not null unique,
  bio               text,
  avatar_url        text,
  is_platform_admin boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- notification_preferences: one row per user, fixed known toggles as columns.
create table notification_preferences (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  weekly_summary   boolean not null default true,
  product_updates  boolean not null default true,
  billing_receipts boolean not null default true,
  security_alerts  boolean not null default true,
  updated_at       timestamptz not null default now()
);

create trigger notification_preferences_set_updated_at
  before update on notification_preferences
  for each row execute function set_updated_at();

-- On signup, create the profile and default notification prefs.
-- SECURITY DEFINER so it can write regardless of the caller's RLS context.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
