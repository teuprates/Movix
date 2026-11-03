create or replace function public.is_movix_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from organizations o where o.id=target_org and o.owner_id=auth.uid())
  or exists(select 1 from organization_members m where m.organization_id=target_org and m.profile_id=auth.uid() and m.role in ('owner','admin')) $$;

drop policy if exists profile_read_self on profiles;
create policy profile_read_self on profiles for select to authenticated using (id=auth.uid());
-- Profile writes go through the API after Supabase Auth token verification so clients
-- cannot escalate their role by updating profiles.role directly through PostgREST.
drop policy if exists profile_update_self on profiles;
drop policy if exists organizations_read_member on organizations;
create policy organizations_read_member on organizations for select to authenticated using (owner_id=auth.uid() or public.is_movix_org_member(id));
drop policy if exists members_read_org on organization_members;
create policy members_read_org on organization_members for select to authenticated using (profile_id=auth.uid() or public.is_movix_org_member(organization_id));
drop policy if exists vehicles_read_org on vehicles;
create policy vehicles_read_org on vehicles for select to authenticated using (public.is_movix_org_member(organization_id));
drop policy if exists renters_read_self_or_org on renters;
create policy renters_read_self_or_org on renters for select to authenticated using (profile_id=auth.uid() or public.is_movix_org_member(organization_id));
drop policy if exists renters_update_self on renters;
drop policy if exists contracts_read_related on rental_contracts;
create policy contracts_read_related on rental_contracts for select to authenticated using (
  public.is_movix_org_member(organization_id) or exists(select 1 from renters r where r.id=renter_id and r.profile_id=auth.uid())
);
