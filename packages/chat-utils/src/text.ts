import type { UIMessage } from "ai";

interface TextPart {
  type: "text";
  text: string;
}

function isTextPart(part: { type: string }): part is TextPart {
  return part.type === "text";
}

export function extractTextFromUIMessage(message: UIMessage): string {
  return message.parts.filter(isTextPart).map((part) => part.text).join("");
}

