import { describeImage } from "@/lib/claude";

/** Extracts plain text from an uploaded file: pdf-parse for PDFs, Claude vision for images. */
export async function extractFileText(buffer: Buffer, mime: string): Promise<string> {
  if (mime === "application/pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text.trim();
  }
  if (mime.startsWith("image/")) {
    return describeImage(buffer.toString("base64"), mime);
  }
  if (mime.startsWith("text/")) {
    return buffer.toString("utf-8");
  }
  return "";
}
