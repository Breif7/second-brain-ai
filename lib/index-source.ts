import { SupabaseClient } from "@supabase/supabase-js";
import { chunkText, embed } from "@/lib/embeddings";

/** Re-chunks and re-embeds a note's or file's text, replacing its previous chunks. */
export async function indexSource(
  supabase: SupabaseClient,
  userId: string,
  sourceType: "note" | "file",
  sourceId: string,
  text: string
) {
  await supabase.from("chunks").delete().eq("source_type", sourceType).eq("source_id", sourceId);
  const pieces = chunkText(text);
  if (!pieces.length) return;

  const vectors = await embed(pieces, "document");
  const rows = pieces.map((content, i) => ({
    user_id: userId,
    source_type: sourceType,
    source_id: sourceId,
    content,
    embedding: vectors[i],
  }));
  await supabase.from("chunks").insert(rows);
}
