-- Content the admin panel edits: one row holding the whole store as JSON.
-- Only the server touches it, with the service role key, so RLS is on with no
-- policies and the public API roles get no access at all.
create table public.site_store (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_store enable row level security;
revoke all on table public.site_store from anon, authenticated;

-- Photos and videos uploaded in the panel. Public to read by URL; uploads only through
-- signed URLs the server hands out. No policies on storage.objects, so nothing can be
-- listed, changed or deleted through the public API.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800,
  array['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm']
)
on conflict (id) do nothing;
