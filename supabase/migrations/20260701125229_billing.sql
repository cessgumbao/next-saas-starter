-- Billing layer, mirrored from Stripe. Stripe is the source of truth; these
-- tables are populated by webhooks (service role) and are read-only to clients.

-- subscriptions: one live subscription per organization.
create table subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  org_id                 uuid not null references organizations (id) on delete cascade,
  plan_id                text not null references plans (id),
  stripe_customer_id     text,
  stripe_subscription_id text unique,
  status                 subscription_status not null default 'trialing',
  cycle                  billing_cycle not null default 'monthly',
  seats_used             integer not null default 0,   -- prefer the derived view_org_seat_usage
  current_period_end     timestamptz,
  trial_end              timestamptz,
  cancel_at_period_end   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index subscriptions_org_id_idx on subscriptions (org_id);
create index subscriptions_stripe_customer_idx on subscriptions (stripe_customer_id);
-- At most one live subscription per org.
create unique index subscriptions_one_live_per_org
  on subscriptions (org_id)
  where status in ('trialing', 'active', 'past_due');

create trigger subscriptions_set_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

-- payment_methods: Stripe card metadata only. Never store PAN/CVV.
create table payment_methods (
  id                       uuid primary key default gen_random_uuid(),
  org_id                   uuid not null references organizations (id) on delete cascade,
  stripe_payment_method_id text not null unique,
  brand                    text,
  last4                    text,
  exp_month                smallint,
  exp_year                 smallint,
  is_default               boolean not null default false,
  created_at               timestamptz not null default now()
);

create index payment_methods_org_id_idx on payment_methods (org_id);
-- At most one default payment method per org.
create unique index payment_methods_one_default_per_org
  on payment_methods (org_id)
  where is_default;

-- invoices: billing history shown on /billing.
create table invoices (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references organizations (id) on delete cascade,
  number             text not null unique,          -- e.g. 'INV-2026-0612'
  stripe_invoice_id  text unique,
  amount_cents       integer not null,
  currency           text not null default 'usd',
  status             invoice_status not null default 'paid',
  hosted_invoice_url text,
  pdf_url            text,
  issued_at          timestamptz not null default now(),
  created_at         timestamptz not null default now()
);

create index invoices_org_issued_idx on invoices (org_id, issued_at desc);
