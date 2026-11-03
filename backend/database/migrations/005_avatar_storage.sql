-- Supabase Storage avatar bucket. Images are public by URL; writes are restricted to
-- authenticated users writing under their own UUID folder and the API validates MIME/size.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists movix_avatar_read on storage.objects;
create policy movix_avatar_read on storage.objects for select to public using(bucket_id='avatars');
drop policy if exists movix_avatar_insert_own on storage.objects;
create policy movix_avatar_insert_own on storage.objects for insert to authenticated with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
