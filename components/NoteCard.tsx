import Link from "next/link";

const KIND_ICON: Record<string, string> = { note: "📝", idea: "💡", class: "🎓" };

export type NoteSummary = {
  id: string;
  title: string;
  kind: string;
  favorite: boolean;
  updated_at: string;
};

export default function NoteCard({ note }: { note: NoteSummary }) {
  return (
    <Link href={`/notes/${note.id}`} className="card hover:border-accent transition block">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">
          {KIND_ICON[note.kind]} {note.kind}
        </span>
        {note.favorite && <span className="text-yellow-400 text-xs">★</span>}
      </div>
      <div className="font-medium text-sm truncate">{note.title || "Untitled"}</div>
      <div className="text-xs text-gray-500 mt-1">{new Date(note.updated_at).toLocaleDateString()}</div>
    </Link>
  );
}
