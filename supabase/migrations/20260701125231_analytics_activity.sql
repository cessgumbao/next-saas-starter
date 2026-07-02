-- Analytics & activity layer: event feed, monthly metric snapshots, and the
-- read helpers (views / RPC) that back the Dashboard and Admin pages.

-- activity_events: powers the Dashboard "Recent activity" feed and the topbar
-- notifications. actor_user_id null = system-generated event.
create table activity_events (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  type          text not null,   -- e.g. 'subscription.upgraded', 'member.invited', 'payment.received'
  message       text not null,
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

create index activity_events_org_created_idx on activity_events (org_id, created_at desc);

-- metrics_monthly: monthly snapshots. Trend, deltas and churn cannot be derived
-- from current-state rows, so they are snapshotted here.
-- org_id null = platform-wide aggregate row (feeds /admin KPIs).
create table metrics_monthly (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid references organizations (id) on delete cascade,
  period_month        date not null,       -- first day of the month
  mrr_cents           bigint not null default 0,
  active_users        integer not null default 0,
  subscriptions_count integer not null default 0,
  churn_rate_bps      integer not null default 0,  -- basis points: 180 = 1.80%
  paying_customers    integer not null default 0,  -- platform rows only
  trial_accounts      integer not null default 0,  -- platform rows only
  created_at          timestamptz not null default now()
);

-- Unique per org+month; separate unique for the single platform row per month.
create unique index metrics_monthly_org_period_idx
  on metrics_monthly (org_id, period_month)
  where org_id is not null;
create unique index metrics_monthly_platform_period_idx
  on metrics_monthly (period_month)
  where org_id is null;
create index metrics_monthly_org_period_desc_idx
  on metrics_monthly (org_id, period_month desc);

-- Seat usage per org (active members). Paired with plans.seat_limit for
-- Billing's "8 of 10". security_invoker so it respects memberships RLS.
create view view_org_seat_usage
with (security_invoker = on) as
select
  m.org_id,
  count(*) filter (where m.status = 'active')::integer as seats_used
from memberships m
group by m.org_id;

-- Admin "All users": one row per customer org with current plan/status and
-- derived MRR. security_invoker means a platform admin (who can read all orgs
-- via RLS) sees every org, while a normal member only sees their own.
create view view_admin_accounts
with (security_invoker = on) as
select
  o.id            as org_id,
  o.name,
  o.contact_email,
  p.id            as plan_id,
  p.name          as plan_name,
  s.status        as subscription_status,
  s.cycle,
  -- Monthly recurring revenue in cents; $0 while trialing.
  case
    when s.status = 'trialing' then 0
    when s.cycle = 'yearly'    then p.price_yearly_cents
    else p.price_monthly_cents
  end::bigint     as mrr_cents
from organizations o
left join subscriptions s
  on s.org_id = o.id
  and s.status in ('trialing', 'active', 'past_due')
left join plans p on p.id = s.plan_id;

-- Dashboard KPIs for one org: current values plus deltas vs the prior month.
-- security_invoker so it only returns data for orgs the caller can read.
create or replace function rpc_org_dashboard_kpis(p_org_id uuid)
returns table (
  mrr_cents                bigint,
  mrr_delta_bps            integer,
  active_users             integer,
  active_users_delta_bps   integer,
  subscriptions_count      integer,
  subscriptions_delta_bps  integer,
  churn_rate_bps           integer,
  churn_delta_bps          integer
)
language sql
security invoker
set search_path = public
as $$
  with latest as (
    select *
    from metrics_monthly
    where org_id = p_org_id
    order by period_month desc
    limit 2
  ),
  cur as (select * from latest order by period_month desc limit 1),
  prev as (select * from latest order by period_month asc limit 1)
  select
    cur.mrr_cents,
    case when prev.mrr_cents > 0
      then (((cur.mrr_cents - prev.mrr_cents) * 10000) / prev.mrr_cents)::integer
      else 0 end,
    cur.active_users,
    case when prev.active_users > 0
      then (((cur.active_users - prev.active_users) * 10000) / prev.active_users)::integer
      else 0 end,
    cur.subscriptions_count,
    case when prev.subscriptions_count > 0
      then (((cur.subscriptions_count - prev.subscriptions_count) * 10000) / prev.subscriptions_count)::integer
      else 0 end,
    cur.churn_rate_bps,
    (cur.churn_rate_bps - prev.churn_rate_bps)::integer
  from cur left join prev on true;
$$;

-- Monthly snapshot job. Computes per-org metrics from live tables plus a
-- platform-wide aggregate. Runs in production via pg_cron; local dev seeds
-- the 12-month history directly in seed.sql instead.
create or replace function fn_snapshot_metrics(p_period date default date_trunc('month', now())::date)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Per-org snapshot.
  insert into metrics_monthly (
    org_id, period_month, mrr_cents, active_users, subscriptions_count
  )
  select
    o.id,
    p_period,
    coalesce(sum(
      case
        when s.status = 'trialing' then 0
        when s.cycle = 'yearly'    then pl.price_yearly_cents
        else pl.price_monthly_cents
      end
    ), 0)::bigint,
    (select count(*) from memberships m where m.org_id = o.id and m.status = 'active')::integer,
    count(s.id)::integer
  from organizations o
  left join subscriptions s
    on s.org_id = o.id and s.status in ('trialing', 'active', 'past_due')
  left join plans pl on pl.id = s.plan_id
  group by o.id
  on conflict (org_id, period_month) where org_id is not null
  do update set
    mrr_cents = excluded.mrr_cents,
    active_users = excluded.active_users,
    subscriptions_count = excluded.subscriptions_count;

  -- Platform-wide aggregate row (org_id null).
  insert into metrics_monthly (
    org_id, period_month, mrr_cents, subscriptions_count, paying_customers, trial_accounts
  )
  select
    null,
    p_period,
    coalesce(sum(
      case
        when s.status = 'trialing' then 0
        when s.cycle = 'yearly'    then pl.price_yearly_cents
        else pl.price_monthly_cents
      end
    ), 0)::bigint,
    count(s.id)::integer,
    count(*) filter (where s.status in ('active', 'past_due'))::integer,
    count(*) filter (where s.status = 'trialing')::integer
  from subscriptions s
  join plans pl on pl.id = s.plan_id
  where s.status in ('trialing', 'active', 'past_due')
  on conflict (period_month) where org_id is null
  do update set
    mrr_cents = excluded.mrr_cents,
    subscriptions_count = excluded.subscriptions_count,
    paying_customers = excluded.paying_customers,
    trial_accounts = excluded.trial_accounts;
end;
$$;

-- Best-effort monthly schedule via pg_cron. Wrapped so a missing extension
-- (e.g. some local setups) does not fail the whole migration.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron with schema extensions;
    perform cron.schedule(
      'aura-monthly-metrics',
      '5 0 1 * *',
      $cron$ select public.fn_snapshot_metrics(); $cron$
    );
  end if;
exception when others then
  raise notice 'pg_cron scheduling skipped: %', sqlerrm;
end;
$$;
