-- Second Brain AI schema. Run in the Supabase SQL editor.
-- Simplified vs. PLAN.md in two places (documented in README "Known issues"):
--   - tags is a text[] column on notes instead of separate tags/note_tags tables.
--   - chunks carries user_id directly and a polymorphic (source_type, source_id) instead of
--     joining through notes/files, so one match_chunks() function covers both note and file content.
--   - chat history isn't persisted (no chats/messages tables) — the assistant panel is stateless per question.
create extension if not exists vector;

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled',
  content_json jsonb not null default '{"type":"doc","content":[]}',
  content_text text not null default '', -- plain-text mirror, kept in sync on save, used for chunking
  kind text not null default 'note' check (kind in ('note', 'idea', 'class')),
  cover_url text,
  favorite boolean not null default false,
  tags text[] not null default '{}',
  deleted_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid references notes(id) on delete set null,
  name text not null,
  mime text not null,
  size int not null default 0,
  storage_path text not null,
  extracted_text text,
  created_at timestamptz not null default now()
);

create table if not exists chunks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('note', 'file')),
  source_id uuid not null,
  content text not null,
  embedding vector(1024)
);

create index if not exists notes_user_updated_idx on notes (user_id, updated_at desc);
create index if not exists chunks_embedding_idx on chunks using ivfflat (embedding vector_cosine_ops);
create index if not exists chunks_source_idx on chunks (source_type, source_id);

alter table notes enable row level security;
alter table files enable row level security;
alter table chunks enable row level security;

create policy "own rows" on notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on files for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on chunks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Private storage bucket for uploaded files. Create once:
-- insert into storage.buckets (id, name, public) values ('files', 'files', false);
create policy "own files read" on storage.objects for select
  using (bucket_id = 'files' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "own files write" on storage.objects for insert
  with check (bucket_id = 'files' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "own files delete" on storage.objects for delete
  using (bucket_id = 'files' and auth.uid()::text = (storage.foldername(name))[1]);

-- Semantic search across both notes and files for one user, optionally scoped to one note.
create or replace function match_chunks(
  query_embedding vector(1024),
  match_user_id uuid,
  match_count int default 8,
  scope_source_type text default null,
  scope_source_id uuid default null
)
returns table (chunk_id uuid, source_type text, source_id uuid, content text, similarity float)
language sql stable
as $$
  select c.id, c.source_type, c.source_id, c.content, 1 - (c.embedding <=> query_embedding) as similarity
  from chunks c
  where c.user_id = match_user_id
    and (scope_source_id is null or (c.source_type = scope_source_type and c.source_id = scope_source_id))
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
