import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embed } from "@/lib/embeddings";
import { answerFromChunks } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question, scopeNoteId } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: "question is required" }, { status: 400 });

  const [queryVector] = await embed([question], "query");
  const { data: matches, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryVector,
    match_user_id: user.id,
    match_count: 8,
    scope_source_type: scopeNoteId ? "note" : null,
    scope_source_id: scopeNoteId ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!matches?.length) {
    return NextResponse.json({
      answer: scopeNoteId
        ? "This note hasn't been indexed yet — click away from the editor once to save and index it, then ask again."
        : "Nothing saved yet matches that question — write a note or attach a file first.",
    });
  }

  const noteIds = [...new Set(matches.filter((m: any) => m.source_type === "note").map((m: any) => m.source_id))];
  const fileIds = [...new Set(matches.filter((m: any) => m.source_type === "file").map((m: any) => m.source_id))];
  const [{ data: notes }, { data: files }] = await Promise.all([
    noteIds.length ? supabase.from("notes").select("id, title").in("id", noteIds) : { data: [] },
    fileIds.length ? supabase.from("files").select("id, name").in("id", fileIds) : { data: [] },
  ]);
  const labelByNote = new Map((notes ?? []).map((n) => [n.id, n.title]));
  const labelByFile = new Map((files ?? []).map((f) => [f.id, f.name]));

  const answer = await answerFromChunks(
    question,
    matches.map((m: any) => ({
      label: m.source_type === "note" ? labelByNote.get(m.source_id) ?? "Untitled note" : labelByFile.get(m.source_id) ?? "File",
      content: m.content,
    }))
  );

  return NextResponse.json({ answer });
}
