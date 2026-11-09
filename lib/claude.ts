import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** Answers a question using retrieved chunks, citing which note/file each excerpt came from. */
export async function answerFromChunks(
  question: string,
  chunks: { label: string; content: string }[]
) {
  const context = chunks.map((c, i) => `[${i + 1}] from "${c.label}":\n${c.content}`).join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `Answer the question using ONLY the excerpts below from the user's notes and files. Cite sources inline like [1], [2]. If a summary or action plan is requested, structure it clearly. If the excerpts don't answer the question, say so honestly.

Question: ${question}

Excerpts:
${context}`,
      },
    ],
  });
  return message.content.find((b) => b.type === "text")?.text ?? "";
}

/** OCR/description for an uploaded image, used so photographed notes become searchable text. */
export async function describeImage(base64: string, mediaType: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType as any, data: base64 } },
          { type: "text", text: "Transcribe all readable text in this image. If it's a photo rather than a document, describe it in a few sentences instead." },
        ],
      },
    ],
  });
  return message.content.find((b) => b.type === "text")?.text ?? "";
}
