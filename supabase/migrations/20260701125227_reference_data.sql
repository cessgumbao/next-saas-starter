-- Reference/catalog tables. Structure only; rows are loaded from seed.sql.

-- plans: the billing plan catalog shown on /billing.
-- Prices are integer cents. price_yearly_cents is the per-month figure when
-- billed annually (matches the UI `y` value); the annual total is derived (x12).
create table plans (
  id                      text primary key,           -- 'starter' | 'pro' | 'business'
  name                    text not null,
  tagline                 text,
  price_monthly_cents     integer not null,
  price_yearly_cents      integer not null,
  seat_limit              integer,                     -- null = unlimited
  features                text[] not null default '{}',
  stripe_price_id_monthly text unique,
  stripe_price_id_yearly  text unique,
  sort_order              integer not null default 0,
  is_active               boolean not null default true
);

-- email_templates: product-level transactional templates shown on /emails.
-- body is a paragraph array to map 1:1 onto the UI's `body: string[]`.
create table email_templates (
  key        text primary key,   -- 'welcome' | 'invite' | 'receipt' | 'reset' | 'trial'
  name       text not null,
  trigger    text not null,
  subject    text not null,
  heading    text not null,
  body       text[] not null default '{}',
  cta        text,
  updated_at timestamptz not null default now()
);

create trigger email_templates_set_updated_at
  before update on email_templates
  for each row execute function set_updated_at();

-- feature_flags: global platform flags toggled from /admin.
create table feature_flags (
  key         text primary key,  -- 'newDash' | 'aiAssist' | 'betaBilling' | 'ssoEnforce'
  name        text not null,
  description text,
  is_enabled  boolean not null default false,
  updated_at  timestamptz not null default now()
);

create trigger feature_flags_set_updated_at
  before update on feature_flags
  for each row execute function set_updated_at();
