-- Row Level Security. Enable on every table, then define the policy matrix.
-- Multiple permissive policies are OR'd. The `service_role` bypasses RLS, so
-- Stripe-mirror tables simply omit client write policies.

alter table profiles                 enable row level security;
alter table notification_preferences enable row level security;
alter table organizations            enable row level security;
alter table memberships              enable row level security;
alter table invites                  enable row level security;
alter table plans                    enable row level security;
alter table email_templates          enable row level security;
alter table feature_flags            enable row level security;
alter table subscriptions            enable row level security;
alter table payment_methods          enable row level security;
alter table invoices                 enable row level security;
alter table activity_events          enable row level security;
alter table metrics_monthly          enable row level security;

-- ---------------------------------------------------------------------------
-- profiles: own row; same-org members (for Team display); platform admin.
-- ---------------------------------------------------------------------------
create policy profiles_select on profiles
  for select to authenticated
  using (
    id = auth.uid()
    or is_platform_admin()
    or exists (
      select 1
      from memberships me
      join memberships them on them.org_id = me.org_id
      where me.user_id = auth.uid()
        and me.status = 'active'
        and them.user_id = profiles.id
        and them.status = 'active'
    )
  );

create policy profiles_insert on profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy profiles_update on profiles
  for update to authenticated
  using (id = auth.uid() or is_platform_admin())
  with check (id = auth.uid() or is_platform_admin());

-- ---------------------------------------------------------------------------
-- notification_preferences: strictly the owning user.
-- ---------------------------------------------------------------------------
create policy notification_prefs_select on notification_preferences
  for select to authenticated
  using (user_id = auth.uid());

create policy notification_prefs_insert on notification_preferences
  for insert to authenticated
  with check (user_id = auth.uid());

create policy notification_prefs_update on notification_preferences
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- organizations: members read; owners/platform-admin manage; any auth user
-- can create one (the trigger makes them the owner).
-- ---------------------------------------------------------------------------
create policy organizations_select on organizations
  for select to authenticated
  using (is_member(id) or is_platform_admin());

create policy organizations_insert on organizations
  for insert to authenticated
  with check (created_by = auth.uid());

create policy organizations_update on organizations
  for update to authenticated
  using (current_app_role(id) = 'owner' or is_platform_admin())
  with check (current_app_role(id) = 'owner' or is_platform_admin());

create policy organizations_delete on organizations
  for delete to authenticated
  using (current_app_role(id) = 'owner' or is_platform_admin());

-- ---------------------------------------------------------------------------
-- memberships: members read their org; managers/platform-admin write.
-- ---------------------------------------------------------------------------
create policy memberships_select on memberships
  for select to authenticated
  using (is_member(org_id) or is_platform_admin());

create policy memberships_insert on memberships
  for insert to authenticated
  with check (is_org_manager(org_id) or is_platform_admin());

create policy memberships_update on memberships
  for update to authenticated
  using (is_org_manager(org_id) or is_platform_admin())
  with check (is_org_manager(org_id) or is_platform_admin());

create policy memberships_delete on memberships
  for delete to authenticated
  using (is_org_manager(org_id) or is_platform_admin());

-- ---------------------------------------------------------------------------
-- invites: managers/platform-admin only (read and write).
-- ---------------------------------------------------------------------------
create policy invites_select on invites
  for select to authenticated
  using (is_org_manager(org_id) or is_platform_admin());

create policy invites_insert on invites
  for insert to authenticated
  with check (is_org_manager(org_id) or is_platform_admin());

create policy invites_update on invites
  for update to authenticated
  using (is_org_manager(org_id) or is_platform_admin())
  with check (is_org_manager(org_id) or is_platform_admin());

create policy invites_delete on invites
  for delete to authenticated
  using (is_org_manager(org_id) or is_platform_admin());

-- ---------------------------------------------------------------------------
-- Reference tables: broad read, platform-admin write.
-- ---------------------------------------------------------------------------
create policy plans_select on plans
  for select to anon, authenticated
  using (true);
create policy plans_write on plans
  for all to authenticated
  using (is_platform_admin())
  with check (is_platform_admin());

create policy email_templates_select on email_templates
  for select to authenticated
  using (true);
create policy email_templates_write on email_templates
  for all to authenticated
  using (is_platform_admin())
  with check (is_platform_admin());

create policy feature_flags_select on feature_flags
  for select to authenticated
  using (true);
create policy feature_flags_write on feature_flags
  for all to authenticated
  using (is_platform_admin())
  with check (is_platform_admin());

-- ---------------------------------------------------------------------------
-- Billing (Stripe-mirrored): read-only to clients; writes via service_role.
-- ---------------------------------------------------------------------------
create policy subscriptions_select on subscriptions
  for select to authenticated
  using (is_member(org_id) or is_platform_admin());

create policy payment_methods_select on payment_methods
  for select to authenticated
  using (is_org_manager(org_id) or is_platform_admin());

create policy invoices_select on invoices
  for select to authenticated
  using (is_member(org_id) or is_platform_admin());

-- ---------------------------------------------------------------------------
-- activity_events: members read/append their org's feed.
-- ---------------------------------------------------------------------------
create policy activity_events_select on activity_events
  for select to authenticated
  using (is_member(org_id) or is_platform_admin());

create policy activity_events_insert on activity_events
  for insert to authenticated
  with check (is_member(org_id) or is_platform_admin());

-- ---------------------------------------------------------------------------
-- metrics_monthly: org rows to members; platform (null) rows to platform-admin.
-- Writes come from the snapshot job / service_role only.
-- ---------------------------------------------------------------------------
create policy metrics_monthly_select on metrics_monthly
  for select to authenticated
  using (
    (org_id is not null and is_member(org_id))
    or is_platform_admin()
  );

-- ---------------------------------------------------------------------------
-- Table/view privileges. RLS (above) governs which ROWS are visible; these
-- GRANTs govern table-level access. Row access is still fully gated by the
-- policies, so a broad grant to `authenticated` is safe -- a table with no
-- matching policy simply returns/affects zero rows.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant select on all tables in schema public to authenticated;
grant insert, update, delete on all tables in schema public to authenticated;

-- anon only ever needs the public plan catalog.
grant select on plans to anon;

-- service_role (webhooks, jobs) bypasses RLS and needs full table access.
grant all on all tables in schema public to service_role;

-- RPC consumed by the dashboard.
grant execute on function rpc_org_dashboard_kpis(uuid) to authenticated, service_role;
