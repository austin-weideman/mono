const DEFAULT_TITLE = "New Conversation";
const MAX_WORDS = 10;

export function generateTitleFromText(text: string): string {
  const words = text.trim().split(/\s+/);
  const firstWords = words.slice(0, MAX_WORDS).join(" ");
  return firstWords || DEFAULT_TITLE;
}

