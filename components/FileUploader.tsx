"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function FileUploader({ noteId }: { noteId?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      if (noteId) form.append("note_id", noteId);
      const res = await fetch("/api/files", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="inline-flex items-center gap-2 text-xs bg-bg border border-border rounded-lg px-3 py-1.5 cursor-pointer hover:border-accent">
        📎 {busy ? "Processing…" : "Attach PDF / image / text"}
        <input ref={inputRef} type="file" accept=".pdf,image/*,text/*" className="hidden" onChange={onChange} disabled={busy} />
      </label>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
