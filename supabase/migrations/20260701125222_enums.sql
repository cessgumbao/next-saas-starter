-- Enums for the Aura data model.
-- Closed value sets used across tenancy, billing, and invites.

create type role as enum ('owner', 'admin', 'member');

create type membership_status as enum ('active', 'suspended');

create type invite_status as enum ('pending', 'accepted', 'revoked', 'expired');

create type subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'unpaid'
);

create type billing_cycle as enum ('monthly', 'yearly');

create type invoice_status as enum (
  'draft',
  'open',
  'paid',
  'void',
  'uncollectible'
);
