import { createClient } from "@/lib/supabase/server";
import NoteCard from "@/components/NoteCard";
import AssistantPanel from "@/components/AssistantPanel";
import Link from "next/link";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "note", label: "Notes" },
  { key: "idea", label: "Ideas" },
  { key: "class", label: "Class notes" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; favorite?: string }>;
}) {
  const { kind, favorite } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("notes").select("id, title, kind, favorite, updated_at").is("deleted_at", null);
  if (kind) query = query.eq("kind", kind);
  if (favorite) query = query.eq("favorite", true);
  const { data: notes } = await query.order("updated_at", { ascending: false });

  const activeFilter = favorite ? "favorite" : kind || "all";

  return (
    <div className="grid lg:grid-cols-[1fr_360px] h-screen">
      <div className="overflow-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{favorite ? "Favorites" : "My notes"}</h1>
          <Link href="/notes/new" className="bg-accent rounded-lg px-4 py-2 text-sm font-medium">
            + New note
          </Link>
        </div>

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/" : `/?kind=${f.key}`}
              className={`text-sm px-3 py-1.5 rounded-full ${
                activeFilter === f.key ? "bg-accent text-white" : "bg-panel border border-border text-gray-400"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {notes?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {notes.map((n) => (
              <NoteCard key={n.id} note={n as any} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nothing here yet.</p>
        )}
      </div>

      <div className="border-l border-border p-4 hidden lg:block">
        <AssistantPanel />
      </div>
    </div>
  );
}
