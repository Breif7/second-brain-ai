"use client";

import { useState } from "react";

type Turn = { question: string; answer: string };

const QUICK_ACTIONS = ["Summarize this", "Turn this into an action plan", "What can I improve here?"];

export default function AssistantPanel({ scopeNoteId, placeholder }: { scopeNoteId?: string; placeholder?: string }) {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(q: string) {
    if (!q.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, scopeNoteId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not answer that");
      setTurns((t) => [...t, { question: q, answer: data.answer }]);
      setQuestion("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card flex flex-col h-full">
      <h2 className="font-semibold mb-3">✨ Assistant</h2>

      {scopeNoteId && (
        <div className="flex flex-wrap gap-1 mb-3">
          {QUICK_ACTIONS.map((a) => (
            <button key={a} onClick={() => ask(a)} disabled={busy} className="text-xs bg-bg border border-border rounded-full px-2 py-1 hover:border-accent">
              {a}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto space-y-3 mb-3">
        {turns.map((t, i) => (
          <div key={i} className="text-sm">
            <div className="text-gray-400 mb-1">You: {t.question}</div>
            <div className="whitespace-pre-wrap">{t.answer}</div>
          </div>
        ))}
        {!turns.length && (
          <p className="text-sm text-gray-500">{placeholder ?? "Ask anything — I'll answer from what you've saved."}</p>
        )}
      </div>

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="flex gap-2"
      >
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question…" className="input" />
        <button disabled={busy} className="bg-accent rounded-lg px-3 text-sm shrink-0">
          {busy ? "…" : "Ask"}
        </button>
      </form>
    </div>
  );
}
