-- Turn on row security for organization data. Policies are intentionally deferred
-- until Supabase Auth JWT is integrated; enabled tables are private by default.
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table vehicles enable row level security;
alter table renters enable row level security;
alter table rental_contracts enable row level security;
