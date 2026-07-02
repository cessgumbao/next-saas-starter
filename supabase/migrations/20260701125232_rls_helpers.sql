-- RLS helper functions.
--
-- These are SECURITY DEFINER with a pinned search_path. Because they run as the
-- definer (not the caller), their internal reads of `memberships` do NOT
-- re-trigger memberships' own RLS policies -- which is what prevents the classic
-- infinite-recursion error when a memberships policy needs to check membership.
-- Policies call these helpers instead of sub-selecting memberships directly.

-- Is the current user a platform-level operator (super-admin)?
create or replace function is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select p.is_platform_admin from profiles p where p.id = auth.uid()),
    false
  );
$$;

-- Is the current user an active member of the given org?
create or replace function is_member(p_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from memberships m
    where m.org_id = p_org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

-- The current user's role in the given org (null if not a member).
create or replace function current_app_role(p_org_id uuid)
returns role
language sql
security definer
set search_path = public
stable
as $$
  select m.role
  from memberships m
  where m.org_id = p_org_id
    and m.user_id = auth.uid()
    and m.status = 'active'
  limit 1;
$$;

-- Can the current user manage the given org (owner or admin)?
create or replace function is_org_manager(p_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select current_app_role(p_org_id) in ('owner', 'admin');
$$;

-- Lock down execution to the app roles.
revoke execute on function is_platform_admin() from public;
revoke execute on function is_member(uuid) from public;
revoke execute on function current_app_role(uuid) from public;
revoke execute on function is_org_manager(uuid) from public;
grant execute on function is_platform_admin() to authenticated, service_role;
grant execute on function is_member(uuid) to authenticated, service_role;
grant execute on function current_app_role(uuid) to authenticated, service_role;
grant execute on function is_org_manager(uuid) to authenticated, service_role;
