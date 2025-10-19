import axios from "axios";
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

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options: any,
  retries = 3,
  timeout = 10000
) {
  let retryDelay = 1000;
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { ...options, timeout });
    } catch (err: any) {
      if (err.code === "ETIMEDOUT" && i < retries - 1) {
        await delay(retryDelay);
        retryDelay *= 2;
        continue;
      }
      throw err;
    }
  }
}
