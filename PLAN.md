# Second Brain AI — Plan

> Upload your notes, class notes, ideas, and PDFs to one place. From then on you can ask it anything and it answers instantly.

## Goal
A notes workspace (rich-text notes + file attachments) with an AI assistant that answers questions, summarizes, and builds action plans grounded in everything you uploaded.

## Core features (MVP)
1. **Notes editor** — rich text (headings, bold/italic, lists, checklists, links, images), tags, cover image.
2. **Note list** — filter chips: All, Class notes, Ideas, PDFs, Favorites; sorted by updated.
3. **Uploads** — attach PDFs, images, text files to notes or upload standalone; text extracted and indexed.
4. **AI assistant panel** — chat scoped to the current note or the whole brain; answers cite source notes/files.
5. **Actions** — "summarize these notes", "turn this into an action plan", "what can I improve in this project".
6. **Global ask bar** (⌘K) — ask anything / jump to notes.
7. **Sidebar** — Home, Notes, Ideas, Tasks, PDFs, Favorites, Tags, Trash.

## Later
- Folder sync (watch a local/Drive folder and auto-import).
- Tasks extracted from notes into a task view.
- Graph view of related notes.

## Stack
| Layer | Choice |
|---|---|
| App | Next.js + TypeScript + Tailwind + shadcn/ui, Tiptap editor |
| Auth/DB/Storage | Supabase (Auth, Postgres + `pgvector`, Storage for files) |
| Parsing | `pdf-parse` for PDFs; Claude vision for images |
| AI | Claude API (`claude-sonnet-5-5`) with streaming; Voyage AI embeddings |
| Hosting | Vercel |

## Data model
- `notes(id, user_id, title, content_json, kind[note|idea|class], cover_url, favorite, deleted_at, updated_at)`
- `files(id, user_id, note_id, name, mime, size, storage_path, extracted_text)`
- `tags(id, user_id, name)` + `note_tags`
- `chunks(id, source_type, source_id, content, embedding vector)`
- `chats(id, user_id, scope_note_id)` + `messages(id, chat_id, role, content)`

## Milestones
1. **Setup** — scaffold, dark theme, three-pane layout.
2. **Notes** — Tiptap editor, list + filters, favorites, trash.
3. **Files** — upload, extraction, attachments strip.
4. **Indexing** — chunk + embed on save (debounced), `match_chunks` function.
5. **Assistant** — streaming chat with citations, note-scoped vs. global.
6. **Polish** — ⌘K, quick actions, deploy.

## Risks
- Re-embedding on every edit is costly → debounce and only re-embed changed chunks.
- Large PDFs → page-wise chunking with page numbers for citations.
