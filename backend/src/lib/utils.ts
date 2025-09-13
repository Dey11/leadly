export function cleanText(text: string): string {
  if (!text) return "";

  return (
    text
      // decode HTML entities
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // remove Markdown links [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // remove inline code/backticks
      .replace(/`+/g, "")
      // remove bold/italics markers (*, **, _, __)
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
      // remove blockquotes ">"
      .replace(/^>+/gm, "")
      // remove extra newlines/whitespace
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}
