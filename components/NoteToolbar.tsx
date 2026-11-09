"use client";

import { useRouter } from "next/navigation";

type Note = { id: string; kind: string; favorite: boolean; deleted_at: string | null };

export default function NoteToolbar({ note }: { note: Note }) {
  const router = useRouter();

  async function patch(body: Record<string, any>) {
    await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 mb-2">
      <select
        value={note.kind}
        onChange={(e) => patch({ kind: e.target.value })}
        className="text-xs bg-bg border border-border rounded-lg px-2 py-1"
      >
        <option value="note">Note</option>
        <option value="idea">Idea</option>
        <option value="class">Class note</option>
      </select>
      <button onClick={() => patch({ favorite: !note.favorite })} className={note.favorite ? "text-yellow-400" : "text-gray-500"}>
        ★
      </button>
      {note.deleted_at ? (
        <button onClick={() => patch({ deleted_at: null })} className="text-xs text-accent ml-auto">
          Restore
        </button>
      ) : (
        <button onClick={() => patch({ deleted_at: new Date().toISOString() })} className="text-xs text-gray-500 hover:text-red-400 ml-auto">
          Move to trash
        </button>
      )}
    </div>
  );
}
