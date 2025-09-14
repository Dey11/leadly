import he from "he";

export function cleanText(text: string): string {
  if (!text) return "";

  // decode HTML entities
  text = he.decode(text);

  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`+/g, "")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    .replace(/^>+/gm, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/[\u200B\u00A0]/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
