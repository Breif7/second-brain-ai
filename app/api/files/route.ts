import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractFileText } from "@/lib/extract-file";
import { indexSource } from "@/lib/index-source";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const noteId = (form.get("note_id") as string | null) || null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const path = `${user.id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("files")
    .upload(path, buffer, { contentType: file.type });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const extracted_text = await extractFileText(buffer, file.type).catch(() => "");

  const { data: fileRow, error } = await supabase
    .from("files")
    .insert({
      user_id: user.id,
      note_id: noteId,
      name: file.name,
      mime: file.type,
      size: buffer.length,
      storage_path: path,
      extracted_text,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (extracted_text) {
    await indexSource(supabase, user.id, "file", fileRow.id, extracted_text).catch(() => {});
  }

  return NextResponse.json({ file: fileRow });
}
