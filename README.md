# Second Brain AI

Upload your notes, class notes, ideas and PDFs to one place. From then on you can ask it anything and it answers instantly.

![Concept](docs/concept.jpeg)

**Status:** MVP implemented, not yet run (no Node.js on the machine that built it — see Known issues). See [PLAN.md](PLAN.md) for the full feature list and milestones.

## Stack
Next.js 15 (App Router, TypeScript) · Tailwind · Tiptap editor · Supabase (Auth, Postgres + `pgvector`, Storage) · `pdf-parse` for PDFs, Claude vision for images · Voyage AI embeddings · Claude API (`claude-sonnet-5-5`) · Vercel.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create a Supabase project**, enable `vector` and run [`supabase/schema.sql`](supabase/schema.sql) — creates `notes`, `files`, `chunks` (+ `match_chunks()`), all RLS-protected.
3. **Create the `files` storage bucket**:
   ```sql
   insert into storage.buckets (id, name, public) values ('files', 'files', false);
   ```
4. **Get a Voyage AI key** (voyageai.com) and an Anthropic key (console.anthropic.com).
5. **Enable email magic-link auth** (on by default) and add `http://localhost:3000/auth/callback` to Authentication → URL Configuration → Redirect URLs.
6. **Environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
7. **Run it**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000, click "+ New note", write something, click away to save — then ask the assistant about it.

## Deploy
Push to GitHub (already done) → import into Vercel → set the same environment variables there.

## Known issues / not verified
- Built without a working Node.js install, so `npm install`/`npm run dev`/`npm run build` have **not been run** — there may be small type or import errors to fix on first build.
- **Smaller options taken vs. PLAN.md** (documented in `supabase/schema.sql` too):
  - Tags are a `text[]` column on `notes` instead of separate `tags`/`note_tags` tables — no tag management UI yet, just storage for later.
  - `chunks` carries `user_id` and a generic `(source_type, source_id)` instead of being joined through notes/files separately — lets one `match_chunks()` function search notes and files together.
  - Chat history isn't persisted (no `chats`/`messages` tables) — the assistant panel is stateless per question rather than a saved conversation. Each answer still cites its sources.
  - Autosave triggers on the editor losing focus (blur), not a real debounce timer — simpler, and avoids re-embedding on every keystroke; the trade-off is no save while you're still typing.
- No ⌘K global command palette yet (listed as a milestone-6 polish item) — search/filtering works through the sidebar and filter chips instead.
- No automated tests yet.
