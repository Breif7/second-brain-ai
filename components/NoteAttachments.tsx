type FileRow = { id: string; name: string; mime: string };

export default function NoteAttachments({ files }: { files: FileRow[] }) {
  if (!files.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {files.map((f) => (
        <span key={f.id} className="text-xs bg-bg border border-border rounded-full px-3 py-1">
          📎 {f.name}
        </span>
      ))}
    </div>
  );
}
