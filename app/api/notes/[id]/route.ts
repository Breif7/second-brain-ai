import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { indexSource } from "@/lib/index-source";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const patch = await req.json();
  const update: Record<string, any> = { updated_at: new Date().toISOString() };
  for (const key of ["title", "content_json", "content_text", "kind", "favorite", "tags", "cover_url", "deleted_at"]) {
    if (key in patch) update[key] = patch[key];
  }

  const { error } = await supabase.from("notes").update(update).eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Re-index on content changes (the editor calls this on blur, not every keystroke — see
  // components/NoteEditor.tsx — so this never fires more often than a save actually happens).
  if ("content_text" in patch) {
    await indexSource(supabase, user.id, "note", id, patch.content_text ?? "").catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Permanent delete (used from the Trash page); soft-delete goes through PATCH { deleted_at }.
  const { error } = await supabase.from("notes").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
