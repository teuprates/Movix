-- MOVIX initial PostgreSQL schema. IDs are UUIDs; organization-owned records carry organization_id.
create extension if not exists pgcrypto;
create table if not exists profiles (
  id uuid primary key, -- Supabase Auth user UUID
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists organization_members (
  organization_id uuid not null references organizations(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('owner','renter','admin')),
  created_at timestamptz not null default now(),
  primary key (organization_id, profile_id)
);
create index if not exists organization_members_profile_idx on organization_members(profile_id);
create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  make text not null,
  model text not null,
  model_year smallint,
  plate text,
  status text not null default 'available' check (status in ('available','rented','maintenance','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, plate)
);
create index if not exists vehicles_org_idx on vehicles(organization_id);
create table if not exists renters (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);
create index if not exists renters_org_idx on renters(organization_id);
create table if not exists rental_contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete restrict,
  renter_id uuid not null references renters(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft','active','completed','cancelled')),
  starts_at date,
  ends_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);
create index if not exists rental_contracts_org_idx on rental_contracts(organization_id);
create index if not exists rental_contracts_vehicle_idx on rental_contracts(vehicle_id);
create index if not exists rental_contracts_renter_idx on rental_contracts(renter_id);
