import mammoth from "mammoth";
import pdf from "pdf-parse";

export async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    const data = await pdf(buffer);
    return cleanText(data.text);
  }

  if (name.endsWith(".docx")) {
    const res = await mammoth.extractRawText({ buffer });
    return cleanText(res.value);
  }

  throw new Error("Format non supporté. Utilise PDF ou DOCX.");
}

function cleanText(text: string) {
  return text
    .replace(/\u0000/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
