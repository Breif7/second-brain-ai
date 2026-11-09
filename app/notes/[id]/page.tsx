import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";
import NoteAttachments from "@/components/NoteAttachments";
import FileUploader from "@/components/FileUploader";
import AssistantPanel from "@/components/AssistantPanel";
import NoteToolbar from "@/components/NoteToolbar";

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: note }, { data: files }] = await Promise.all([
    supabase.from("notes").select("*").eq("id", id).single(),
    supabase.from("files").select("id, name, mime").eq("note_id", id),
  ]);
  if (!note) notFound();

  return (
    <div className="grid lg:grid-cols-[1fr_360px] h-screen">
      <div className="overflow-auto p-6">
        <NoteToolbar note={note} />
        <NoteAttachments files={files ?? []} />
        <FileUploader noteId={id} />
        <div className="mt-4">
          <NoteEditor noteId={id} initialTitle={note.title} initialContent={note.content_json} />
        </div>
      </div>
      <div className="border-l border-border p-4 hidden lg:block">
        <AssistantPanel scopeNoteId={id} placeholder="Ask about this note — or use a quick action above." />
      </div>
    </div>
  );
}
