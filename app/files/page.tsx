import { createClient } from "@/lib/supabase/server";
import FileUploader from "@/components/FileUploader";

export default async function FilesPage() {
  const supabase = await createClient();
  const { data: files } = await supabase.from("files").select("*").order("created_at", { ascending: false });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">PDFs & files</h1>
      <FileUploader />
      <div className="space-y-2">
        {(files ?? []).map((f) => (
          <div key={f.id} className="card">
            <div className="flex items-center justify-between">
              <span className="text-sm">📎 {f.name}</span>
              <span className="text-xs text-gray-500">{(f.size / 1024).toFixed(0)} KB</span>
            </div>
            {f.extracted_text && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{f.extracted_text}</p>
            )}
          </div>
        ))}
        {!files?.length && <p className="text-sm text-gray-500">Nothing uploaded yet.</p>}
      </div>
    </div>
  );
}
