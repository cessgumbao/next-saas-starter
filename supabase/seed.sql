-- Seed data, loaded on `supabase db reset`.
--
-- Section A (reference data) is production-relevant and always loaded.
-- Section B (demo data) exists only to populate the UI in local dev and can be
-- deleted for real environments. It seeds auth.users directly (fixed UUIDs) so
-- foreign keys resolve; the on_auth_user_created trigger creates the matching
-- profiles + notification_preferences rows automatically.

-- ===========================================================================
-- SECTION A — reference data (always)
-- ===========================================================================

-- Plans (prices in integer cents; *_yearly is the per-month figure when annual).
insert into plans (id, name, tagline, price_monthly_cents, price_yearly_cents, seat_limit, features, sort_order) values
  ('starter', 'Starter', 'For individuals getting started.', 1900, 1500, 3,
    array['Up to 3 seats','5 projects','Community support','Basic analytics'], 1),
  ('pro', 'Pro', 'For growing teams that need more.', 4900, 3900, 10,
    array['Up to 10 seats','Unlimited projects','Role-based permissions','Priority email support','Advanced analytics'], 2),
  ('business', 'Business', 'For organizations at scale.', 9900, 7900, null,
    array['Unlimited seats','SSO & SAML','Audit logs','Dedicated success manager','99.99% uptime SLA'], 3)
on conflict (id) do nothing;

-- Transactional email templates (body is a paragraph array).
insert into email_templates (key, name, trigger, subject, heading, body, cta) values
  ('welcome', 'Welcome', 'On sign up', 'Welcome to Aura', 'Welcome aboard, Jordan',
    array[
      'Thanks for signing up for Aura. Your workspace is ready and waiting.',
      'Get started by inviting your team and connecting your first project — it only takes a minute.'
    ], 'Set up your workspace'),
  ('invite', 'Team invite', 'On member invite', 'You''ve been invited to Northwind Labs', 'Join Northwind Labs on Aura',
    array[
      'Mara Chen has invited you to collaborate in the Northwind Labs workspace as a Member.',
      'Accept the invitation to get access to projects, billing and team tools.'
    ], 'Accept invitation'),
  ('receipt', 'Payment receipt', 'On successful charge', 'Your Aura receipt — June 2026', 'Payment received',
    array[
      'We received your payment of $49.00 for the Pro plan. Thank you!',
      'Your subscription renews on July 1, 2026. You can manage billing anytime from your account.'
    ], 'View invoice'),
  ('reset', 'Password reset', 'On reset request', 'Reset your Aura password', 'Reset your password',
    array[
      'We got a request to reset the password for your Aura account.',
      'Click the button below to choose a new password. This link expires in 30 minutes. If you didn''t request this, you can safely ignore it.'
    ], 'Reset password'),
  ('trial', 'Trial ending', '3 days before trial end', 'Your Aura trial ends in 3 days', 'Your trial is ending soon',
    array[
      'Your Aura Pro trial ends in 3 days. Add a payment method to keep your projects, team and data.',
      'Pick a plan that fits — you can change or cancel anytime.'
    ], 'Choose a plan')
on conflict (key) do nothing;

-- Global feature flags.
insert into feature_flags (key, name, description, is_enabled) values
  ('newDash', 'New dashboard', 'Redesigned analytics home', true),
  ('aiAssist', 'AI assistant', 'In-app AI helper (beta)', false),
  ('betaBilling', 'Usage-based billing', 'Metered pricing engine', true),
  ('ssoEnforce', 'Enforce SSO', 'Require SSO for all members', false)
on conflict (key) do nothing;

-- ===========================================================================
-- SECTION B — demo data (local dev only; safe to delete for production)
-- ===========================================================================

-- Demo auth users. Password for all: "password123".
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111101', 'authenticated', 'authenticated', 'jordan@northwind.co', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jordan Rivera"}'),
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111102', 'authenticated', 'authenticated', 'mara@northwind.co',   crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mara Chen"}'),
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111103', 'authenticated', 'authenticated', 'devin@northwind.co',  crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Devin Okafor"}'),
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111104', 'authenticated', 'authenticated', 'priya@northwind.co',  crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Nair"}'),
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111105', 'authenticated', 'authenticated', 'leo@northwind.co',    crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Leo Marenco"}'),
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111106', 'authenticated', 'authenticated', 'sasha@northwind.co',  crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sasha Idris"}')
on conflict (id) do nothing;

-- Email identities so the demo users can actually sign in.
insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  u.id::text, u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users u
where u.id in (
  '11111111-1111-1111-1111-111111111101','11111111-1111-1111-1111-111111111102',
  '11111111-1111-1111-1111-111111111103','11111111-1111-1111-1111-111111111104',
  '11111111-1111-1111-1111-111111111105','11111111-1111-1111-1111-111111111106'
)
on conflict (provider_id, provider) do nothing;

-- Make Jordan the platform operator and fill profile details.
update profiles set is_platform_admin = true,
  bio = 'Product lead at Northwind Labs. Building tools people love.'
where id = '11111111-1111-1111-1111-111111111101';

-- Organizations. Northwind is created_by Jordan (trigger makes him owner);
-- the other orgs are customer accounts that populate the Admin view.
insert into organizations (id, name, slug, contact_email, created_by) values
  ('22222222-2222-2222-2222-222222222201', 'Northwind Labs', 'northwind-labs', 'jordan@northwind.co', '11111111-1111-1111-1111-111111111101'),
  ('22222222-2222-2222-2222-222222222202', 'Skyline Co',     'skyline-co',     'ops@skyline.co',      null),
  ('22222222-2222-2222-2222-222222222203', 'Globex Inc',     'globex-inc',     'admin@globex.com',    null),
  ('22222222-2222-2222-2222-222222222204', 'Nova Studio',    'nova-studio',    'hi@novastudio.io',    null),
  ('22222222-2222-2222-2222-222222222205', 'Harbor Labs',    'harbor-labs',    'team@harbor.dev',     null),
  ('22222222-2222-2222-2222-222222222206', 'Acme',           'acme',           'tom@acme.io',         null)
on conflict (id) do nothing;

-- Northwind memberships (Jordan owner row already created by the trigger).
insert into memberships (org_id, user_id, role, status, last_active_at) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111102', 'admin',  'active', now() - interval '2 hours'),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111103', 'member', 'active', now() - interval '5 hours'),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111104', 'member', 'active', now() - interval '1 day'),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111105', 'member', 'active', now() - interval '9 days'),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111106', 'admin',  'active', now() - interval '3 days')
on conflict (org_id, user_id) do nothing;

-- Pending invites for Northwind.
insert into invites (org_id, email, role, status, invited_by, created_at) values
  ('22222222-2222-2222-2222-222222222201', 'tom@acme.io',    'member', 'pending', '11111111-1111-1111-1111-111111111102', now() - interval '2 days'),
  ('22222222-2222-2222-2222-222222222201', 'nina@globex.com','admin',  'pending', '11111111-1111-1111-1111-111111111101', now() - interval '5 days')
on conflict do nothing;

-- Subscriptions (one live per org) reproducing the Admin table.
insert into subscriptions (org_id, plan_id, status, cycle, current_period_end, trial_end) values
  ('22222222-2222-2222-2222-222222222201', 'pro',      'active',   'monthly', date '2026-07-01', null),
  ('22222222-2222-2222-2222-222222222202', 'business', 'active',   'monthly', date '2026-07-01', null),
  ('22222222-2222-2222-2222-222222222203', 'pro',      'past_due', 'monthly', date '2026-07-01', null),
  ('22222222-2222-2222-2222-222222222204', 'starter',  'active',   'monthly', date '2026-07-01', null),
  ('22222222-2222-2222-2222-222222222205', 'business', 'active',   'monthly', date '2026-07-01', null),
  ('22222222-2222-2222-2222-222222222206', 'pro',      'trialing', 'monthly', null,              now() + interval '3 days')
on conflict do nothing;

-- Northwind default payment method (Stripe metadata only).
insert into payment_methods (org_id, stripe_payment_method_id, brand, last4, exp_month, exp_year, is_default) values
  ('22222222-2222-2222-2222-222222222201', 'pm_demo_northwind_4242', 'visa', '4242', 9, 2028, true)
on conflict (stripe_payment_method_id) do nothing;

-- Northwind invoice history.
insert into invoices (org_id, number, amount_cents, status, issued_at) values
  ('22222222-2222-2222-2222-222222222201', 'INV-2026-0612', 4900, 'paid', date '2026-06-01'),
  ('22222222-2222-2222-2222-222222222201', 'INV-2026-0511', 4900, 'paid', date '2026-05-01'),
  ('22222222-2222-2222-2222-222222222201', 'INV-2026-0410', 4900, 'paid', date '2026-04-01'),
  ('22222222-2222-2222-2222-222222222201', 'INV-2026-0309', 4900, 'paid', date '2026-03-01'),
  ('22222222-2222-2222-2222-222222222201', 'INV-2026-0208', 4900, 'paid', date '2026-02-01')
on conflict (number) do nothing;

-- Northwind activity feed (dashboard) + notification-style events (topbar).
insert into activity_events (org_id, actor_user_id, type, message, created_at) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111102', 'subscription.upgraded', 'Mara Chen upgraded the workspace to Pro',        now() - interval '2 hours'),
  ('22222222-2222-2222-2222-222222222201', null,                                   'subscription.created',  'New subscription from Skyline Co — $99/mo',       now() - interval '4 hours'),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111103', 'member.invited',        'Devin Okafor invited 2 new members',              now() - interval '5 hours'),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111104', 'billing.updated',       'Priya Nair updated billing details',              now() - interval '1 day'),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111106', 'role.changed',          'Sasha Idris changed a member role to Admin',      now() - interval '2 days'),
  ('22222222-2222-2222-2222-222222222201', null,                                   'payment.received',      'Payment of $49.00 received from Mara Chen',       now() - interval '1 hour'),
  ('22222222-2222-2222-2222-222222222201', null,                                   'payment.failed',        'Globex Inc payment failed — card declined',       now() - interval '3 hours')
on conflict do nothing;

-- Monthly metric snapshots: 12 months of Northwind org rows + platform rows.
-- Northwind rows drive the Dashboard chart shape; platform rows drive Admin KPIs.
insert into metrics_monthly (org_id, period_month, mrr_cents, active_users, subscriptions_count, churn_rate_bps) values
  ('22222222-2222-2222-2222-222222222201', date '2025-07-01', 2800000, 3, 1, 300),
  ('22222222-2222-2222-2222-222222222201', date '2025-08-01', 3400000, 3, 1, 280),
  ('22222222-2222-2222-2222-222222222201', date '2025-09-01', 3100000, 4, 1, 260),
  ('22222222-2222-2222-2222-222222222201', date '2025-10-01', 4200000, 4, 1, 240),
  ('22222222-2222-2222-2222-222222222201', date '2025-11-01', 3800000, 5, 1, 220),
  ('22222222-2222-2222-2222-222222222201', date '2025-12-01', 4900000, 5, 1, 210),
  ('22222222-2222-2222-2222-222222222201', date '2026-01-01', 4600000, 5, 1, 200),
  ('22222222-2222-2222-2222-222222222201', date '2026-02-01', 5800000, 6, 1, 195),
  ('22222222-2222-2222-2222-222222222201', date '2026-03-01', 5400000, 6, 1, 190),
  ('22222222-2222-2222-2222-222222222201', date '2026-04-01', 6300000, 6, 1, 188),
  ('22222222-2222-2222-2222-222222222201', date '2026-05-01', 7100000, 6, 1, 185),
  ('22222222-2222-2222-2222-222222222201', date '2026-06-01', 8200000, 6, 1, 180)
on conflict (org_id, period_month) where org_id is not null do nothing;

insert into metrics_monthly (org_id, period_month, mrr_cents, subscriptions_count, paying_customers, trial_accounts, churn_rate_bps) values
  (null, date '2025-07-01', 1650000,  470,  410,  60, 300),
  (null, date '2025-08-01', 2010000,  577,  505,  72, 290),
  (null, date '2025-09-01', 1840000,  538,  470,  68, 270),
  (null, date '2025-10-01', 2490000,  700,  610,  90, 250),
  (null, date '2025-11-01', 2260000,  644,  560,  84, 230),
  (null, date '2025-12-01', 2900000,  830,  720, 110, 215),
  (null, date '2026-01-01', 2730000,  794,  690, 104, 205),
  (null, date '2026-02-01', 3440000,  992,  860, 132, 198),
  (null, date '2026-03-01', 3200000,  946,  820, 126, 192),
  (null, date '2026-04-01', 3730000, 1110,  960, 150, 188),
  (null, date '2026-05-01', 4210000, 1250, 1080, 170, 184),
  (null, date '2026-06-01', 4829000, 1390, 1204, 186, 180)
on conflict (period_month) where org_id is null do nothing;
