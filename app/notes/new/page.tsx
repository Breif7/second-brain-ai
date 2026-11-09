import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function NewNotePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: note, error } = await supabase
    .from("notes")
    .insert({ user_id: user.id, title: "Untitled" })
    .select("id")
    .single();
  if (error || !note) redirect("/");

  redirect(`/notes/${note.id}`);
}
