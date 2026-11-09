import { createClient } from "@/lib/supabase/server";
import NoteCard from "@/components/NoteCard";

export default async function TrashPage() {
  const supabase = await createClient();
  const { data: notes } = await supabase
    .from("notes")
    .select("id, title, kind, favorite, updated_at")
    .not("deleted_at", "is", null)
    .order("updated_at", { ascending: false });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Trash</h1>
      <p className="text-sm text-gray-500">Open a note to restore it.</p>
      {notes?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {notes.map((n) => (
            <NoteCard key={n.id} note={n as any} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Trash is empty.</p>
      )}
    </div>
  );
}
