-- Tenancy layer: organizations (workspaces), memberships (user<->org), invites.

create table organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  contact_email text,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index organizations_created_by_idx on organizations (created_by);

create trigger organizations_set_updated_at
  before update on organizations
  for each row execute function set_updated_at();

-- memberships: accepted members only (pending people live in `invites`).
create table memberships (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references organizations (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  role           role not null default 'member',
  status         membership_status not null default 'active',
  last_active_at timestamptz,
  created_at     timestamptz not null default now(),
  unique (org_id, user_id)
);

create index memberships_org_id_idx on memberships (org_id);
create index memberships_user_id_idx on memberships (user_id);
-- At most one owner per organization.
create unique index memberships_one_owner_per_org
  on memberships (org_id)
  where role = 'owner';

-- invites: pending invitations, surfaced on the Team page and via email.
create table invites (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations (id) on delete cascade,
  email       text not null,
  role        role not null default 'member',
  status      invite_status not null default 'pending',
  token       uuid not null default gen_random_uuid() unique,
  invited_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz default (now() + interval '7 days'),
  accepted_at timestamptz
);

create index invites_org_status_idx on invites (org_id, status);
-- Only one pending invite per email per org (case-insensitive).
create unique index invites_one_pending_per_email
  on invites (org_id, lower(email))
  where status = 'pending';

-- When an organization is created, make its creator the owner.
create or replace function handle_new_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is not null then
    insert into public.memberships (org_id, user_id, role, status, last_active_at)
    values (new.id, new.created_by, 'owner', 'active', now())
    on conflict (org_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_organization_created
  after insert on organizations
  for each row execute function handle_new_organization();
