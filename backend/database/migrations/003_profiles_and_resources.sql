-- Extend the first schema version while keeping existing column names intact.
alter table profiles add column if not exists email text;
alter table profiles add column if not exists role text not null default 'owner';
do $$ begin
  if not exists(select 1 from pg_constraint where conname='profiles_auth_user_fk') then
    alter table profiles add constraint profiles_auth_user_fk foreign key(id) references auth.users(id) on delete cascade;
  end if;
end $$;
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('owner','renter'));
create unique index if not exists profiles_email_unique on profiles(lower(email)) where email is not null;

alter table organizations add column if not exists owner_id uuid references profiles(id) on delete set null;
update organizations set owner_id=created_by where owner_id is null;
alter table organization_members add column if not exists id uuid default gen_random_uuid();
create unique index if not exists organization_members_id_unique on organization_members(id);
alter table vehicles add column if not exists brand text;
alter table vehicles add column if not exists year smallint;
alter table vehicles add column if not exists color text;
alter table vehicles add column if not exists mileage integer not null default 0;
alter table vehicles drop constraint if exists vehicles_mileage_check;
alter table vehicles add constraint vehicles_mileage_check check (mileage >= 0);
update vehicles set brand=make where brand is null;
update vehicles set year=model_year where year is null;
create unique index if not exists vehicles_id_org_unique on vehicles(id,organization_id);

alter table renters add column if not exists updated_at timestamptz not null default now();
create unique index if not exists renters_id_org_unique on renters(id,organization_id);
alter table rental_contracts add column if not exists start_date date;
alter table rental_contracts add column if not exists end_date date;
alter table rental_contracts add column if not exists monthly_price numeric(12,2);
update rental_contracts set start_date=starts_at where start_date is null;
update rental_contracts set end_date=ends_at where end_date is null;
alter table rental_contracts add constraint rental_contracts_price_check check (monthly_price is null or monthly_price >= 0);
alter table rental_contracts add constraint rental_contracts_date_range_check check (end_date is null or start_date is null or end_date >= start_date);
create index if not exists rental_contracts_dates_idx on rental_contracts(organization_id,start_date,end_date);
alter table rental_contracts drop constraint if exists rental_contracts_vehicle_same_org_fk;
alter table rental_contracts add constraint rental_contracts_vehicle_same_org_fk foreign key(vehicle_id,organization_id) references vehicles(id,organization_id);
alter table rental_contracts drop constraint if exists rental_contracts_renter_same_org_fk;
alter table rental_contracts add constraint rental_contracts_renter_same_org_fk foreign key(renter_id,organization_id) references renters(id,organization_id);

comment on table profiles is 'Dados públicos do perfil. Senhas permanecem exclusivamente no Supabase Auth.';
comment on column profiles.id is 'Mesmo UUID do usuário Supabase Auth.';
comment on table organizations is 'Organizações e frotas de proprietários.';
comment on table organization_members is 'Associação de perfis às organizações e suas permissões.';
comment on table vehicles is 'Veículos pertencentes a uma organização.';
comment on table renters is 'Dados complementares e exclusivos do locatário.';
comment on table rental_contracts is 'Contratos ligando veículo e locatário da mesma organização.';
