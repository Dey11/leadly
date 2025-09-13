import { chromium, Browser, Page } from "playwright";
import type {
  nitterTweet,
  nitterScrapeInput,
  nitterScrapeOutput,
} from "../types/nitter";

export async function scrapeNitter(
  input: nitterScrapeInput
): Promise<nitterTweet[]> {
  const { query, daysAgo } = input;

  const today = new Date();
  const untilDate = today.toISOString().split("T")[0];
  const sinceDate = new Date(today);
  sinceDate.setDate(today.getDate() - daysAgo);
  const sinceDateStr = sinceDate.toISOString().split("T")[0];

  const formattedQuery = encodeURIComponent(query);

  const url = `http://localhost:8080/search?f=tweets&q=${formattedQuery}&since=${sinceDateStr}&until=${untilDate}`;

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    });
    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    if (!response || !response.ok()) {
      throw new Error(
        `Failed to load page: ${response?.status()} ${response?.statusText()}`
      );
    }
    try {
      await page.waitForSelector(".timeline-item, .no-results", {
        timeout: 15000,
      });
    } catch (waitError) {
      // no-op
    }
    const noResults = await page.$(".no-results");
    if (noResults) {
      return [];
    }
    const tweets: nitterTweet[] = await page.evaluate(() => {
      const items = document.querySelectorAll(".timeline-item");
      const result: nitterTweet[] = [];
      items.forEach((item) => {
        const avatarElement = item.querySelector("a.tweet-avatar");
        const user = avatarElement
          ? avatarElement.getAttribute("href") || ""
          : "";
        const contentElement = item.querySelector(".tweet-content");
        const content = contentElement
          ? contentElement.textContent?.trim() || ""
          : "";
        const tweetLinkElement = item.querySelector(".tweet-link");
        const tweetLink = tweetLinkElement
          ? tweetLinkElement.getAttribute("href") || ""
          : "";
        if (content) {
          result.push({
            user,
            content,
            tweetLink,
          });
        }
      });
      return result;
    });
    return tweets;
  } catch (error) {
    console.error("Error scraping Nitter:", error);
    if (
      error instanceof Error &&
      error.message.includes("net::ERR_CONNECTION_REFUSED")
    ) {
      throw new Error(
        "Failed to connect to Nitter. Please ensure Nitter is running on localhost:8080"
      );
    }
    throw new Error(
      `Failed to scrape Nitter: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  } finally {
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  }
}

const result = await scrapeNitter({ query: "elon musk", daysAgo: 7 });
console.log(result);
