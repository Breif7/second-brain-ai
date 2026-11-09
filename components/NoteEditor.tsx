"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NoteEditor({
  noteId,
  initialTitle,
  initialContent,
}: {
  noteId: string;
  initialTitle: string;
  initialContent: any;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing…" }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: initialContent,
    editorProps: { attributes: { class: "prose prose-invert max-w-none" } },
  });

  async function save() {
    if (!editor) return;
    setStatus("saving");
    await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content_json: editor.getJSON(),
        content_text: editor.getText(),
      }),
    });
    setStatus("saved");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          className="text-2xl font-semibold bg-transparent outline-none flex-1"
          placeholder="Untitled"
        />
        <span className="text-xs text-gray-500">
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : ""}
        </span>
      </div>
      <div className="card" onBlur={save}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
